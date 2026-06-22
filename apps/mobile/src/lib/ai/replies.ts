import { supabase } from '../supabase'

interface SmartReply {
  text: string
  confidence: number
}

export async function getSmartReplies(conversationId: string, context?: string): Promise<SmartReply[]> {
  try {
    const { data, error } = await supabase.functions.invoke('smart-replies', {
      body: { conversation_id: conversationId, context },
    })
    if (error) throw error
    return data.replies ?? []
  } catch {
    return [
      { text: 'Let me look into that for you.', confidence: 0.9 },
      { text: 'I can help you with that.', confidence: 0.85 },
      { text: 'Let me transfer you to a specialist.', confidence: 0.7 },
    ]
  }
}

export async function getConversationSummary(conversationId: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('conversation-summary', {
      body: { conversation_id: conversationId },
    })
    if (error) throw error
    return data.summary ?? ''
  } catch {
    return ''
  }
}

export async function translateMessage(content: string, targetLanguage: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { content, target_language: targetLanguage },
    })
    if (error) throw error
    return data.translated ?? content
  } catch {
    return content
  }
}

export async function searchConversations(orgId: string, query: string): Promise<{ conversation_id: string; relevance: number }[]> {
  try {
    const { data, error } = await supabase.functions.invoke('search-conversations', {
      body: { organization_id: orgId, query },
    })
    if (error) throw error
    return data.results ?? []
  } catch {
    return []
  }
}
