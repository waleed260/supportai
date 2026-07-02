# Vercel Doctor — Project Status

**Generated:** 2026-07-02T07:42:00Z  
**Project:** supportai  
**Organization:** httpsgithubcomwaleed260codedebugger  
**Latest Deployment:** https://supportai-qd4tr0azl-httpsgithubcomwaleed260codedebugger.vercel.app  
**Status:** ● Ready (Production)  
**Created:** 3 minutes ago  
**Deployment ID:** dpl_J9G6MMiEwA7kGJmykCyCmoSpTjrW

---

## 📦 Monorepo Detected
- ✅ `turbo.json` present - Turborepo monorepo configuration active

---

## 🚀 Recent Deployments (Last 14)

| Age | Status | Target | URL |
|-----|--------|--------|-----|
| 2m | ● Ready | Production | supportai-qd4tr0azl |
| 18m | ● Ready | Production | supportai-rhqnk12h3 |
| 3d | ● Ready | Production | supportai-b4h9kp3rf |
| 3d | ● Ready | Production | supportai-lvodbjcud |
| 3d | ● Ready | Production | supportai-bgy2jcy6h |
| 3d | ● Ready | Production | supportai-2xej4ti9h |
| 3d | ● Ready | Production | supportai-6xm4n355s |
| 3d | ⚠️ Error | Production | supportai-lhthnj92y |
| 3d | ● Ready | Production | supportai-dwgaa63wo |
| 5d | ● Ready | Production | supportai-937adkipi |
| 5d | ● Ready | Production | supportai-1lgh38r1d |
| 5d | ● Ready | Production | supportai-5yp58cf7b |
| 5d | ● Ready | Preview | supportai-12snhd54a |
| 5d | ● Ready | Production | supportai-78vkhrjgf |

**Summary:** 13 successful deployments, 1 failed (3 days ago)

---

## 🌐 Production Aliases

- https://supportai-pi.vercel.app (Primary)
- https://supportai-httpsgithubcomwaleed260codedebugger.vercel.app
- https://supportai-git-main-httpsgithubcomwaleed260codedebugger.vercel.app

---

## 🔐 Environment Variables

| Environment | Count |
|-------------|-------|
| Production | 13 |
| Preview | 12 |
| Development | 0 |

**Variables Present:**
- ENCRYPTION_KEY
- WHATSAPP_TOKEN, WHATSAPP_VERIFY_TOKEN
- META_MESSAGING_APP_SECRET, META_MESSAGING_APP_ID
- META_APP_SECRET, META_APP_ID
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENROUTER_API_KEY, OPENAI_API_KEY
- NEXT_PUBLIC_APP_URL

---

## 🌍 Custom Domains

**Count:** 0  
**Status:** No custom domains configured. Using Vercel-provided domains.

---

## ⚙️ Configuration Highlights (vercel.json)

- **Framework:** Next.js
- **Build Command:** `next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Function Timeouts
| Route | Max Duration |
|-------|-------------|
| `/api/chat/route.ts` | 30s |
| `/api/webchat/route.ts` | 30s |
| `/api/knowledge/process/route.ts` | 60s |
| `/api/knowledge/upload/route.ts` | 60s |
| `/api/webhooks/whatsapp/route.ts` | 30s |
| `/api/webhooks/instagram/route.ts` | 30s |
| `/api/webhooks/facebook/route.ts` | 30s |
| `/api/cron/export/route.ts` | 300s |

### Cron Jobs
- **Path:** `/api/cron/export`
- **Schedule:** `0 6 * * *` (Daily at 6:00 AM UTC)

---

## 🏗️ Latest Build Details

**Deployment:** dpl_J9G6MMiEwA7kGJmykCyCmoSpTjrW  
**Build Time:** ~2 minutes  
**Framework:** Next.js with Middleware  
**Regions:** bom1, fra1, gru1, iad1, lhr1, sfo1, sin1, syd1 (8 regions)

### Build Artifacts
- Middleware: 130.79KB (edge network, 8 regions)
- Index page: 4.48MB (serverless, iad1)
- Global error pages: 4.48MB (serverless, iad1)
- +313 additional output items

---

## 📊 Observability Status

### Drains
⚠️ **Status:** Not checked (requires Pro plan or API access)  
**Recommendation:** Check drain status via Vercel Dashboard if on Pro+ plan

### Analytics Instrumentation
- ❌ `@vercel/analytics` - NOT INSTALLED
- ❌ `@vercel/speed-insights` - NOT INSTALLED

**Impact:** No Web Analytics or Speed Insights data collection

### Drain Signature Verification
- ⚠️ Cannot verify `DRAIN_SECRET` presence (requires drain configuration check)

---

## ⚠️ Issues & Recommendations

### 🔴 Critical
1. **One Failed Deployment (3 days ago)**
   - URL: supportai-lhthnj92y
   - Action: Review logs with `vercel logs <url>` to identify root cause

### 🟡 Warnings
1. **Missing Analytics Instrumentation**
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```
   Then add to your root layout:
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   import { SpeedInsights } from '@vercel/speed-insights/next'
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
           <SpeedInsights />
         </body>
       </html>
     )
   }
   ```

2. **No Custom Domains**
   - Currently using Vercel-provided domains only
   - Action: Configure custom domain via Dashboard if needed

3. **No Development Environment Variables**
   - Pull local env vars with: `vercel env pull`

### 🟢 Good
- ✅ All recent deployments successful (except 1 old error)
- ✅ Comprehensive environment variable configuration
- ✅ Function timeouts properly configured
- ✅ Cron job configured for daily exports
- ✅ Multi-region edge deployment (8 regions)
- ✅ Recent deployment (2 minutes ago) is healthy

---

## 📋 Next Steps

1. **Install Analytics** (Recommended)
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```

2. **Pull Environment Variables** (for local development)
   ```bash
   vercel env pull .env.local
   ```

3. **Investigate Failed Deployment** (if needed)
   ```bash
   vercel logs https://supportai-lhthnj92y-httpsgithubcomwaleed260codedebugger.vercel.app
   ```

4. **Upgrade Vercel CLI** (recommended)
   ```bash
   npm i -g vercel@latest
   ```
   Current: v54.0.0 → Latest: v54.18.0

---

## 🔗 Quick Links

- **Dashboard:** https://vercel.com/httpsgithubcomwaleed260codedebugger/supportai
- **Production URL:** https://supportai-pi.vercel.app
- **Deployments:** https://vercel.com/httpsgithubcomwaleed260codedebugger/supportai/deployments
- **Settings:** https://vercel.com/httpsgithubcomwaleed260codedebugger/supportai/settings

---

**Status:** ✅ Project is healthy and deploying successfully
