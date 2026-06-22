import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#fff7ed] via-background to-amber-50 dark:from-background dark:via-background dark:to-[#1a1f2e] w-full">
      <div className="absolute inset-0 opacity-50 dark:opacity-70 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-48 -right-48 w-96 h-96 rounded-full bg-primary/20 blur-3xl animate-gradient-shift" />
        <div className="absolute -bottom-48 -left-48 w-[30rem] h-[30rem] rounded-full bg-amber-400/15 blur-3xl animate-gradient-shift-slow" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-orange-400/15 blur-3xl animate-gradient-shift-fast" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.95)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(18,24,32,0.95)_100%)] pointer-events-none" aria-hidden="true" />
      <Link
        href="/"
        className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-6 sm:-translate-x-0 text-lg sm:text-xl font-bold z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xs"
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
