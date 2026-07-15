import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "iunbuxpozsnmjpydhlsq.supabase.co" },
      { protocol: "https", hostname: "*.gravatar.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/widget.js",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
      },
      {
        source: "/widget/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ]
  },
}

// Dynamically apply Sentry config only when env vars are present
export default async function config() {
  const hasSentryConfig = !!(process.env.SENTRY_DSN && process.env.SENTRY_AUTH_TOKEN)
  
  if (hasSentryConfig) {
    try {
      const { withSentryConfig } = await import('@sentry/nextjs')
      return withSentryConfig(nextConfig, {
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        silent: true,
        telemetry: false,
      })
    } catch {
      console.warn('Sentry config skipped — @sentry/nextjs not available')
    }
  }
  
  return nextConfig
}
