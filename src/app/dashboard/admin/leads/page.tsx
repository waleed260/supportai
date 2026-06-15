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
import { UserPlus, Phone, Mail, ExternalLink } from 'lucide-react'
import type { Lead } from '@/types'

export default function LeadsPage() {
  const [leads, setLeads] = useState<(Lead & { conversation?: { customer_name: string; channel: string } })[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (!membership) return
      setOrgId(membership.organization_id)
      fetchLeads(membership.organization_id)
    }
    init()
  }, [])

  const fetchLeads = async (oid: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('leads')
      .select('*, conversation:conversations(customer_name, channel)')
      .eq('organization_id', oid)
      .order('created_at', { ascending: false })
    if (data) setLeads(data)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('leads').update({ status }).eq('id', id)
    if (error) toast.error('Failed to update')
    else {
      toast.success(`Lead marked as ${status}`)
      if (orgId) fetchLeads(orgId)
    }
  }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-gray-100 text-gray-500',
    }
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Leads</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{leads.length} total</span>
          <Select value={filter} onValueChange={(v: string | null) => v && setFilter(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product Interest</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                      {lead.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {lead.email && <div className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3" />{lead.email}</div>}
                      {lead.phone && <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{lead.phone}</div>}
                    </div>
                  </TableCell>
                  <TableCell>{lead.product_interest || '-'}</TableCell>
                  <TableCell>{lead.budget || '-'}</TableCell>
                  <TableCell>{lead.source || 'web_chat'}</TableCell>
                  <TableCell>{statusBadge(lead.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
                  <TableCell>
                    <Select defaultValue={lead.status} onValueChange={(v: string | null) => v && updateStatus(lead.id, v)}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">No leads found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
