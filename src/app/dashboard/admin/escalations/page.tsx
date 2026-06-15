'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { AlertTriangle, CheckCircle, UserCheck } from 'lucide-react'
import type { Escalation } from '@/types'

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<(Escalation & { conversation?: { customer_name: string; channel: string; customer_email: string; sentiment: string } })[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)
  const [filter, setFilter] = useState('open')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUserId(session.user.id)
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      setOrgId(membership.organization_id)
      fetchEscalations(membership.organization_id)
    }
    init()
  }, [])

  const fetchEscalations = async (oid: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('escalations')
      .select('*, conversation:conversations(customer_name, channel, customer_email, sentiment)')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
    if (data) setEscalations(data)
  }

  const resolveEscalation = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('escalations').update({
      resolved_by: userId,
      resolved_at: new Date().toISOString(),
    }).eq('id', id)

    if (error) toast.error('Failed to resolve')
    else {
      const { data: esc } = await supabase.from('escalations').select('conversation_id').eq('id', id).single()
      if (esc) {
        await supabase.from('conversations').update({ status: 'active' }).eq('id', esc.conversation_id)
      }
      toast.success('Escalation resolved')
      if (orgId) fetchEscalations(orgId)
    }
  }

  const filtered = filter === 'all' ? escalations : filter === 'open'
    ? escalations.filter(e => !e.resolved_at)
    : escalations.filter(e => e.resolved_at)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Escalations</h2>
        <Select value={filter} onValueChange={(v: string | null) => v && setFilter(v)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="all">All</SelectItem>
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
                <TableHead>Reason</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(esc => (
                <TableRow key={esc.id}>
                  <TableCell className="font-medium">{esc.conversation?.customer_name || 'Unknown'}</TableCell>
                  <TableCell><Badge variant="outline">{esc.conversation?.channel || '-'}</Badge></TableCell>
                  <TableCell className="max-w-xs truncate">{esc.reason || '-'}</TableCell>
                  <TableCell><Badge variant="secondary">{esc.triggered_by}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={esc.conversation?.sentiment === 'negative' || esc.conversation?.sentiment === 'frustrated' ? 'destructive' : 'secondary'}>
                      {esc.conversation?.sentiment || '-'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(esc.created_at)}</TableCell>
                  <TableCell>
                    {!esc.resolved_at ? (
                      <Button size="sm" variant="default" onClick={() => resolveEscalation(esc.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" />Resolve
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-green-600">Resolved</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No escalations found
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
