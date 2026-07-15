# SupportAI Agent System

## Overview

SupportAI is a multi-channel conversational AI agent for customer support and sales. It handles conversations across web chat, Facebook Messenger, Instagram, and WhatsApp, with automatic language detection, sentiment analysis, knowledge base retrieval (RAG), lead capture, and escalation to human agents.

---

## Architecture

```
Messages Channel (Web Chat / FB / IG / WA)
    │
    ▼
API Route (webchat / webhooks)
    │
    ├── Rate Limit Check    → lib/rate-limit.ts
    ├── Organization Check  → organizations table
    ├── Usage Limit Check   → lib/billing/usage.ts
    ├── Feature Gate Check  → lib/feature-gate.ts (lead_capture, sentiment_analysis)
    ├── Store Customer Msg  → storeMessage()
    ├── Fetch Conversation History
    │
    └── generateAIResponse()  → lib/ai/agent.ts
         │
         ├── getAgentConfig()        → Cached, from ai_agents table
         ├── getRelevantDocuments()  → RAG via embeddings + pgvector
         ├── getCustomerHistory()    → Past conversation context
         ├── detectLanguage()        → ISO 639-1 (Claude Haiku)
         ├── analyzeSentiment()      → sentiment class (Claude Haiku)
         │
         └── callAI()               → OpenRouter (default) or Direct Anthropic
              │
              └── Response parsing: [ESCALATE] / [LEAD] extraction
                   ├── Create escalation record
                   ├── Insert lead + sync to CRM
                   └── Return cleaned response text
```

---

## Core Files

| File | Purpose |
|---|---|
| `src/lib/ai/agent.ts` | Main agent engine — response generation, config, sentiment, language, history, lead capture, escalation |
| `src/lib/ai/embeddings.ts` | OpenAI `text-embedding-3-small` for document vectorization + chunking + URL extraction |
| `packages/types/src/index.ts` | `AIAgent` TypeScript interface |
| `src/app/api/webchat/route.ts` | Web chat API endpoint |
| `src/app/api/webhooks/facebook/route.ts` | Facebook Messenger integration |
| `src/app/api/webhooks/instagram/route.ts` | Instagram messaging integration |
| `src/app/api/webhooks/whatsapp/route.ts` | WhatsApp Business API integration |
| `src/lib/integrations/crm.ts` | CRM sync (HubSpot, Salesforce, Zoho, Google Sheets) |
| `src/app/dashboard/admin/agent/page.tsx` | Web admin UI for agent config |
| `apps/mobile/src/screens/agent/AgentConfigScreen.tsx` | Mobile config screen (Expo) |
| `src/lib/feature-gate.ts` | Plan-based feature gating |
| `src/lib/billing/usage.ts` | Conversation usage limit checks |
| `src/lib/cache.ts` | Redis + in-memory caching layer |
| `src/lib/rate-limit.ts` | Upstash + in-memory rate limiting |
| `src/lib/validation.ts` | Zod schemas for request validation |

---

## Agent Configuration

### Type Definition (`packages/types/src/index.ts`)

```ts
interface AIAgent {
  id: string
  organization_id: string
  name: string
  personality: 'professional' | 'friendly' | 'casual' | 'enthusiastic'
  tone_of_voice: 'friendly' | 'formal' | 'warm' | 'playful'
  brand_guidelines?: string
  custom_instructions?: string
  model: string
  temperature: number
  lead_capture_enabled: boolean
  sales_mode_enabled: boolean
  sentiment_analysis_enabled: boolean
}
```

### Personality Presets

| Personality | Behavior |
|---|---|
| `professional` | Formal language, proper structure |
| `friendly` | Warm, approachable, conversational |
| `casual` | Relaxed, informal, concise |
| `enthusiastic` | High energy, positive |

### Tone Presets

| Tone | Style |
|---|---|
| `formal` | Proper titles, structured responses |
| `friendly` | Warm conversational language |
| `warm` | Caring, empathetic |
| `playful` | Light-hearted, personality-driven |

---

## AI Providers

### OpenRouter (Default)
- **Base URL**: `https://openrouter.ai/api/v1`
- **Model**: `anthropic/claude-3.5-sonnet` (default)
- Auth: `OPENROUTER_API_KEY` env var
- Sends `HTTP-Referer` and `X-Title` headers

### Direct Anthropic (Fallback)
- Enabled when `USE_DIRECT_ANTHROPIC=true` and `ANTHROPIC_API_KEY` is set
- Strips `anthropic/` prefix from model name for API call

### Available Models (Admin UI)
- `anthropic/claude-3.5-sonnet` (Recommended)
- `anthropic/claude-3-haiku` (Fast)
- `openai/gpt-4o`
- `google/gemini-pro`

---

## RAG — Knowledge Base Retrieval

The agent uses **Retrieval-Augmented Generation** to answer questions from organization documents.

### Flow
1. Customer sends a message
2. Message is embedded via OpenAI `text-embedding-3-small` (1024 dimensions)
3. `match_documents` Supabase RPC performs vector similarity search
4. Top matching documents (threshold ≥ 0.7) are injected into the system prompt
5. Documents are cached and chunked via `chunkText()` (max 1000 chars per chunk)

### Embeddings (`src/lib/ai/embeddings.ts`)
| Function | Purpose |
|---|---|
| `generateEmbedding(text)` | Single text → embedding vector |
| `generateEmbeddings(texts)` | Batch embedding generation |
| `chunkText(text, maxChunkSize)` | Sentence-aware text splitting |
| `extractTextFromUrl(url)` | HTML → plain text extraction |

