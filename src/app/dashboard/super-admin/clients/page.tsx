'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Organization } from '@/types'

export default function SuperAdminClients() {
  const [organizations, setOrganizations] = useState<(Organization & { user_count?: number })[]>([])

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
      if (data) setOrganizations(data)
    }
    fetch()
  }, [])

  const approveOrg = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('organizations').update({ is_active: true }).eq('id', id)
    if (error) { toast.error('Failed to approve') } else {
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_active: true } : o))
      toast.success('Organization approved')
    }
  }

  const suspendOrg = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('organizations').update({ is_active: false }).eq('id', id)
    if (error) { toast.error('Failed to suspend') } else {
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_active: false } : o))
      toast.success('Organization suspended')
    }
  }

  const pending = organizations.filter(o => !o.is_active)
  const active = organizations.filter(o => o.is_active)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
      </div>

      {pending.length > 0 && (
        <Card className="mb-6 border-amber-200">
          <CardHeader><CardTitle>Pending Approval ({pending.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
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
                    <TableCell>{org.industry || '-'}</TableCell>
                    <TableCell>{org.company_size || '-'}</TableCell>
                    <TableCell>{new Date(org.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="sm" onClick={() => approveOrg(org.id)}>Approve</Button>
                      <Button variant="outline" size="sm" onClick={() => suspendOrg(org.id)}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>All Organizations ({active.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {active.map(org => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.industry || '-'}</TableCell>
                  <TableCell>{org.company_size || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => suspendOrg(org.id)}>
                      Suspend
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
