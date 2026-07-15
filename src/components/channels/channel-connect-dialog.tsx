'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, Check, Loader2, ExternalLink, Info, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { ConversationChannel } from '@/types'

interface ChannelFormData {
  credentials: Record<string, string>
  config: Record<string, string>
}

interface ChannelField {
  key: string
  label: string
  type: string
  inCredentials: boolean
  inConfig: boolean
  placeholder: string
}

const CHANNEL_CONFIGS: Record<string, { title: string; description: string; docsUrl: string; fields: ChannelField[]; webhookPath: string }> = {
  whatsapp: {
    title: 'Connect WhatsApp Business',
    description: 'Enter your WhatsApp Business API credentials from Meta Business Manager.',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/api/settings',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', inCredentials: true, inConfig: true, placeholder: '123456789012345' },
      { key: 'waba_id', label: 'WhatsApp Business Account ID', type: 'text', inCredentials: true, inConfig: false, placeholder: '123456789012345' },
      { key: 'access_token', label: 'Permanent Access Token', type: 'password', inCredentials: true, inConfig: false, placeholder: 'EAAx...' },
    ],
    webhookPath: '/api/webhooks/whatsapp',
  },
  instagram: {
    title: 'Connect Instagram',
    description: 'Enter your Instagram Business Account credentials from Meta Business Manager.',
    docsUrl: 'https://developers.facebook.com/docs/instagram-api/getting-started',
    fields: [
      { key: 'business_account_id', label: 'Instagram Business Account ID', type: 'text', inCredentials: false, inConfig: true, placeholder: '123456789012345' },
      { key: 'access_token', label: 'Access Token', type: 'password', inCredentials: true, inConfig: false, placeholder: 'IGQVJ...' },
    ],
    webhookPath: '/api/webhooks/instagram',
  },
  facebook: {
    title: 'Connect Facebook Messenger',
    description: 'Enter your Facebook Page credentials from Meta Business Manager.',
    docsUrl: 'https://developers.facebook.com/docs/messenger-platform/guides/setup',
    fields: [
      { key: 'page_id', label: 'Page ID', type: 'text', inCredentials: false, inConfig: true, placeholder: '123456789012345' },
      { key: 'access_token', label: 'Page Access Token', type: 'password', inCredentials: true, inConfig: false, placeholder: 'EAAx...' },
    ],
    webhookPath: '/api/webhooks/facebook',
  },
}

const META_CHANNELS = new Set(['whatsapp', 'instagram', 'facebook'])

interface ChannelConnectDialogProps {
  channel: ConversationChannel
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected: () => void
  orgId?: string
  userId?: string
}

export function ChannelConnectDialog({ channel, open, onOpenChange, onConnected, orgId, userId }: ChannelConnectDialogProps) {
  const config = CHANNEL_CONFIGS[channel as keyof typeof CHANNEL_CONFIGS]
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)
  const isMetaChannel = META_CHANNELS.has(channel)

  if (!config) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const generatedWebhookUrl = `${baseUrl}${config.webhookPath}`

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    for (const field of config.fields) {
      const val = formValues[field.key] || ''
      if (!val.trim()) {
        newErrors[field.key] = `${field.label} is required`
      } else if (field.key === 'access_token' && val.trim().length < 20) {
        newErrors[field.key] = 'Token must be at least 20 characters'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setServerError(null)

    const credentials: Record<string, string> = {}
    const configPayload: Record<string, string> = {}

    for (const field of config.fields) {
      const val = formValues[field.key] || ''
      if (field.inCredentials) credentials[field.key] = val
      if (field.inConfig) configPayload[field.key] = val
    }

    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          name: config.title,
          credentials,
          config: configPayload,
          webhook_url: generatedWebhookUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || data.error?.[0]?.message || 'Failed to connect channel')
      }

      setSuccess(true)
      toast.success(`${config.title} connected successfully!`)
      onConnected()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to connect channel'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedWebhookUrl)
      setCopied(true)
      toast.success('Webhook URL copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setFormValues({})
      setErrors({})
      setServerError(null)
      setSuccess(false)
      setCopied(false)
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); else onOpenChange(o) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{success ? `${config.title} — Connected` : config.title}</DialogTitle>
          <DialogDescription>{success ? 'Your channel has been configured.' : config.description}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Connection successful. Copy this webhook URL into your Meta Developer Console to start receiving messages.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input value={generatedWebhookUrl} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Webhook Verify Token</Label>
              <Input value="supportai_verify_2026" readOnly className="font-mono text-xs" />
            </div>
            <p className="text-xs text-muted-foreground">
              Configure this webhook URL as the callback URL in your Meta app with the verify token above.
            </p>
            <Button onClick={handleClose} className="w-full">Done</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            {isMetaChannel && (
              <>
                <Button
                  variant="default"
                  className="w-full gap-2"
                  onClick={() => {
                    if (!orgId) {
                      toast.error('Session required. Please refresh and try again.')
                      return
                    }
                    window.location.href = `/api/auth/meta?channel=${channel}&org_id=${orgId}`
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Connect with Facebook
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or enter credentials manually</span>
                  </div>
                </div>
              </>
            )}

            {config.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formValues[field.key] || ''}
                  onChange={(e) => {
                    setFormValues(prev => ({ ...prev, [field.key]: e.target.value }))
                    if (errors[field.key]) setErrors(prev => ({ ...prev, [field.key]: '' }))
                  }}
                  className={errors[field.key] ? 'border-destructive' : ''}
                />
                {errors[field.key] && (
                  <p className="text-xs text-destructive">{errors[field.key]}</p>
                )}
              </div>
            ))}

            <div className="rounded-sm border border-border bg-muted/30 p-3">
              <a
                href={config.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                How to find these credentials in Meta Business Manager
              </a>
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
