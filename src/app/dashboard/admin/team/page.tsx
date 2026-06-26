'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import type { Membership, User } from '@/types'

export default function TeamPage() {
  const { membership } = useAuthContext()
  const [team, setTeam] = useState<(Membership & { user?: User })[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>('team_member')

  useEffect(() => {
    if (!membership) return
    const fetchTeam = async () => {
      const res = await fetch('/api/memberships')
      if (res.ok) setTeam(await res.json())
    }
    fetchTeam()
  }, [membership])

  const inviteMember = async () => {
    if (!membership || !inviteEmail) return

    const res = await fetch('/api/memberships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })

    if (res.status === 404) {
      toast.error('User not found')
      return
    }

    if (!res.ok) {
      toast.error('Failed to add member')
    } else {
      toast.success('Team member added!')
      setInviteOpen(false)
      setInviteEmail('')
      const member = await res.json()
      setTeam(prev => [...prev, member])
    }
  }

  const removeMember = async (id: string) => {
    const res = await fetch(`/api/memberships?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Member removed')
      setTeam(prev => prev.filter(m => m.id !== id))
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button variant="default"><Plus className="h-4 w-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={inviteRole} onValueChange={(v: string | null) => v && setInviteRole(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_admin">Admin</SelectItem>
                    <SelectItem value="team_member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={inviteMember} className="w-full">Add Member</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Team ({team.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.user?.full_name || 'Unknown'}</TableCell>
                  <TableCell>{m.user?.email}</TableCell>
                  <TableCell>
                    <Badge variant={m.role === 'client_admin' ? 'default' : 'secondary'}>
                      {m.role === 'client_admin' ? 'Admin' : 'Team Member'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeMember(m.id)}>
                      <Trash2 className="h-4 w-4" />
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
