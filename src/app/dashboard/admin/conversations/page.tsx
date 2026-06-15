'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, getStatusColor, getSentimentColor } from '@/lib/utils'
import { Search, MessageSquare, MoreHorizontal } from 'lucide-react'
import type { Conversation } from '@/types'

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      setOrgId(membership.organization_id)
      fetchConversations(membership.organization_id)
    }
    init()
  }, [])

  const fetchConversations = async (orgId: string) => {
    const supabase = createClient()
    let query = supabase.from('conversations').select('*').eq('organization_id', orgId).order('updated_at', { ascending: false })
    const { data } = await query
    if (data) setConversations(data)
  }

  const filtered = conversations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.customer_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Conversations</h2>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v: string | null) => v && setFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{c.customer_name || 'Anonymous'}</TableCell>
                  <TableCell><Badge variant="outline">{c.channel}</Badge></TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className={getSentimentColor(c.sentiment)}>{c.sentiment}</TableCell>
                  <TableCell>{c.lead_status || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.updated_at)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No conversations found
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
