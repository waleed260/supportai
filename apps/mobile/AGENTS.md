# SupportAI Mobile Architecture

## Monorepo Structure

```
supportai/
├── apps/
│   ├── web/          # Next.js web dashboard
│   └── mobile/       # Expo React Native app (this)
├── packages/
│   ├── types/        # @supportai/types - shared domain types
│   ├── config/       # @supportai/config - shared config, theme, constants
│   ├── api-client/   # @supportai/api-client - typed API client with services
│   ├── ui/           # @supportai/ui - shared design system components
│   ├── hooks/        # @supportai/hooks - shared React hooks
│   └── auth/         # @supportai/auth - shared auth logic
├── turbo.json        # Build orchestration
└── package.json      # Workspace root
```

## Architecture Overview

### Layer Architecture

```
Screen (UI)
    ↓
Zustand Store (State)
    ↓
Service (API calls via typed client)
    ↓
ApiClient (fetch wrapper with auth, timeout, error handling)
    ↓
Supabase / Next API
```

Offline path:

```
Screen (UI)
    ↓
Service (checks network)
    ↓
Online → ApiClient → Server
Offline → SQLite DB → SyncQueue → ApiClient (when online)
```

## State Management (Zustand)

| Store | Location | Purpose |
|---|---|---|
| `useAuthStore` | `src/stores/authStore.ts` | User, membership, org, biometric |
| `useUIStore` | `src/stores/uiStore.ts` | Theme, filters, unread counts |
| `useNotificationStore` | `src/stores/notificationStore.ts` | Push token, prefs, pending notifs |
| `useSyncStore` | `src/stores/syncStore.ts` | Sync queue, network status |
| `useFeatureStore` | `src/stores/featureStore.ts` | Feature flags |

### Usage Pattern
```ts
import { useAuthStore } from '../stores/authStore'

function Component() {
  const { user, organizationId } = useAuthStore()
}
```

## API Client Layer

All API calls go through typed services in `src/services/api.ts`:

```ts
import { conversationService, messageService } from '../services/api'

// Typed, with automatic auth headers and error tracking
const conversations = await conversationService.list(orgId)
const detail = await conversationService.get(conversationId)
```

Services wrap `@supportai/api-client` which provides:
- Automatic auth token injection
- Request timeout (30s default)
- Error classification (ApiError, NetworkError, TimeoutError)
- Performance tracking via `startMark`/`endMark`
- Sentry error capture on failures

## Offline Database (SQLite via expo-sqlite)

### Schema (`src/db/schema.ts`)
- `conversations` - Full conversation records
- `messages` - Message history
- `leads` - Lead data
- `escalations` - Escalation records
- `users` - User profiles
- `organizations` - Org data
- `pending_operations` - Offline write queue

### Repositories (`src/db/repository.ts`)
- `conversationRepo` - CRUD for conversations
- `messageRepo` - CRUD for messages
- `leadRepo` - CRUD for leads
- `escalationRepo` - CRUD for escalations
- `syncQueueRepo` - Queue management for pending operations

### Sync Engine (`src/db/sync/syncEngine.ts`)
- Processes pending operations queue
- Idempotent (duplicate prevention via record IDs)
- Retry with backoff (3 attempts before marking failed)
- Cleans up completed items after 7 days
- Background sync via expo-background-fetch (every 15 min)

## Design System (`@supportai/ui`)

| Component | Props |
|---|---|
| `Button` | variant, size, loading, icon, disabled |
| `Card` | padded, className |
| `Badge` | label, variant (default/success/warning/destructive/info) |
| `Avatar` | name, imageUrl, size |
| `Skeleton` | className (base), plus presets: InboxSkeleton, ConversationDetailSkeleton, AnalyticsSkeleton |
| `EmptyState` | icon, title, description, actionLabel, onAction |
| `ErrorState` | message, error, onRetry |

All components support NativeWind className prop and have accessibility labels.

## Navigation Architecture

```
Root Stack
├── Auth Stack
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── ResetPassword
├── AwaitingApproval
└── App Stack (role-based)
    ├── super_admin → SuperAdminTabs
    │   ├── Clients
    │   ├── Analytics
    │   └── Settings
    ├── client_admin → ClientAdminTabs
    │   ├── Inbox → InboxStack (InboxList, ConversationDetail)
    │   ├── Escalations → EscalationStack (EscalationsList, ConversationDetail)
    │   ├── Leads → LeadsStack (LeadsList, LeadDetail)
    │   ├── Analytics
    │   └── Settings → SettingsStack (SettingsMain, AgentConfig)
    └── team_member → TeamMemberTabs
        ├── Inbox → InboxStack
        ├── Escalations → EscalationStack
        └── Settings → SettingsStack
```

### Deep Linking
```
supportai://conversation/{id}
supportai://lead/{id}
supportai://analytics
supportai://settings
supportai://escalation/{id}
https://supportai.app/conversation/{id}
```

Configured in `src/navigation/linking/config.ts` with typed param lists in `src/navigation/types.ts`.

