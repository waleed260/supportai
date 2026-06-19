import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/apple-touch-icon.svg" color="#000000" />
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
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
