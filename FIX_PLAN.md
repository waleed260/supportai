# SupportAI UI & Code Fix Plan

**Generated:** 2026-07-02T07:32:46.553Z

## Executive Summary

✅ **UI Audit Results:** All pages return 200 status, no console errors, no network errors, no broken images
⚠️ **Code Issues Found:** 2 critical errors, 6 warnings, 1 configuration issue

---

## Priority 1: Critical Errors (BLOCKING)

### 1.1 React Ref Access During Render
**File:** `apps/mobile/src/components/Skeleton.tsx:21`
**Issue:** Accessing `opacity.current` during render violates React rules
**Impact:** Component will not update as expected, potential render bugs
**Fix:** Use Animated.Value directly without accessing .current during render

```tsx
// BEFORE (WRONG):
style={{ opacity: opacity.current }}

// AFTER (CORRECT):
style={{ opacity: opacity }}
```

**Estimated Time:** 2 minutes

---

## Priority 2: Configuration Issues

### 2.1 Missing packageManager Field
**File:** `package.json`
**Issue:** Turbo requires packageManager field for workspace resolution
**Impact:** Cannot run typecheck command, blocks CI/CD
**Fix:** Add packageManager field to root package.json

```json
"packageManager": "npm@10.0.0"
```

**Estimated Time:** 1 minute

---

## Priority 3: Code Quality Warnings

### 3.1 Anonymous Default Export
**File:** `apps/mobile/app.config.ts:1`
**Issue:** Arrow function exported anonymously
**Fix:** Assign to variable before exporting

### 3.2 Require Style Imports
**Files:** 
- `apps/mobile/metro.config.js:1`
- `apps/mobile/metro.config.js:2`
**Issue:** Using require() instead of ES6 imports
**Fix:** Convert to import statements where possible

### 3.3 Unused Variables
**Files:**
- `apps/mobile/src/components/ErrorBoundary.tsx:2` - Platform unused
- `apps/mobile/src/db/sync/syncEngine.ts:1` - leadRepo, escalationRepo unused
**Fix:** Remove unused imports

### 3.4 Any Types
**Files:**
- `apps/mobile/src/db/repository.ts:143`
- `apps/mobile/src/hooks/useNotificationHandler.ts:6`
**Issue:** Using `any` type reduces type safety
**Fix:** Replace with proper TypeScript types

---

## Priority 4: Next.js Deprecation Warning

### 4.1 Middleware Convention Deprecated
**Issue:** The "middleware" file convention is deprecated
**Recommendation:** Migrate to "proxy" convention
**Documentation:** https://nextjs.org/docs/messages/middleware-to-proxy
**Impact:** Low (still works, but will break in future Next.js versions)
**Estimated Time:** 30 minutes (research + implementation)

---

## Execution Order

1. Fix critical React ref error (Priority 1.1)
2. Add packageManager field (Priority 2.1)
3. Fix ESLint warnings (Priority 3.1-3.4)
4. Address middleware deprecation (Priority 4.1) - OPTIONAL

**Total Estimated Time:** 15-45 minutes

---

## Testing Strategy

After each fix:
1. Run `npm run lint` to verify warnings resolved
2. Run `npm run typecheck` to verify no TypeScript errors
3. Run Playwright tests to ensure no regressions
4. Test mobile app on simulator/device

---

## Notes

- UI is in EXCELLENT condition - no runtime errors detected
- All pages load successfully with proper auth protection
- Code quality issues are minor and easily fixable
- No security vulnerabilities found in audit
