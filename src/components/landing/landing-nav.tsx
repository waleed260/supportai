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
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl animate-fade-in" role="navigation" aria-label="Main navigation">
      <div className="flex items-center justify-between px-6 py-3 rounded-sm border border-white/20 dark:border-white/10 bg-background/80 backdrop-blur-xl shadow-lg shadow-primary/5">
        <Link
          href="/"
          className="text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            SupportAI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xs text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
          >
            {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
          <Link href="/register"><Button size="sm" className="rounded-xs">Get Started</Button></Link>
        </div>

        <button
          className="md:hidden p-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div className="mt-2 rounded-xs border border-white/20 dark:border-white/10 bg-background/90 backdrop-blur-xl p-4 md:hidden shadow-xl" role="menu">
          <div className="flex flex-col gap-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xs px-3 py-2 hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-t border-border" />
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-2 rounded-xs text-sm text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {dark ? 'Light Mode' : 'Dark Mode'}
            </button>
            <hr className="border-t border-border" />
            <Link href="/login"><Button variant="ghost" className="w-full" size="sm">Sign In</Button></Link>
            <Link href="/register"><Button className="w-full rounded-xs" size="sm">Get Started</Button></Link>
          </div>
        </div>
      )}
    </nav>
  )
}
