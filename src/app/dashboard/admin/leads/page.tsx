'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { UserPlus, Mail, Phone, Search, Target, Users, UserCheck, TrendingUp, MessageSquare, Globe, Calendar, FolderOpen } from 'lucide-react'
import type { Lead } from '@/types'

type LeadWithConversation = Lead & { conversation?: { customer_name: string; channel: string } }

const FILTERS = ['all', 'new', 'qualified', 'converted', 'lost'] as const
type Filter = typeof FILTERS[number]

const statusBadgeClass: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-gray-100 text-gray-500',
}

const statusLabel: Record<string, string> = {
  new: 'New',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
}

export default function LeadsPage() {
  const { membership } = useAuthContext()
  const [leads, setLeads] = useState<LeadWithConversation[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    const res = await fetch('/api/leads')
    if (res.ok) {
      const json = await res.json()
      setLeads(json.data)
      setSelectedId(prev => {
        if (prev && json.data.some((l: Lead) => l.id === prev)) return prev
        return json.data[0]?.id ?? null
      })
    }
  }, [])

  useEffect(() => {
    if (!membership) return
    let cancelled = false
    fetch('/api/leads')
      .then(res => (res.ok ? res.json() : null))
      .then(json => {
        if (cancelled || !json) return
        setLeads(json.data)
        setSelectedId(prev => {
          if (prev && json.data.some((l: Lead) => l.id === prev)) return prev
          return json.data[0]?.id ?? null
        })
      })
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [membership])

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch('/api/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) toast.error('Failed to update')
    else {
      toast.success(`Lead marked as ${statusLabel[status] || status}`)
      fetchLeads()
    }
  }

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    converted: leads.filter(l => l.status === 'converted').length,
  }

  const filtered = leads.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      const haystack = [l.name, l.email, l.phone, l.product_interest, l.source].filter(Boolean).join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  const selected = leads.find(l => l.id === selectedId) || null

  const statCards = [
    { label: 'Total', value: stats.total, icon: Users, accent: 'text-primary', bg: 'bg-primary/10' },
    { label: 'New', value: stats.new, icon: UserPlus, accent: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Qualified', value: stats.qualified, icon: Target, accent: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Converted', value: stats.converted, icon: TrendingUp, accent: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Leads</h2>
          <p className="text-sm text-muted-foreground mt-1">Capture and manage leads from your conversations</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {statCards.map(c => {
          const Icon = c.icon
          return (
            <Card key={c.label} className="h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-sm ${c.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${c.accent}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground tabular-nums">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6 bg-muted rounded-sm p-1 w-fit">
        {FILTERS.map(f => {
          const isActive = filter === f
          const count = f === 'all' ? stats.total : leads.filter(l => l.status === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors ${
                isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : statusLabel[f]}
              <span className={`ml-1.5 text-xs tabular-nums ${isActive ? 'text-primary' : 'text-muted-foreground/60'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 rounded-sm border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-1">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="h-[65vh]">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[40vh] text-center p-6">
                      <UserPlus className="h-8 w-8 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No leads found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {filtered.map(lead => {
                        const isActive = selectedId === lead.id
                        return (
                          <button
                            key={lead.id}
                            onClick={() => setSelectedId(lead.id)}
                            className={`w-full text-left px-4 py-3 transition-colors ${
                              isActive ? 'bg-primary/[0.06] border-l-2 border-primary' : 'hover:bg-muted/50 border-l-2 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
                                <span className="text-xs font-semibold text-muted-foreground">
                                  {(lead.name || '?').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {lead.name || 'Unknown'}
                                  </span>
                                  <Badge className={`${statusBadgeClass[lead.status] || 'bg-gray-100 text-gray-800'} shrink-0`}>
                                    {statusLabel[lead.status] || lead.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                  {lead.email || lead.phone || lead.source || 'No contact info'}
                                </div>
                                <div className="text-xs text-muted-foreground/70 mt-0.5">
                                  {formatDate(lead.created_at)}
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <Card className="h-full">
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{selected.name || 'Unknown Lead'}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusBadgeClass[selected.status] || 'bg-gray-100 text-gray-800'}>
                            {statusLabel[selected.status] || selected.status}
                          </Badge>
                          {selected.conversation?.channel && (
                            <Badge variant="outline">{selected.conversation.channel}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select value={selected.status} onValueChange={(v: string | null) => v && updateStatus(selected.id, v)}>
                        <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                    <Field icon={Mail} label="Email" value={selected.email || '—'} />
                    <Field icon={Phone} label="Phone" value={selected.phone || '—'} />
                    <Field icon={FolderOpen} label="Product Interest" value={selected.product_interest || '—'} />
                    <Field icon={Target} label="Budget" value={selected.budget || '—'} />
                    <Field icon={Globe} label="Source" value={selected.source || 'web_chat'} />
                    <Field icon={MessageSquare} label="Conversation" value={selected.conversation?.customer_name || '—'} />
                    <Field icon={UserCheck} label="Assigned To" value={selected.assigned_to || 'Unassigned'} />
                    <Field icon={Calendar} label="Captured" value={formatDate(selected.created_at)} />
                  </div>

                  <Separator />

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-1">Quick actions:</span>
                    {selected.status !== 'qualified' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'qualified')}>
                        Mark Qualified
                      </Button>
                    )}
                    {selected.status !== 'converted' && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'converted')}>
                        Mark Converted
                      </Button>
                    )}
                    {selected.status !== 'lost' && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => updateStatus(selected.id, 'lost')}>
                        Mark Lost
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-[65vh] text-center p-6">
                  <Users className="h-10 w-10 text-muted-foreground/40 mb-4" />
                  <p className="text-sm font-medium text-foreground">Select a lead to view details</p>
                  <p className="text-xs text-muted-foreground mt-1">Choose a lead from the list to see its full profile</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-sm bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground font-medium break-words">{value}</div>
      </div>
    </div>
  )
}
