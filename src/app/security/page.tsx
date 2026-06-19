import Link from 'next/link'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">SupportAI</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Security</h1>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Responsible Disclosure</h2>
            <p className="text-muted-foreground">
              If you discover a security vulnerability in SupportAI, please report it privately to 
              <a href="mailto:security@supportai.app" className="text-primary hover:underline ml-1">security@supportai.app</a>.
              We will acknowledge receipt within 48 hours and work to resolve the issue promptly.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Encrypted Communication</h2>
            <p className="text-muted-foreground">
              For sensitive disclosures, please encrypt your message using our 
              <Link href="/.well-known/pgp-key.txt" className="text-primary hover:underline ml-1">PGP key</Link>.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Safe Browsing Review</h2>
            <p className="text-muted-foreground">
              If you are a site owner requesting a Safe Browsing review after fixing security issues,
              submit directly at:
            </p>
            <a
              href="https://safebrowsing.google.com/safebrowsing/report_error/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-primary hover:underline"
            >
              https://safebrowsing.google.com/safebrowsing/report_error/
            </a>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Security Headers</h2>
            <p className="text-muted-foreground">
              This site implements the following security headers:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>X-Frame-Options: SAMEORIGIN</li>
              <li>X-Content-Type-Options: nosniff</li>
              <li>Referrer-Policy: strict-origin-when-cross-origin</li>
              <li>X-XSS-Protection: 1; mode=block</li>
              <li>Permissions-Policy: restricted</li>
              <li>Strict-Transport-Security (via Vercel)</li>
            </ul>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto px-4 flex justify-center gap-6">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/security" className="hover:underline">Security</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <p className="mt-4">&copy; {new Date().getFullYear()} SupportAI. All rights reserved.</p>
      </footer>
    </div>
  )
}
