# SupportAI Agent

An intelligent AI customer support and sales agent that works across web chat, Facebook Messenger, Instagram, and WhatsApp.

---

## How It Works

When a customer sends a message from any channel, the agent:

1. **Checks limits** — rate limit, usage quota, organization status, plan features
2. **Loads your config** — personality, tone, model, brand guidelines, custom instructions
3. **Searches your knowledge base** — finds relevant documents using AI-powered semantic search
4. **Remembers the customer** — pulls past conversations for context
5. **Detects language & sentiment** — responds in the customer's language and tracks mood
6. **Generates a response** — sends everything to the AI model and returns a reply
7. **Takes action if needed** — captures leads, escalates to humans, syncs to CRM

```
Customer Message → Rate Check → Load Config → Search KB → Check History → Detect Language → AI Response → Action
```

---

## Capabilities

### Multi-Channel Support
Customers can reach you from web chat, Facebook Messenger, Instagram, or WhatsApp — all handled by the same AI agent.

### Personality & Tone Customization
Configure how the agent sounds:

| Personality | Description |
|---|---|
| Professional | Formal, proper structure |
| Friendly | Warm, conversational |
| Casual | Relaxed, direct |
| Enthusiastic | High energy, positive |

Plus fine-tune the tone: formal, friendly, warm, or playful. Add brand guidelines and custom instructions for complete control.

### Knowledge Base (RAG)
Upload your documentation, FAQs, or product guides. The agent automatically searches them using semantic AI to answer customer questions accurately. It understands meaning, not just keywords.

### Language Detection
The agent automatically detects the customer's language and responds in the same language. Supports English, Spanish, French, German, Arabic, Chinese, Japanese, Korean, Portuguese, Russian, Italian, Dutch, Turkish, Vietnamese, Thai, and more.

### Sentiment Tracking
Tracks customer sentiment in real-time: positive, neutral, negative, frustrated, or high-risk. Use this to identify unhappy customers before they churn.

### Lead Capture
When enabled, the agent proactively collects lead information (name, email, phone, product interest) during conversations. Captured leads are stored and synced to your CRM automatically.

### Smart Escalation
The agent knows when to hand off to a human:
- Customer asks for a human
- Refund requests or legal topics
- Low confidence in answering
- Custom escalation triggers

Escalated conversations include the full context and reason so your team can pick up seamlessly.

### Customer Memory
The agent remembers past interactions with returning customers, providing context-aware support without asking them to repeat themselves.

### CRM Integrations
Captured leads are automatically pushed to:
- **HubSpot** — creates contact records
- **Salesforce** — creates lead records
- **Zoho CRM** — creates lead records
- **Google Sheets** — appends rows to your spreadsheet

---

## Supported AI Models

| Model | Use Case |
|---|---|
| Claude 3.5 Sonnet | Best balance of speed & accuracy (default) |
| Claude 3 Haiku | Fastest responses |
| GPT-4o | OpenAI's flagship |
| Gemini Pro | Google's offering |

---

## Admin Dashboard

Configure everything from a web dashboard:

| Section | What You Can Configure |
|---|---|
| **Identity** | Name, personality, tone, brand guidelines, custom instructions |
| **AI Model** | Model selection, temperature (precise → creative) |
| **Features** | Toggle lead capture, sales mode, sentiment analysis |
| **Advanced** | Confidence threshold, max conversation turns, default language |

A live preview panel shows how the agent will appear to customers as you make changes.

---

## Plans & Features

| Feature | Starter | Growth | Pro |
|---|---|---|---|
| Lead Capture | ❌ | ✅ | ✅ |
| Sentiment Analysis | ❌ | ✅ | ✅ |
| Customer Memory | ❌ | ❌ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ |
| CRM Integrations | ❌ | ❌ | ✅ |
