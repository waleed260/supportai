'use client'

import Link from 'next/link'
import { useInView } from '@/hooks/use-in-view'

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
    { label: 'Documentation', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
}

export function LandingFooter() {
  const { ref, inView } = useInView(0.1)

  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div ref={ref} className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div className={`md:col-span-1 ${inView ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="text-xl font-bold text-primary mb-4" style={{ fontFamily: 'var(--font-syne)' }}>
              SupportAI
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              AI-powered customer support platform. Automate support, capture leads, and delight customers across every channel.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links], i) => (
            <div key={title} className={`${inView ? `animate-fade-in-up delay-${(i + 1) * 100}` : 'opacity-0'}`}>
              <h4 className="font-semibold text-sm mb-4 text-foreground" style={{ fontFamily: 'var(--font-syne)' }}>{title}</h4>
              <ul className="space-y-3" role="list">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={`border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${inView ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SupportAI. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-muted-foreground" aria-label="Legal links">
            <Link href="/privacy" className="hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm transition-colors">Security</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
