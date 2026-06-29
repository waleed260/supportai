import Anthropic from '@anthropic-ai/sdk'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'
import { syncLeadToCrm } from '@/lib/integrations/crm'
import { cachedQuery, cacheDel } from '@/lib/cache'

type ProviderMessage = { role: 'system' | 'user' | 'assistant'; content: string }

async function callAI(messages: ProviderMessage[], model: string, maxTokens: number): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
  const response = await client.messages.create({
    model: model.replace('anthropic/', ''),
    max_tokens: maxTokens,
    system: messages.find(m => m.role === 'system')?.content || '',
    messages: messages.filter(m => m.role !== 'system') as Anthropic.MessageParam[],
  })
  return response.content.map(b => b.type === 'text' ? b.text : '').join('')
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

export async function detectLanguage(text: string): Promise<string> {
  try {
    const content = await callAI(
      [
        { role: 'system', content: 'Detect the language of this message. Respond with exactly the ISO 639-1 language code (e.g., "en", "es", "fr", "de", "ar", "zh", "ja", "ko", "pt", "ru", "it", "nl", "tr", "vi", "th"). Default to "en" if unsure.' },
        { role: 'user', content: text.slice(0, 500) },
      ],
      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
       10,
    )
    const lang = content.trim().toLowerCase()
    return /^[a-z]{2}$/.test(lang) ? lang : 'en'
  } catch {
    return 'en'
  }
}

export async function analyzeSentiment(text: string): Promise<string> {
  try {
    const content = await callAI(
      [
        { role: 'system', content: 'Analyze the sentiment of this customer message. Respond with exactly one word: positive, neutral, negative, frustrated, or high_risk.' },
        { role: 'user', content: text },
      ],
      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
       10,
    )
    const sentiment = content.trim().toLowerCase()
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
    model?: string
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

  const detectedLanguage = await detectLanguage(message)
  const languageContext = `\n\nThe customer's language code is: ${detectedLanguage}. Always respond in this language.`

  const model = params.agentConfig?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

  const text = await callAI(
    [
      { role: 'system', content: SYSTEM_PROMPT + personalitySection + knowledgeContext + memoryContext + languageContext },
      ...history.slice(-10).map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message },
    ],
    model,
    1024,
  )
  const shouldEscalate = text.includes('[ESCALATE]')
  const leadData = text.includes('[LEAD]')

  const sentiment = agentConfig?.sentiment_analysis_enabled
    ? await analyzeSentiment(message)
    : 'neutral'

  const supabase = await createServiceRoleClient()
  try { await supabase.from('conversations').update({ language: detectedLanguage }).eq('id', conversationId) } catch {}

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
