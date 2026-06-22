'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { AlertCircle, Sparkles, ArrowRight, Building2, Users, User, Mail, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, companyName, companySize }),
    })
    const data = await res.json()

    if (!res.ok) {
      if (res.status === 409 && data.code === 'email_exists') {
        setEmailExists(true)
      } else {
        toast.error(data.error || 'Registration failed')
      }
      setLoading(false)
      return
    }

    toast.success('Account created! A super admin will approve your organization shortly.')
    router.push('/login')
  }

  return (
    <div className="relative z-10 w-full max-w-md mx-auto px-4 py-6">
      <div className="w-full rounded-xs border border-primary/20 bg-background/70 backdrop-blur-xl shadow-2xl shadow-primary/5 animate-fade-in">
        <div className="p-8 pb-0">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs border border-primary/20 bg-muted text-muted-foreground mb-5 text-[11px] font-medium tracking-wide uppercase">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
              Get Started
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-syne)' }}>
              Create your <span className="text-primary">account</span>
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Start your 14-day free trial — no credit card required
            </p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-3.5">
          {emailExists && (
            <Alert variant="destructive" className="rounded-xs py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This email is already registered.{' '}
                <Link href="/login" className="font-medium underline underline-offset-4">
                  Sign in instead
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="h-11 pl-10" placeholder="John Doe" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 pl-10" placeholder="you@company.com" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-11 pl-10" placeholder="Min. 6 characters" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-sm font-medium">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input id="company" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="h-11 pl-10" placeholder="Acme Inc" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="size" className="text-sm font-medium">Size</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" aria-hidden="true" />
                <Select value={companySize} onValueChange={(v: string | null) => v && setCompanySize(v)}>
                  <SelectTrigger className="h-11 pl-10"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 employees</SelectItem>
                    <SelectItem value="11-50">11-50 employees</SelectItem>
                    <SelectItem value="51-200">51-200 employees</SelectItem>
                    <SelectItem value="201+">201+ employees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 gap-2 rounded-xs text-base" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </form>

        <div className="px-8 pb-8 pt-0 text-center space-y-3">
          <div className="border-t border-border/50" />
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs transition-colors">
              Sign in
            </Link>
          </p>
          <p className="text-[11px] text-muted-foreground/50">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
