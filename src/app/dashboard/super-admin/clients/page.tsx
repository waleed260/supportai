'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Organization } from '@/types'

type OrgWithStatus = Organization & { status?: string }

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'outline',
  paused: 'secondary',
  suspended: 'destructive',
}

export default function SuperAdminClients() {
  const [organizations, setOrganizations] = useState<OrgWithStatus[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/actions')
      if (res.ok) setOrganizations(await res.json())
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: 'active' | 'pending' | 'paused' | 'suspended') => {
    const actionMap: Record<string, string> = {
      active: 'approve_client',
      suspended: 'suspend_client',
      pending: 'reopen_client',
    }
    const action = actionMap[status]
    if (!action) return

    const res = await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, target_organization_id: id }),
    })
    if (!res.ok) {
      const err = await res.json()
      toast.error(`Failed: ${err.error || 'Unknown error'}`)
    } else {
      setOrganizations(prev =>
        prev.map(o => o.id === id ? { ...o, status, is_active: status === 'active' } : o)
      )
      toast.success(`Organization ${status}`)
    }
  }

  const pending = organizations.filter(o => o.status === 'pending' || (!o.status && !o.is_active))
  const rest = organizations.filter(o => o.status !== 'pending' && (o.status || o.is_active))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
        <div className="text-sm text-muted-foreground">
          {organizations.length} total · {organizations.filter(o => o.status === 'active' || (!o.status && o.is_active)).length} active
        </div>
      </div>

      {/* Pending Approval */}
      {pending.length > 0 && (
        <Card className="mb-6 border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Approval
              <Badge variant="outline" className="ml-1">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.map(org => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.industry || '—'}</TableCell>
                    <TableCell>{org.company_size || '—'}</TableCell>
                    <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => updateStatus(org.id, 'active')}>
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus(org.id, 'suspended')}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* All Active / Paused / Suspended */}
      <Card>
        <CardHeader>
          <CardTitle>All Organizations ({rest.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rest.map(org => {
                const currentStatus = org.status ?? (org.is_active ? 'active' : 'suspended')
                return (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.industry || '—'}</TableCell>
                    <TableCell>{org.company_size || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[currentStatus] ?? 'outline'}>
                        {currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {org.approved_at ? new Date(org.approved_at).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      {currentStatus !== 'active' && (
                        <Button size="sm" onClick={() => updateStatus(org.id, 'active')}>
                          Activate
                        </Button>
                      )}
                      {currentStatus === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatus(org.id, 'suspended')}
                        >
                          Suspend
                        </Button>
                      )}
                      {currentStatus === 'suspended' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => updateStatus(org.id, 'pending')}
                        >
                          Re-open
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
