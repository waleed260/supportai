import { getDatabase } from './database'
import type { Conversation, Message, Lead, Escalation, SyncQueueItem } from '@supportai/types'

export const conversationRepo = {
  async upsert(conv: Conversation): Promise<void> {
    const db = await getDatabase()
    await db.runAsync(
      `INSERT OR REPLACE INTO conversations (id, organization_id, channel, channel_conversation_id, customer_name, customer_email, customer_phone, status, sentiment, lead_status, assigned_to, escalated_to, escalation_reason, is_sales_mode, message_preview, unread_count, last_activity_at, created_at, updated_at, last_synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [conv.id, conv.organization_id, conv.channel, conv.channel_conversation_id ?? null,
       conv.customer_name ?? null, conv.customer_email ?? null, conv.customer_phone ?? null,
       conv.status, conv.sentiment, conv.lead_status ?? null, conv.assigned_to ?? null,
       conv.escalated_to ?? null, conv.escalation_reason ?? null, conv.is_sales_mode ? 1 : 0,
       conv.message_preview ?? null, conv.unread_count ?? 0, conv.last_activity_at ?? null,
       conv.created_at, conv.updated_at]
    )
  },

  async upsertMany(convs: Conversation[]): Promise<void> {
    for (const conv of convs) {
      await this.upsert(conv)
    }
  },

  async getAll(orgId: string): Promise<Conversation[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync(
      'SELECT * FROM conversations WHERE organization_id = ? ORDER BY last_activity_at DESC',
      [orgId]
    )
    return rows as Conversation[]
  },

  async getById(id: string): Promise<Conversation | null> {
    const db = await getDatabase()
    const row = await db.getFirstAsync('SELECT * FROM conversations WHERE id = ?', [id])
    return row as Conversation | null
  },

  async delete(id: string): Promise<void> {
    const db = await getDatabase()
    await db.runAsync('DELETE FROM conversations WHERE id = ?', [id])
  },
}

export const messageRepo = {
  async upsert(msg: Message): Promise<void> {
    const db = await getDatabase()
    await db.runAsync(
      `INSERT OR REPLACE INTO messages (id, conversation_id, organization_id, role, content, sentiment, confidence_score, metadata, created_at, last_synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [msg.id, msg.conversation_id, msg.organization_id, msg.role, msg.content,
       msg.sentiment ?? null, msg.confidence_score ?? null,
       msg.metadata ? JSON.stringify(msg.metadata) : null, msg.created_at]
    )
  },

  async upsertMany(msgs: Message[]): Promise<void> {
    for (const msg of msgs) {
      await this.upsert(msg)
    }
  },

  async getByConversation(conversationId: string): Promise<Message[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    )
    return rows as Message[]
  },

  async deleteByConversation(conversationId: string): Promise<void> {
    const db = await getDatabase()
    await db.runAsync('DELETE FROM messages WHERE conversation_id = ?', [conversationId])
  },
}

export const leadRepo = {
  async upsert(lead: Lead): Promise<void> {
    const db = await getDatabase()
    await db.runAsync(
      `INSERT OR REPLACE INTO leads (id, organization_id, conversation_id, name, email, phone, product_interest, budget, source, status, assigned_to, synced_to_crm, notes, score, created_at, updated_at, last_synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [lead.id, lead.organization_id, lead.conversation_id ?? null, lead.name ?? null,
       lead.email ?? null, lead.phone ?? null, lead.product_interest ?? null,
       lead.budget ?? null, lead.source ?? null, lead.status, lead.assigned_to ?? null,
       lead.synced_to_crm ? 1 : 0, lead.notes ?? null, lead.score ?? null,
       lead.created_at, lead.updated_at ?? null]
    )
  },

  async getAll(orgId: string): Promise<Lead[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync(
      'SELECT * FROM leads WHERE organization_id = ? ORDER BY created_at DESC',
      [orgId]
    )
    return rows as Lead[]
  },
}

export const escalationRepo = {
  async upsert(esc: Escalation): Promise<void> {
    const db = await getDatabase()
    await db.runAsync(
      `INSERT OR REPLACE INTO escalations (id, conversation_id, organization_id, triggered_by, reason, conversation_summary, issue_summary, resolved_by, resolved_at, status, created_at, last_synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [esc.id, esc.conversation_id, esc.organization_id, esc.triggered_by,
       esc.reason ?? null, esc.conversation_summary ?? null, esc.issue_summary ?? null,
       esc.resolved_by ?? null, esc.resolved_at ?? null, esc.status ?? 'open', esc.created_at]
    )
  },

  async getAll(orgId: string): Promise<Escalation[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync(
      'SELECT * FROM escalations WHERE organization_id = ? ORDER BY created_at DESC',
      [orgId]
    )
    return rows as Escalation[]
  },
}

export const syncQueueRepo = {
  async push(op: Omit<SyncQueueItem, 'id' | 'created_at' | 'updated_at' | 'status' | 'retry_count'>): Promise<void> {
    const db = await getDatabase()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db.runAsync(
      `INSERT INTO pending_operations (id, operation, table_name, record_id, payload, status, retry_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?)`,
      [id, op.operation, op.table, op.record_id, JSON.stringify(op.payload), now, now]
    )
  },

  async getPending(): Promise<SyncQueueItem[]> {
    const db = await getDatabase()
    const rows = await db.getAllAsync(
      'SELECT * FROM pending_operations WHERE status = ? ORDER BY created_at ASC LIMIT 50',
      ['pending']
    )
    return (rows as any[]).map(r => ({
      ...r,
      payload: JSON.parse(r.payload),
    })) as SyncQueueItem[]
  },

  async markCompleted(id: string): Promise<void> {
    const db = await getDatabase()
    await db.runAsync("UPDATE pending_operations SET status = 'completed', updated_at = datetime('now') WHERE id = ?", [id])
  },

  async markFailed(id: string, error: string): Promise<void> {
    const db = await getDatabase()
    await db.runAsync(
      "UPDATE pending_operations SET status = 'failed', error = ?, retry_count = retry_count + 1, updated_at = datetime('now') WHERE id = ?",
      [error, id]
    )
  },

  async removeCompleted(): Promise<void> {
    const db = await getDatabase()
    await db.runAsync("DELETE FROM pending_operations WHERE status IN ('completed', 'failed') AND created_at < datetime('now', '-7 days')")
  },
}
