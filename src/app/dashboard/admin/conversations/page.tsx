'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { useRealtimeSubscription } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, getStatusColor, getSentimentColor } from '@/lib/utils'
import { Search, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Conversation } from '@/types'

export default function AdminConversationsPage() {
  const { membership } = useAuthContext()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const totalPages = Math.ceil(total / pageSize)

  const fetchConversations = useCallback(async (orgId: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
      const res = await fetch(`/api/conversations?${params}`)
      if (res.ok) {
        const json = await res.json()
        setConversations(json.data)
        setTotal(json.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  useEffect(() => {
    if (!membership) return
    fetchConversations(membership.organization_id)
  }, [membership, fetchConversations])

  useRealtimeSubscription({
    table: 'conversations',
    filter: membership ? `organization_id=eq.${membership.organization_id}` : undefined,
    callback: useCallback(() => {
      if (membership) fetchConversations(membership.organization_id)
    }, [membership, fetchConversations]),
    deps: [membership],
  })

  const filtered = conversations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search && !c.customer_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6">
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
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/admin/conversations/${c.id}`} className="flex items-center gap-2 hover:underline">
                      {c.customer_name || 'Anonymous'}
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  </TableCell>
                  <TableCell><Badge variant="outline">{c.channel}</Badge></TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className={getSentimentColor(c.sentiment)}>{c.sentiment}</TableCell>
                  <TableCell>{c.lead_status || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.updated_at)}</TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
