'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
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
  const { membership } = useAuthContext()
  const [leads, setLeads] = useState<(Lead & { conversation?: { customer_name: string; channel: string } })[]>([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!membership) return
    fetchLeads(membership.organization_id)
  }, [membership])

  const fetchLeads = async (_oid: string) => {
    const res = await fetch('/api/leads')
    if (res.ok) {
      const json = await res.json()
      setLeads(json.data)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) toast.error('Failed to update')
    else {
      toast.success(`Lead marked as ${status}`)
      if (membership) fetchLeads(membership.organization_id)
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
