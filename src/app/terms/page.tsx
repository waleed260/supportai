import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">SupportAI</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 19, 2026</p>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using SupportAI, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">2. Description of Service</h2>
            <p>SupportAI provides an AI-powered customer support platform that enables businesses to deploy intelligent agents across multiple messaging channels including WhatsApp, Instagram, Facebook Messenger, and web chat.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials, ensuring your use of the service complies with applicable laws, and not using the platform for any illegal or unauthorized purpose.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">4. Billing and Payments</h2>
            <p>Paid plans are billed monthly or annually as selected. Cancellation takes effect at the end of the current billing period. Refunds are handled per our refund policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">5. Limitation of Liability</h2>
            <p>SupportAI is provided &quot;as is&quot; without warranty of any kind. We are not liable for damages arising from use of the service, including but not limited to data loss or business interruption.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">6. Termination</h2>
            <p>We may suspend or terminate access for violations of these terms. Upon termination, your data will be deleted within 30 days unless required otherwise by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-3">7. Contact</h2>
            <p>For questions about these terms, contact legal@supportai.app.</p>
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
