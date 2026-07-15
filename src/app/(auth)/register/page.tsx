'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'
import { generateSlug } from '@/lib/utils'
import { Mail, Lock, User, Building2, Eye, EyeOff, Loader2, Sparkles, ArrowRight, CheckCircle, Quote } from 'lucide-react'

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '1M+', label: 'Conversations' },
  { value: '<2s', label: 'Response Time' },
  { value: '94%', label: 'Resolution' },
]

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    })
    if (authError) { toast.error(authError.message); setLoading(false); return }
    if (!authData.user) { toast.error('Failed to create account'); setLoading(false); return }

    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id, email, full_name: name,
    })
    if (userError) { toast.error('Failed to create profile'); setLoading(false); return }

    const slug = generateSlug(companyName)
    const { data: org, error: orgError } = await supabase.from('organizations').insert({
      name: companyName, slug, company_size: companySize,
    }).select().single()
    if (orgError) { toast.error('Failed to create organization'); setLoading(false); return }

    await supabase.from('memberships').insert({ user_id: authData.user.id, organization_id: org.id, role: 'client_admin' })
    await supabase.from('ai_agents').insert({ organization_id: org.id, name: `${companyName} Assistant` })
    await supabase.from('widget_settings').insert({ organization_id: org.id })

    toast.success('Account created! Check your email to confirm.')
    router.push('/login')
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 size-[400px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 size-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v2H24v-2h12zM36 24v2H24v-2h12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SupportAI</span>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white leading-tight mb-3">
                Start your free trial
              </h2>
              <p className="text-base text-blue-200/70 leading-relaxed">
                No credit card required. Full access to all features for 14 days.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-white/5">
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-blue-300/60 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="border-t border-white/10 pt-5">
              <Quote className="h-4 w-4 text-blue-400/50 mb-1.5" />
              <p className="text-sm text-blue-200/60 italic leading-relaxed">
                &ldquo;The lead capture feature alone paid for itself within the first month.&rdquo;
              </p>
              <p className="text-xs text-blue-300/50 mt-2">— Marcus Rivera, GrowthPad</p>
            </div>
          </div>

          <p className="text-sm text-blue-300/40">&copy; {new Date().getFullYear()} SupportAI</p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-background dark:via-background dark:to-background">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo & brand */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="size-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">SupportAI</span>
            </Link>
            <p className="text-sm text-muted-foreground">Start your 14-day free trial — no credit card needed</p>
          </div>

          <div className="text-center mb-7">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">Create your account</h1>
            <p className="text-sm text-muted-foreground">Start your 14-day free trial</p>
          </div>

          {/* Social Signup */}
          <div className="flex gap-3 mb-5">
            <Button variant="outline" className="flex-1 h-11 gap-2 text-sm" disabled>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="flex-1 h-11 gap-2 text-sm" disabled>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/></svg>
              Apple
            </Button>
          </div>

          <div className="relative mb-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background dark:bg-background px-2 text-xs text-muted-foreground">
              or sign up with email
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required className="h-11 pl-10 bg-muted/30 border-0 focus-visible:bg-background" placeholder="John Doe" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 pl-10 bg-muted/30 border-0 focus-visible:bg-background" placeholder="you@company.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-11 pl-10 pr-10 bg-muted/30 border-0 focus-visible:bg-background" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="company" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="h-11 pl-10 bg-muted/30 border-0 focus-visible:bg-background" placeholder="Acme Inc." />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size</Label>
              <Select value={companySize} onValueChange={(v: string | null) => v && setCompanySize(v)}>
                <SelectTrigger id="company-size" className="h-11 bg-muted/30 border-0 focus-visible:bg-background">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 employees</SelectItem>
                  <SelectItem value="11-50">11-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201+">201+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...</>
              ) : (
                <><span>Create Account</span> <ArrowRight className="h-4 w-4 ml-1.5" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
