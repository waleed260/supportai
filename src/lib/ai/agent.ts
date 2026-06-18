import OpenAI from 'openai'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'
import { syncLeadToCrm } from '@/lib/integrations/crm'
import { cachedQuery, cacheDel } from '@/lib/cache'

function getOpenRouter() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'SupportAI',
    },
  })
}

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
- Detect the customer's language and respond in the same language. Mirror their tone and vocabulary.

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
  return cachedQuery(
    `agent_config:${organizationId}`,
    300,
    async () => {
      const supabase = await createServiceRoleClient()
      const { data: agent } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('organization_id', organizationId)
        .single()
      return agent
    },
  )
}

export async function invalidateAgentConfig(organizationId: string) {
  await cacheDel(`agent_config:${organizationId}`)
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

export async function getCustomerHistory(organizationId: string, channelConversationId: string) {
  const supabase = await createServiceRoleClient()

  const { data: pastConvos } = await supabase.from('conversations')
    .select('id, status, sentiment, created_at')
    .eq('organization_id', organizationId)
    .eq('channel_conversation_id', channelConversationId)
    .neq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!pastConvos || pastConvos.length === 0) return []

  const histories = await Promise.all(
    pastConvos.map(async (convo) => {
      const { data: msgs } = await supabase.from('messages')
        .select('role, content')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: true })
        .limit(6)

      if (!msgs || msgs.length === 0) return null

      const customerMsg = msgs.find(m => m.role === 'customer')?.content?.slice(0, 200) || ''
      return `[Past conversation from ${new Date(convo.created_at).toLocaleDateString()}] Status: ${convo.status}, Sentiment: ${convo.sentiment}. Customer said: "${customerMsg}"`
    })
  )

  return histories.filter(Boolean)
}

export async function analyzeSentiment(text: string): Promise<string> {
  try {
    const response = await getOpenRouter().chat.completions.create({
      model: 'anthropic/claude-3-haiku',
      max_tokens: 10,
      messages: [
        { role: 'system', content: 'Analyze the sentiment of this customer message. Respond with exactly one word: positive, neutral, negative, frustrated, or high_risk.' },
        { role: 'user', content: text },
      ],
    })
    const sentiment = response.choices[0]?.message?.content?.trim().toLowerCase() || 'neutral'
    const valid = ['positive', 'neutral', 'negative', 'frustrated', 'high_risk']
    return valid.includes(sentiment) ? sentiment : 'neutral'
  } catch {
    return 'neutral'
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
  channelConversationId?: string
}) {
  const { organizationId, message, history, agentConfig, conversationId, channelConversationId } = params

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

  let memoryContext = ''
  if (channelConversationId) {
    const customerHistory = await getCustomerHistory(organizationId, channelConversationId)
    if (customerHistory.length > 0) {
      memoryContext = `\n\nThis customer has interacted with us before. Past context:\n${customerHistory.join('\n')}`
    }
  }

  const model = process.env.ANTHROPIC_MODEL || 'anthropic/claude-3.5-sonnet'

  const response = await getOpenRouter().chat.completions.create({
    model,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT + personalitySection + knowledgeContext + memoryContext },
      ...history.slice(-10).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ],
  })

  const text = response.choices[0]?.message?.content || ''
  const shouldEscalate = text.includes('[ESCALATE]')
  const leadData = text.includes('[LEAD]')

  const sentiment = agentConfig?.sentiment_analysis_enabled
    ? await analyzeSentiment(message)
    : 'neutral'

  const supabase = await createServiceRoleClient()

  if (shouldEscalate) {
    const reason = text.match(/\[ESCALATE\](.*?)(?:\n|$)/)?.[1]?.trim() || 'AI triggered escalation'
    await supabase.from('conversations').update({ status: 'escalated', sentiment, escalation_reason: reason }).eq('id', conversationId)
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
        await supabase.from('conversations').update({ lead_status: 'warm' }).eq('id', conversationId)
        await syncLeadToCrm(organizationId, leadInfo)
      } catch {}
    }
  }

  const cleanText = text
    .replace(/\[ESCALATE\].*?(\n|$)/g, '')
    .replace(/\[LEAD\].*?(\n|$)/g, '')
    .trim()

  return {
    text: cleanText,
    sentiment,
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

export async function storeSentiment(params: {
  conversationId: string
  organizationId: string
  sentiment: string
}) {
  const supabase = await createServiceRoleClient()
  await supabase.from('conversations')
    .update({ sentiment: params.sentiment as any, updated_at: new Date().toISOString() })
    .eq('id', params.conversationId)
}
