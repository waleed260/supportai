import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden w-full bg-background">
      <Link
        href="/"
        className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:-translate-x-0 text-lg sm:text-xl font-bold z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
        style={{ fontFamily: 'var(--font-syne)' }}
      >
        <span className="bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
          SupportAI
        </span>
      </Link>
      {children}
    </div>
  )
}
