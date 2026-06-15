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
      const { data } = await supabase.from('organizations').select('*')
      if (data) setOrganizations(data)
    }
    fetch()
  }, [])

  const toggleOrgStatus = async (id: string, current: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from('organizations').update({ is_active: !current }).eq('id', id)
    if (error) { toast.error('Failed to update') } else {
      setOrganizations(prev => prev.map(o => o.id === id ? { ...o, is_active: !current } : o))
      toast.success('Updated')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Clients</h2>
      </div>
      <Card>
        <CardHeader><CardTitle>All Organizations</CardTitle></CardHeader>
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
              {organizations.map(org => (
                <TableRow key={org.id}>
                  <TableCell className="font-medium">{org.name}</TableCell>
                  <TableCell>{org.industry || '-'}</TableCell>
                  <TableCell>{org.company_size || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={org.is_active ? 'default' : 'secondary'}>
                      {org.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => toggleOrgStatus(org.id, org.is_active)}>
                      {org.is_active ? 'Suspend' : 'Activate'}
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
