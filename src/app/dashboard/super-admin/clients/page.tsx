'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { Search, Building2, Users, Globe, Calendar, CircleDollarSign, CheckCircle2 } from 'lucide-react'
import type { Organization } from '@/types'

type OrgWithStatus = Organization & { status?: string }

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'outline',
  paused: 'secondary',
  suspended: 'destructive',
}

const tabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'suspended', label: 'Suspended' },
]

export default function SuperAdminClients() {
  const [organizations, setOrganizations] = useState<OrgWithStatus[]>([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [selected, setSelected] = useState<OrgWithStatus | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/actions')
      if (res.ok) setOrganizations(await res.json())
    }
    load()
  }, [])

  const updateStatus = async (org: OrgWithStatus, status: 'active' | 'pending' | 'paused' | 'suspended') => {
    const actionMap: Record<string, string> = {
      active: 'approve_client',
      suspended: 'suspend_client',
      pending: 'reopen_client',
    }
    const action = actionMap[status]
    if (!action) return

    setUpdating(org.id)
    const res = await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target_organization_id: org.id }),
    })
    setUpdating(null)
    if (!res.ok) {
      const err = await res.json()
      toast.error(`Failed: ${err.error || 'Unknown error'}`)
      return
    }

    const updated = { ...org, status, is_active: status === 'active' }
    setOrganizations(prev => prev.map(o => o.id === org.id ? updated : o))
    setSelected(updated)
    toast.success(`Organization ${status}`)
  }

  const effectiveStatus = (o: OrgWithStatus) => o.status ?? (o.is_active ? 'active' : 'pending')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return organizations.filter(o => {
      if (tab !== 'all' && effectiveStatus(o) !== tab) return false
      if (!q) return true
      return (
        o.name.toLowerCase().includes(q) ||
        (o.website || '').toLowerCase().includes(q) ||
        (o.industry || '').toLowerCase().includes(q)
      )
    })
  }, [organizations, search, tab])

  const countFor = (value: string) =>
    value === 'all'
      ? organizations.length
      : organizations.filter(o => effectiveStatus(o) === value).length

  const current = selected ? effectiveStatus(selected) : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
        <div className="text-sm text-muted-foreground">
          {organizations.length} total · {organizations.filter(o => effectiveStatus(o) === 'active').length} active
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {tabs.map(t => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
                <span className="ml-1.5 text-xs text-muted-foreground">{countFor(t.value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Building2 className="h-10 w-10" />
            <p className="text-base font-medium text-foreground">No clients found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border shadow-xs">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium">Company</th>
                    <th className="px-4 py-3 text-left font-medium">Industry</th>
                    <th className="px-4 py-3 text-left font-medium">Size</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Approved</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(org => {
                    const status = effectiveStatus(org)
                    return (
                      <tr
                        key={org.id}
                        onClick={() => setSelected(org)}
                        className="cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                              {org.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              {org.website && <p className="text-xs text-muted-foreground">{org.website}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{org.industry || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{org.company_size || '—'}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[status] ?? 'outline'}>{status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {org.approved_at ? new Date(org.approved_at).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Sheet open={!!selected} onOpenChange={open => { if (!open) setSelected(null) }}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                    {selected.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <SheetTitle>{selected.name}</SheetTitle>
                    {selected.website && (
                      <SheetDescription className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {selected.website}
                      </SheetDescription>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <Badge variant={statusVariant[current] ?? 'outline'} className="capitalize">
                    {current}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> Industry
                    </p>
                    <p className="mt-1 font-medium">{selected.industry || '—'}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> Company Size
                    </p>
                    <p className="mt-1 font-medium">{selected.company_size || '—'}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" /> Registered
                    </p>
                    <p className="mt-1 font-medium">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                    </p>
                    <p className="mt-1 font-medium">
                      {selected.approved_at ? new Date(selected.approved_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleDollarSign className="h-3.5 w-3.5" /> Plan
                  </p>
                  <p className="mt-1 font-medium">{selected.is_active ? 'Active subscription' : '—'}</p>
                </div>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {current !== 'active' && (
                    <Button size="sm" disabled={updating === selected.id} onClick={() => updateStatus(selected, 'active')}>
                      {current === 'pending' ? 'Approve' : 'Activate'}
                    </Button>
                  )}
                  {current === 'active' && (
                    <Button variant="outline" size="sm" disabled={updating === selected.id} onClick={() => updateStatus(selected, 'suspended')}>
                      Suspend
                    </Button>
                  )}
                  {current === 'suspended' && (
                    <Button variant="secondary" size="sm" disabled={updating === selected.id} onClick={() => updateStatus(selected, 'pending')}>
                      Re-open
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
