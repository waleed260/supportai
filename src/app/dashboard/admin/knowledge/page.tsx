'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Upload, FileText, Globe, Trash2, Loader2 } from 'lucide-react'
import type { KnowledgeSource } from '@/types'

export default function KnowledgeBasePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadType, setUploadType] = useState<string>('pdf')
  const [uploadName, setUploadName] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)

  const fetchSources = useCallback(async (oid: string) => {
    const supabase = createClient()
    const { data } = await supabase.from('knowledge_sources')
      .select('*').eq('organization_id', oid).order('created_at', { ascending: false })
    if (data) setSources(data)
  }, [])

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: membership } = await supabase.from('memberships')
        .select('organization_id').eq('user_id', session.user.id).limit(1).single()
      if (membership) {
        setOrgId(membership.organization_id)
        fetchSources(membership.organization_id)
      }
    }
    init()
  }, [fetchSources])

  const handleUpload = async () => {
    if (!orgId || !uploadName) return

    if (uploadType === 'website' && !uploadUrl) {
      toast.error('Please enter a website URL')
      return
    }

    if (uploadType !== 'website' && !uploadFile) {
      toast.error('Please select a file')
      return
    }

    setProcessing(true)

    if (uploadType === 'website') {
      const supabase = createClient()
      const { data: source, error } = await supabase.from('knowledge_sources').insert({
        organization_id: orgId,
        name: uploadName,
        type: 'website',
        source_url: uploadUrl,
        status: 'pending',
      }).select().single()

      if (error) {
        toast.error('Failed to create source')
        setProcessing(false)
        return
      }

      const res = await fetch('/api/knowledge/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ knowledge_source_id: source.id }),
      })

      if (res.ok) {
        toast.success('Website processed successfully')
      } else {
        toast.error('Failed to process website')
      }
    } else {
      const formData = new FormData()
      formData.append('file', uploadFile!)
      formData.append('organization_id', orgId)
      formData.append('name', uploadName)
      formData.append('type', uploadType)

      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        toast.error('Upload failed')
        setProcessing(false)
        return
      }

      const { knowledge_source_id } = await res.json()

      const processForm = new FormData()
      processForm.append('knowledge_source_id', knowledge_source_id)
      processForm.append('file', uploadFile!)

      await fetch('/api/knowledge/process', {
        method: 'POST',
        body: processForm,
      })
    }

    setProcessing(false)
    setUploadOpen(false)
    setUploadName('')
    setUploadUrl('')
    setUploadFile(null)
    if (orgId) fetchSources(orgId)
  }

  const deleteSource = async (id: string) => {
    if (!orgId) return
    const supabase = createClient()
    await supabase.from('knowledge_sources').delete().eq('id', id)
    toast.success('Deleted')
    fetchSources(orgId)
  }

  const processSource = async (source: KnowledgeSource) => {
    setProcessing(true)
    const res = await fetch('/api/knowledge/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledge_source_id: source.id }),
    })
    if (res.ok) {
      toast.success('Processing complete')
      if (orgId) fetchSources(orgId)
    } else {
      toast.error('Processing failed')
    }
    setProcessing(false)
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'processing': return 'secondary'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Knowledge Base</h2>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger render={<Button variant="default"><Upload className="h-4 w-4 mr-2" />Add Source</Button>}>
            Add Source
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Knowledge Source</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <Select value={uploadType} onValueChange={(v: string | null) => v && setUploadType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="docx">DOCX Document</SelectItem>
                    <SelectItem value="txt">Text File</SelectItem>
                    <SelectItem value="website">Website URL</SelectItem>
                    <SelectItem value="faq">FAQ Import</SelectItem>
                    <SelectItem value="product_catalog">Product Catalog</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="e.g., Product FAQ 2024" />
              </div>
              {uploadType === 'website' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Website URL</label>
                  <Input value={uploadUrl} onChange={e => setUploadUrl(e.target.value)} placeholder="https://example.com/page" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">File</label>
                  <Input type="file" accept={`.${uploadType}`} onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                </div>
              )}
              <Button onClick={handleUpload} className="w-full" disabled={processing}>
                {processing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</> : 'Add & Process'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>Knowledge Sources</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Chunks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {s.type === 'website' ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      {s.type}
                    </div>
                  </TableCell>
                  <TableCell>{s.chunk_count}</TableCell>
                  <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="flex gap-1">
                    {s.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => processSource(s)} disabled={processing}>
                        Process
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => deleteSource(s.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No knowledge sources yet. Add a document or website to train your AI agent.
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
