'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setDark(isDark)
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl animate-fade-in">
      <div className="flex items-center justify-between px-6 py-3 rounded-full border border-white/20 dark:border-white/10 bg-white/80 dark:bg-[#121824]/80 backdrop-blur-xl shadow-lg shadow-orange-500/5">
        <Link href="/" className="text-xl font-bold" style={{ fontFamily: 'var(--font-syne)' }}>
          <span className="bg-gradient-to-r from-[#f57c00] to-amber-500 bg-clip-text text-transparent">
            SupportAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-[#121824] dark:hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleDark}
            className="p-2 rounded-full text-muted-foreground hover:text-[#121824] dark:hover:text-white hover:bg-orange-50 dark:hover:bg-white/10 transition-colors"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link href="/register"><Button size="sm" className="rounded-full">Get Started</Button></Link>
        </div>

        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-[#121824]/90 backdrop-blur-xl p-4 md:hidden shadow-xl">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-[#121824] dark:hover:text-white px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-white/10 transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-t dark:border-white/10" />
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-[#121824] dark:hover:text-white hover:bg-orange-50 dark:hover:bg-white/10 transition-colors"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <hr className="border-t dark:border-white/10" />
            <Link href="/login"><Button variant="ghost" className="w-full" size="sm">Sign In</Button></Link>
            <Link href="/register"><Button className="w-full rounded-full" size="sm">Get Started</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
