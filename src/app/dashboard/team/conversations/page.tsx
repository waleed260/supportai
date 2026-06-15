'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, getStatusColor, getSentimentColor } from '@/lib/utils'
import { MessageSquare, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { Conversation } from '@/types'

export default function TeamConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      const { data } = await supabase.from('conversations')
        .select('*').eq('organization_id', membership.organization_id)
        .in('status', ['active', 'escalated', 'waiting'])
        .order('updated_at', { ascending: false })
      if (data) setConversations(data)
    }
    init()
  }, [])

  const takeOver = async (conversationId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('conversations')
      .update({ assigned_to: userId, status: 'active' }).eq('id', conversationId)
    if (error) toast.error('Failed to take over')
    else {
      toast.success('Conversation assigned to you!')
      setConversations(prev => prev.filter(c => c.id !== conversationId))
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Open Conversations</h2>
      <Card>
        <CardHeader><CardTitle>Waiting for Response</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.customer_name || 'Anonymous'}</TableCell>
                  <TableCell><Badge variant="outline">{c.channel}</Badge></TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className={getSentimentColor(c.sentiment)}>{c.sentiment}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.updated_at)}</TableCell>
                  <TableCell>
                    <Button size="sm" onClick={() => takeOver(c.id)}>
                      <UserCheck className="h-4 w-4 mr-1" />Take Over
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {conversations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No open conversations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
