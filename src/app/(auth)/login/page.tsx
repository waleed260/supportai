'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, Sparkles, ArrowRight, Quote, Star, CheckCircle } from 'lucide-react'

const testimonials = [
  { name: 'Sarah Chen', role: 'CEO, TechFlow', text: 'Response times dropped from hours to seconds. Game changer for our team.' },
  { name: 'Marcus Rivera', role: 'Customer Success, GrowthPad', text: 'We\'re converting 3x more website visitors since deploying SupportAI.' },
]

const features = [
  'AI-powered across 6 channels', 'Lead capture automation', 'Smart sentiment analysis',
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setLoading(false)
    toast.success('Welcome back!')
    router.push('/dashboard')
    router.refresh()
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 size-[400px] bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-20 size-[300px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v2H24v-2h12zM36 24v2H24v-2h12z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        <div className="relative flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SupportAI</span>
            </Link>
          </div>

          {/* Content */}
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                AI Customer Support<br />
                <span className="text-blue-300">That Actually Works</span>
              </h2>
              <p className="text-lg text-blue-200/70 max-w-md leading-relaxed">
                Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website — all from one platform.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-200/80">
                  <CheckCircle className="h-4 w-4 text-blue-400 shrink-0" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="border-t border-white/10 pt-6">
              <Quote className="h-5 w-5 text-blue-400/50 mb-2" />
              <p className="text-sm text-blue-200/70 leading-relaxed italic max-w-md">
                &ldquo;{testimonials[0].text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="size-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-xs font-bold text-white">
                  SC
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{testimonials[0].name}</p>
                  <p className="text-xs text-blue-300/60">{testimonials[0].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-blue-300/40">&copy; {new Date().getFullYear()} SupportAI. All rights reserved.</p>
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
            <p className="text-sm text-muted-foreground">AI Customer Support That Actually Works</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Social Login */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 h-11 gap-2 text-sm" disabled>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </Button>
            <Button variant="outline" className="flex-1 h-11 gap-2 text-sm" disabled>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="currentColor"/></svg>
              Apple
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background dark:bg-background px-2 text-xs text-muted-foreground">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 bg-muted/30 border-0 focus-visible:bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-muted-foreground cursor-default">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="h-11 pl-10 pr-10 bg-muted/30 border-0 focus-visible:bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
              ) : (
                <><span>Sign In</span> <ArrowRight className="h-4 w-4 ml-1.5" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
