import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">SupportAI</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 19, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide when creating an account, including your name, email address, and company details. We also collect data from your customers when they interact with the SupportAI chat widget on your website.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve our AI customer support services, process billing, send administrative communications, and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal information. We share data with third-party service providers essential to our platform (Supabase for database hosting, Stripe for payment processing, and AI model providers for inference).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Data Security</h2>
            <p>We implement industry-standard encryption for data in transit (TLS) and at rest. Channel credentials are encrypted using AES-256. Access controls and audit logging are enforced across the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Contact</h2>
            <p>For privacy-related inquiries, contact us at privacy@supportai.app.</p>
          </section>
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