## Security

| Feature | File | Notes |
|---|---|---|
| SSL Pinning | `src/security/sslPinning.ts` | Configurable pinned domains |
| Jailbreak Detection | `src/security/jailbreakDetection.ts` | Checks paths, schemes, build tags |
| Biometric Auth | `src/hooks/useBiometricAuth.ts` | Face ID / Fingerprint |
| Secure Storage | expo-secure-store | Refresh tokens, PIN, biometric state |
| Secure Logging | `src/security/secureLogging.ts` | Redacts passwords, tokens, API keys |
| Screenshot Protection | Native (iOS: applicationExitOnSuspend) | Consider react-native-allow-screen-capture toggle |

## Analytics & Monitoring

### `src/analytics/tracker.ts`
- Pluggable provider pattern (PostHog, Firebase, or custom)
- Typed event helpers: `analytics.login()`, `analytics.replySent()`, etc.
- Automatic timestamp attachment

### `src/analytics/sentry.ts`
- Performance tracing (0.2 sample rate)
- Automatic device/OS/version tags
- `setSentryScreen(screenName)` for breadcrumbs
- `captureApiError(endpoint, status, body)` for API failures

## Background Tasks

| Task | Interval | Purpose |
|---|---|---|
| `background-sync` | 15 min | Process pending sync queue |
| `background-auth-refresh` | 30 min | Refresh Supabase auth session |

Register in `App.tsx` via `registerSyncTask()` and `registerRefreshTask()`.

## Performance Budget

| Metric | Target |
|---|---|
| Cold launch | < 2s |
| Warm launch | < 1s |
| Conversation scroll | 60 FPS |
| Animations | 60 FPS |
| Memory usage | < 250 MB |
| Initial bundle | < 30 MB |
| API latency | < 500 ms |

## Feature Flags

Flags are stored in `feature_flags` table per-organization.

```ts
import { isFeatureEnabled, loadFeatureFlags } from '../features'

await loadFeatureFlags(orgId)
if (isFeatureEnabled('realtime')) {
  // enable realtime
}
```

Supported flags: `realtime`, `ai_memory`, `push`, `analytics`, `crm`, `beta_features`

## AI Features (`src/lib/ai/`)

| Feature | Function | File |
|---|---|---|
| Smart replies | `getSmartReplies()` | `replies.ts` |
| Conversation summary | `getConversationSummary()` | `replies.ts` |
| Translation | `translateMessage()` | `replies.ts` |
| AI search | `searchConversations()` | `replies.ts` |
| Text-to-speech | `speakText()` | `voice.ts` |

All backed by Supabase Edge Functions with local fallbacks.

## Testing Strategy

```
Unit (Jest)
  ↓ uses mocks for expo modules
Component (React Native Testing Library)
  ↓ uses MSW for API mocking
Integration (MSW handlers)
  ↓ 
E2E (Detox)
```

### MSW handlers in `src/testing/mocks/server.ts`
- `/api/conversations` - returns mock conversation list
- `/api/conversations/:id` - returns single conversation with messages
- `/api/messages` - POST returns 201
- `/api/leads` - returns mock lead list
- `/api/analytics` - returns mock dashboard metrics

## CI/CD (`.github/workflows/mobile-ci.yml`)

```
GitHub Actions
  ├── Lint (eslint)
  ├── Typecheck (tsc --noEmit)
  ├── Test (jest)
  ├── Build (expo export)
  ├── EAS Preview (PR branches)
  └── EAS Production (main branch push → build + submit)
```

## App Versioning

Version in `app.config.ts` and `package.json`. Use semantic versioning.
- OTA updates via `expo-updates` for JS-only changes
- Native changes require app store submission via EAS
- Minimum supported version check on launch against server

## Mobile UX Enhancements

All screens should use:
- `FlashList` from `@shopify/flash-list` for all lists (not FlatList)
- `RefreshControl` for pull-to-refresh
- Skeleton loaders (`<InboxSkeleton />`, `<ConversationDetailSkeleton />`)
- Empty states (`<EmptyState />`)
- Error states with retry (`<ErrorState onRetry={refetch} />`)
- Keyboard avoiding view for input screens
- Sentry screen tracking via `setSentryScreen()`

## Adding a New Screen

1. Create component in `src/screens/{feature}/`
2. Add navigation params to `src/navigation/types.ts`
3. Add screen to the relevant stack in navigation
4. Add deep linking route to `src/navigation/linking/config.ts`
5. Set up query in screen with error/loading/empty states
6. Call `setSentryScreen('ScreenName')` on mount
7. Add analytics event if appropriate

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Backend API base URL |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry error tracking |
| `EXPO_PUBLIC_APP_ENV` | No | Environment name |
| `EAS_PROJECT_ID` | Yes | EAS build project ID |

## Dependencies (Expo SDK 56)

All packages adhere to Expo SDK 56 compatibility. Do NOT add packages without checking Expo SDK 56 compatibility first.