---

## Sentiment Analysis

When `sentiment_analysis_enabled` is on (and feature gate permits):
1. Customer message is sent to Claude Haiku with a classification prompt
2. Returns one of: `positive`, `neutral`, `negative`, `frustrated`, `high_risk`
3. Stored on the `conversations` record
4. Feature-gated per plan (Starter: ❌, Growth: ✅, Pro: ✅)

---

## Language Detection
1. Message is sent to Claude Haiku
2. Returns ISO 639-1 code (en, es, fr, de, ar, zh, etc.)
3. Agent always responds in detected language
4. Language stored on the conversation record

---

## Customer Memory

When `channelConversationId` is provided, the agent fetches past conversations from the same channel user:
- Last 5 non-active conversations
- Includes status, sentiment, and customer message snippet
- Injected into system prompt for contextual awareness

---

## Escalation Flow

Agent escalates when:
- Customer explicitly asks for a human
- Refund or legal issues detected
- Low confidence in response
- Agent includes `[ESCALATE]` in response with reason

On escalation:
1. Conversation status → `escalated`
2. Escalation record created with reason
3. Response still returned to customer with closing message

---

## Lead Capture

When `lead_capture_enabled` is on:
- Agent proactively gathers name, email, phone, product interest
- Agent includes `[LEAD] {"name": "...", "email": "..."}` in response
- Lead is extracted via regex and inserted into `leads` table
- Lead synced to connected CRM integrations

### CRM Integrations (`src/lib/integrations/crm.ts`)

| Provider | Method |
|---|---|
| HubSpot | `POST /crm/v3/objects/contacts` |
| Salesforce | `POST /services/data/v58.0/sobjects/Lead` |
| Zoho CRM | `POST /crm/v2/Leads` |
| Google Sheets | `POST` append to spreadsheet |

---

## Channels

| Channel | Endpoint | Integration |
|---|---|---|
| Web Chat | `POST /api/webchat` | Direct API |
| Facebook Messenger | `POST /api/webhooks/facebook` | Meta Webhooks |
| Instagram | `POST /api/webhooks/instagram` | Meta Webhooks |
| WhatsApp | `POST /api/webhooks/whatsapp` | WhatsApp Business API |

All channels share the same core agent engine (`generateAIResponse`) with channel-specific message formatting.

---

## Plan-Based Feature Gating

| Feature | Starter | Growth | Pro |
|---|---|---|---|
| lead_capture | ❌ | ✅ | ✅ |
| sentiment_analysis | ❌ | ✅ | ✅ |
| agent_memory | ❌ | ❌ | ✅ |
| advanced_analytics | ❌ | ❌ | ✅ |
| crm_integrations | ❌ | ❌ | ✅ |

---

## Admin UI

### Web Dashboard (`src/app/dashboard/admin/agent/page.tsx`)
- **Sections**: Identity, AI Model, Features, Advanced
- **Identity**: Name, personality, tone, brand guidelines, custom instructions
- **Model**: Model selection, temperature slider (0–1)
- **Features**: Lead capture, sales mode, sentiment analysis toggles
- **Advanced**: Confidence threshold, max conversation turns, language
- **Live chat preview** panel showing agent config reflection
- **Metrics cards**: Handled by AI, Avg Response, Active Chats, Escalation Rate
- Auto-saves with debounce (500ms)
- Audit logging on config changes
- Cache invalidation on save

### Mobile App (`apps/mobile/src/screens/agent/AgentConfigScreen.tsx`)
- Name, personality, tone, brand guidelines, custom instructions
- Save via API to server
- Built with React Native + TanStack Query

---

## Caching & Performance

| Mechanism | What | TTL |
|---|---|---|
| `cachedQuery` | Agent config | 5 min |
| `cachedQuery` | Plan features | 60 min |
| Redis (Upstash) | Production cache | Configurable |
| In-memory Map | Fallback cache | Configurable |
| Cache invalidation | On agent config save | Immediate |

Cache supports both Upstash Redis and in-memory fallback via `src/lib/cache.ts`.

---

## Rate Limiting

| Limiter | Limit | Window |
|---|---|---|
| Chat | 20 requests | 1 min |
| Webhook | 60 requests | 1 min |
| Knowledge Upload | 10 requests | 1 min |
| Knowledge Process | 10 requests | 1 min |
| Auth | 10 requests | 15 min |
| API | 60 requests | 1 min |

Uses Upstash Ratelimit (sliding window) with in-memory fallback. Limits configurable via env vars.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | Default AI provider |
| `OPENROUTER_BASE_URL` | No | Custom OpenRouter URL |
| `ANTHROPIC_API_KEY` | No | Direct Anthropic fallback |
| `USE_DIRECT_ANTHROPIC` | No | Toggle direct Anthropic |
| `ANTHROPIC_MODEL` | No | Default model override |
| `OPENAI_API_KEY` | Yes | Embeddings |
| `NEXT_PUBLIC_APP_URL` | No | OpenRouter referer header |
| `UPSTASH_REDIS_REST_URL` | No | Caching |
| `UPSTASH_REDIS_REST_TOKEN` | No | Caching |

---

## System Prompt

The core system prompt (`src/lib/ai/agent.ts:53-68`) instructs the agent to:
- Be helpful, professional, and friendly
- Detect frustration and respond with empathy
- Escalate when requested by customer or for refunds/legal
- Detect and respond in the customer's language
- Use knowledge base for accurate answers
- Capture leads in sales mode
- Use `[ESCALATE]` and `[LEAD]` markers for post-processing
