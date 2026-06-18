import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SupportAI - AI Customer Support Platform',
  description: 'Multi-tenant AI-powered customer support and sales platform',
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
      </head>
      <body className={inter.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
