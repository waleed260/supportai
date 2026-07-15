import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">SupportAI</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Email</h2>
            <p className="text-muted-foreground">support@supportai.app</p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Legal</h2>
            <p className="text-muted-foreground">legal@supportai.app</p>
          </div>

          <div className="p-6 bg-white rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Privacy</h2>
            <p className="text-muted-foreground">privacy@supportai.app</p>
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
