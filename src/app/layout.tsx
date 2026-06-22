import type { Metadata } from 'next'
import { Sora, Syne, Satisfy } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' })
const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['600', '700'] })
const satisfy = Satisfy({ subsets: ['latin'], variable: '--font-satisfy', weight: '400' })

export const metadata: Metadata = {
  title: 'SupportAI - AI Customer Support Platform',
  description: 'Multi-tenant AI-powered customer support and sales platform. Deploy AI agents across WhatsApp, Instagram, Facebook, and your website.',
  keywords: ['AI customer support', 'chatbot', 'WhatsApp bot', 'AI agent', 'customer service automation'],
  authors: [{ name: 'SupportAI' }],
  metadataBase: new URL('https://supportai-pi.vercel.app'),
  openGraph: {
    title: 'SupportAI - AI Customer Support Platform',
    description: 'Deploy intelligent AI agents across WhatsApp, Instagram, Facebook, and your website.',
    url: 'https://supportai-pi.vercel.app',
    siteName: 'SupportAI',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`scroll-smooth ${sora.variable} ${syne.variable} ${satisfy.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/apple-touch-icon.svg" color="#f57c00" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'SupportAI',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              description: 'Multi-tenant AI-powered customer support and sales platform. Deploy AI agents across WhatsApp, Instagram, Facebook, and your website.',
              url: 'https://supportai-pi.vercel.app',
              author: {
                '@type': 'Organization',
                name: 'SupportAI',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className={sora.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
