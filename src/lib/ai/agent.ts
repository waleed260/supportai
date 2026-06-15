import Anthropic from '@anthropic-ai/sdk'
import { createServiceRoleClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM_PROMPT = `You are SupportAI, an intelligent customer support and sales agent.
Your role is to help customers with their questions, resolve issues, and capture leads when appropriate.

Guidelines:
- Be helpful, professional, and friendly
- If you detect frustration, respond with empathy
- If a customer asks for a human, request an escalation
- For refund requests, legal issues, or when confidence is low, escalate to a human
- In sales mode, proactively gather lead information (name, email, phone, product interest)
- Always maintain context from previous messages
- Use the knowledge base to answer questions accurately
- When you don't know something, be honest and offer to connect with a human

If you need to escalate, include [ESCALATE] in your response followed by the reason.
If you've captured lead information, include [LEAD] followed by JSON of the data.`

function getPersonalityPrompt(personality: string, tone: string, guidelines?: string, instructions?: string): string {
  const prompts: Record<string, string> = {
    professional: 'Respond in a formal, professional manner. Use proper language and structure.',
    friendly: 'Respond in a warm, approachable manner. Use conversational language.',
    casual: 'Respond in a relaxed, informal manner. Be concise and direct.',
    enthusiastic: 'Respond with high energy and positivity. Show excitement about helping.',
  }
  const tonePrompts: Record<string, string> = {
    formal: 'Use formal language, proper titles, and structured responses.',
    friendly: 'Use warm, conversational language. Be approachable.',
    warm: 'Use caring, empathetic language. Make the customer feel valued.',
    playful: 'Use light-hearted, engaging language. Add personality.',
  }
  return `
Personality: ${prompts[personality] || prompts.friendly}
Tone: ${tonePrompts[tone] || tonePrompts.friendly}
${guidelines ? `Brand Guidelines: ${guidelines}` : ''}
${instructions ? `Custom Instructions: ${instructions}` : ''}`
}

export async function getAgentConfig(organizationId: string) {
  const supabase = await createServiceRoleClient()
  const { data: agent } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('organization_id', organizationId)
    .single()
  return agent
}

export async function getRelevantDocuments(organizationId: string, query: string, limit = 5) {
  const supabase = await createServiceRoleClient()

  const embedding = await generateEmbedding(query)
  if (!embedding) return []

  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit,
    p_organization_id: organizationId,
  })

  return documents || []
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5-20250101',
      max_tokens: 1,
      messages: [{ role: 'user', content: `Generate an embedding for: ${text}` }],
    })
    return null
  } catch {
    return null
  }
}

export async function generateAIResponse(params: {
  organizationId: string
  conversationId: string
  message: string
  history: { role: string; content: string }[]
  agentConfig?: {
    personality?: string
    tone_of_voice?: string
    brand_guidelines?: string
    custom_instructions?: string
    sentiment_analysis_enabled?: boolean
    lead_capture_enabled?: boolean
    sales_mode_enabled?: boolean
  }
}) {
  const { organizationId, message, history, agentConfig, conversationId } = params

  const personalitySection = agentConfig
    ? getPersonalityPrompt(
        agentConfig.personality || 'friendly',
        agentConfig.tone_of_voice || 'friendly',
        agentConfig.brand_guidelines,
        agentConfig.custom_instructions
      )
    : ''

  const relevantDocs = await getRelevantDocuments(organizationId, message)
  const knowledgeContext = relevantDocs.length > 0
    ? `\n\nRelevant knowledge base content:\n${relevantDocs.map((d: { content: string }) => d.content).join('\n---\n')}`
    : ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-5-20250101',
    max_tokens: 1024,
    system: SYSTEM_PROMPT + personalitySection + knowledgeContext,
    messages: [
      ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  const shouldEscalate = text.includes('[ESCALATE]')
  const leadData = text.includes('[LEAD]')

  const supabase = await createServiceRoleClient()

  if (shouldEscalate) {
    const reason = text.match(/\[ESCALATE\](.*?)(?:\n|$)/)?.[1]?.trim() || 'AI triggered escalation'
    await supabase.from('conversations').update({ status: 'escalated', escalation_reason: reason }).eq('id', conversationId)
    await supabase.from('escalations').insert({
      conversation_id: conversationId,
      organization_id: organizationId,
      triggered_by: 'sentiment',
      reason,
    })
  }

  if (leadData) {
    const leadMatch = text.match(/\[LEAD\]\s*(\{.*?\})/s)
    if (leadMatch) {
      try {
        const leadInfo = JSON.parse(leadMatch[1])
        await supabase.from('leads').insert({
          organization_id: organizationId,
          conversation_id: conversationId,
          ...leadInfo,
          status: 'new',
        })
      } catch {}
    }
  }

  const cleanText = text
    .replace(/\[ESCALATE\].*?(\n|$)/g, '')
    .replace(/\[LEAD\].*?(\n|$)/g, '')
    .trim()

  return {
    text: cleanText,
    shouldEscalate,
    leadCaptured: leadData,
  }
}

export async function storeMessage(params: {
  conversationId: string
  organizationId: string
  role: 'customer' | 'assistant' | 'agent' | 'system'
  content: string
  sentiment?: string
  confidenceScore?: number
}) {
  const supabase = await createServiceRoleClient()
  await supabase.from('messages').insert({
    conversation_id: params.conversationId,
    organization_id: params.organizationId,
    role: params.role,
    content: params.content,
    sentiment: params.sentiment || null,
    confidence_score: params.confidenceScore || null,
  })
}
