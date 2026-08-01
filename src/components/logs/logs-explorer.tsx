'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

type AuditRow = {
  id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
  users: { full_name: string | null; email: string | null } | null
  organizations: { name: string } | null
}

type AnalyticsRow = {
  id: string
  event_type: string
  event_data: Record<string, unknown> | null
  created_at: string
  organizations: { name: string } | null
}

type Source = 'all' | 'audit' | 'analytics'

interface LogsExplorerProps {
  scope: 'admin' | 'super_admin'
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString()
}

function formatDetails(details: Record<string, unknown> | null): string {
  if (!details) return '—'
  const text = JSON.stringify(details)
  return text.length > 140 ? `${text.slice(0, 140)}…` : text
}

function ActionBadge({ action }: { action: string }) {
  const tone = action.includes('approve')
    ? 'default'
    : action.includes('suspend') || action.includes('reject')
      ? 'destructive'
      : action.includes('config')
        ? 'secondary'
        : 'outline'
  return <Badge variant={tone as 'default' | 'destructive' | 'secondary' | 'outline'}>{action}</Badge>
}

function EventBadge({ type }: { type: string }) {
  return <Badge variant="outline">{type}</Badge>
}

export function LogsExplorer({ scope }: LogsExplorerProps) {
  const [source, setSource] = useState<Source>('all')
  const [page, setPage] = useState(1)
  const pageSize = 50

  const [audit, setAudit] = useState<AuditRow[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [analyticsTotal, setAnalyticsTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ source, page: String(page), pageSize: String(pageSize) })
      const res = await fetch(`/api/audit/logs?${params}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to load logs')
        return
      }
      setAudit(Array.isArray(json.audit) ? json.audit : [])
      setAnalytics(Array.isArray(json.analytics) ? json.analytics : [])
      setAuditTotal(json.auditTotal ?? 0)
      setAnalyticsTotal(json.analyticsTotal ?? 0)
    } catch {
      setError('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [source, page])

  useEffect(() => {
    const id = setTimeout(() => fetchLogs(), 0)
    return () => clearTimeout(id)
  }, [fetchLogs])

  const total = source === 'audit' ? auditTotal : source === 'analytics' ? analyticsTotal : auditTotal + analyticsTotal
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const rows = source === 'audit' ? audit : source === 'analytics' ? analytics : [...audit, ...analytics]
  const sortedRows = rows.slice().sort((a, b) => {
    const ta = 'created_at' in a ? a.created_at : ''
    const tb = 'created_at' in b ? b.created_at : ''
    return tb.localeCompare(ta)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Logs Explorer</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {scope === 'super_admin'
              ? 'Audit trail and analytics events across all organizations'
              : 'Audit trail and analytics events for your organization'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchLogs()} disabled={loading}>
          <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Tabs value={source} onValueChange={v => { setSource(v as Source); setPage(1) }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Events</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>{source === 'all' ? 'Recent activity' : source === 'audit' ? 'Audit Logs' : 'Analytics Events'}</span>
            <span className="text-sm text-muted-foreground font-normal">{total.toLocaleString()} entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-sm text-destructive py-4">{error}</div>
          ) : sortedRows.length === 0 ? (
            <div className="text-sm text-muted-foreground py-8 text-center">
              No {source === 'analytics' ? 'analytics events' : 'logs'} yet. Activity will appear here as your team uses the platform.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRows.map(row => {
                  const isAudit = 'action' in row
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        {isAudit
                          ? <ActionBadge action={(row as AuditRow).action} />
                          : <EventBadge type={(row as AnalyticsRow).event_type} />}
                      </TableCell>
                      <TableCell>
                        {(isAudit ? (row as AuditRow).organizations?.name : (row as AnalyticsRow).organizations?.name) ?? '—'}
                      </TableCell>
                      <TableCell>
                        {isAudit
                          ? ((row as AuditRow).users?.full_name || (row as AuditRow).users?.email || 'System')
                          : '—'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-mono text-xs">
                        {formatDetails(isAudit ? (row as AuditRow).details : (row as AnalyticsRow).event_data)}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatTime(row.created_at)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          <div className="flex items-center justify-between pt-4">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => p + 1)}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
