# Requirements Document

## Introduction

The SupportAI Platform is a comprehensive multi-tenant customer support and lead generation system that leverages AI-powered agents to provide intelligent, multi-channel customer service. The platform combines advanced natural language processing, vector-based knowledge retrieval, real-time communication, and integrated CRM capabilities to deliver enterprise-grade support automation with human oversight.

## Glossary

- **SupportAI_Platform**: The complete multi-tenant customer support platform system
- **AI_Agent**: Claude Sonnet 4-powered conversational agent with configurable personality and knowledge access
- **Organization**: Multi-tenant entity representing a client company with isolated data and configuration
- **Knowledge_Base**: Vector-indexed document repository using pgvector for semantic search
- **Conversation**: Multi-channel customer interaction session with state management and sentiment tracking
- **Channel**: Communication medium (Web Chat, WhatsApp, Instagram, Facebook, Telegram, Email)
- **RAG_System**: Retrieval-Augmented Generation system combining document search with AI response generation
- **Escalation**: Automated handoff to human agents based on sentiment, confidence, or explicit triggers
- **Lead**: Qualified sales prospect extracted from customer conversations
- **Widget**: Embeddable web chat interface for client websites
- **Subscription_Plan**: Tiered pricing model with conversation limits and feature access (Starter, Growth, Pro)

## Requirements

### Requirement 1: Multi-Tenant Platform Architecture

**User Story:** As a platform operator, I want to manage multiple client organizations with complete data isolation, so that each client has secure, independent access to their support system.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL create isolated tenants for each Organization with UUID-based identification
2. WHEN a user accesses data, THE SupportAI_Platform SHALL enforce Row Level Security policies preventing cross-tenant data access
3. THE SupportAI_Platform SHALL support three role types: super_admin, client_admin, and team_member with appropriate permissions
4. FOR ALL database operations, THE SupportAI_Platform SHALL verify user membership and organization scope before execution
5. THE SupportAI_Platform SHALL maintain audit logs for all multi-tenant operations with organization context

### Requirement 2: AI Agent Configuration System

**User Story:** As a client administrator, I want to customize my AI agent's personality, knowledge, and behavior, so that it provides support aligned with my brand and expertise.

#### Acceptance Criteria

1. THE AI_Agent SHALL support configurable personality traits (professional, friendly, casual, enthusiastic)
2. THE AI_Agent SHALL support configurable tone settings (formal, friendly, warm, playful)
3. WHERE custom brand guidelines are provided, THE AI_Agent SHALL incorporate them into all customer interactions
4. THE AI_Agent SHALL accept custom instructions that modify its default behavior patterns
5. WHEN agent configuration changes, THE SupportAI_Platform SHALL invalidate cached configurations within 300 seconds
6. THE AI_Agent SHALL use Claude Sonnet 4 (claude-sonnet-4-20250514) as the default language model
7. THE AI_Agent SHALL detect customer language automatically and respond in the detected language

### Requirement 3: RAG Knowledge Base System

**User Story:** As a client administrator, I want to upload documents that my AI agent can reference, so that it provides accurate, company-specific information to customers.

#### Acceptance Criteria

1. THE Knowledge_Base SHALL accept PDF, DOCX, TXT files and website URLs for processing
2. WHEN documents are uploaded, THE RAG_System SHALL chunk content into 500-token segments with 50-token overlap
3. THE RAG_System SHALL generate embeddings using OpenAI text-embedding-3-small with 1536 dimensions
4. THE Knowledge_Base SHALL store document vectors in pgvector with HNSW indexing for efficient similarity search
5. WHEN processing queries, THE RAG_System SHALL retrieve top 5 relevant chunks using cosine similarity with 0.7 threshold
6. THE RAG_System SHALL implement the match_documents SQL function: `match_documents(query_embedding vector(1536), org_id uuid, match_threshold float, match_count int)`
7. FOR ALL document processing, THE Knowledge_Base SHALL maintain organization-level data isolation

### Requirement 4: Multi-Channel Communication Hub

**User Story:** As a client administrator, I want to connect multiple communication channels, so that customers can reach us through their preferred platform while maintaining conversation continuity.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL support Web Chat, WhatsApp, Instagram, Facebook, Telegram, and Email channels
2. THE SupportAI_Platform SHALL verify webhooks using platform-specific signatures (X-Hub-Signature-256 for Meta platforms)
3. WHEN channel messages arrive, THE SupportAI_Platform SHALL route them to the correct Organization based on channel token authentication
4. THE SupportAI_Platform SHALL maintain conversation continuity across multiple customer interactions per channel
5. THE SupportAI_Platform SHALL store encrypted channel credentials using AES encryption with organization-specific keys
6. WHERE channel connections are configured, THE SupportAI_Platform SHALL validate webhook endpoints and store verification status

### Requirement 5: Real-Time Conversation Management

**User Story:** As a support team member, I want to monitor active conversations with status tracking and real-time updates, so that I can provide timely human intervention when needed.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL maintain conversation state: active, waiting, resolved, escalated
2. THE SupportAI_Platform SHALL track conversation sentiment: positive, neutral, negative, frustrated, high_risk
3. WHEN messages are received, THE SupportAI_Platform SHALL update conversation last_message_at timestamp
4. THE SupportAI_Platform SHALL store conversation history with role-based message attribution (customer, assistant, agent, system)
5. WHEN conversations are created, THE SupportAI_Platform SHALL generate unique conversation IDs per Organization and Channel
6. THE SupportAI_Platform SHALL maintain customer profile information (name, email, phone) linked to channel identities

### Requirement 6: Intelligent Response Generation with Claude Integration

**User Story:** As a customer, I want to receive intelligent, context-aware responses to my questions, so that I get accurate help without waiting for human agents.

#### Acceptance Criteria

1. WHEN customer messages are received, THE AI_Agent SHALL retrieve conversation history (last 10 messages)
2. THE AI_Agent SHALL query the Knowledge_Base for relevant context using RAG similarity search
3. THE AI_Agent SHALL build system prompts with: {agent_name}, {business_name}, {personality}, {tone}, {brand_guidelines}, {custom_instructions}, {rag_context}, {conversation_history}, {customer_profile}
4. THE AI_Agent SHALL call Claude API (claude-sonnet-4-20250514) with constructed context
5. WHEN responses are generated, THE AI_Agent SHALL detect and preserve customer's language preference
6. THE AI_Agent SHALL analyze sentiment of customer messages using Claude-based sentiment classification
7. WHERE conversation history exists for the customer, THE AI_Agent SHALL include past interaction summaries in context

### Requirement 7: Sentiment Analysis and Escalation System

**User Story:** As a support team member, I want automatic escalation of problematic conversations, so that frustrated customers receive immediate human attention.

#### Acceptance Criteria

1. WHEN customer sentiment is detected as frustrated or high_risk, THE SupportAI_Platform SHALL trigger automatic escalation
2. THE SupportAI_Platform SHALL create escalation records with conversation_id, reason, and triggered_by classification
3. WHEN escalations are created, THE SupportAI_Platform SHALL update conversation status to 'escalated'
4. THE SupportAI_Platform SHALL support manual escalation requests from customers via [ESCALATE] keyword detection
5. WHERE escalations occur, THE SupportAI_Platform SHALL generate conversation summaries for human agents
6. THE SupportAI_Platform SHALL notify assigned team members of new escalations via real-time updates

### Requirement 8: Lead Capture and CRM Integration

**User Story:** As a sales team member, I want to automatically capture qualified leads from support conversations, so that potential customers don't fall through the cracks.

#### Acceptance Criteria

1. WHERE sales mode is enabled, THE AI_Agent SHALL proactively gather lead information (name, email, phone, product_interest)
2. WHEN lead information is detected, THE AI_Agent SHALL extract data using [LEAD] JSON format
3. THE SupportAI_Platform SHALL create lead records with organization_id, conversation_id, and extracted data
4. THE SupportAI_Platform SHALL sync leads to configured CRM systems (HubSpot, Salesforce, Google Sheets)
5. WHEN leads are captured, THE SupportAI_Platform SHALL update conversation lead_status to 'warm'
6. THE SupportAI_Platform SHALL maintain lead qualification scoring based on interaction patterns

### Requirement 9: Subscription and Billing Management

**User Story:** As a platform operator, I want to enforce subscription limits and manage billing, so that the platform operates sustainably with clear pricing tiers.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL support three subscription plans: Starter ($29/mo, 500 conv/mo, 1 seat), Growth ($79/mo, 2K conv/mo, 3 seats), Pro ($199/mo, unlimited conv, unlimited seats)
2. THE SupportAI_Platform SHALL integrate with Stripe for payment processing with 6 products (3 plans × monthly/yearly)
3. WHEN conversation limits are reached, THE SupportAI_Platform SHALL prevent new conversations and display upgrade prompts
4. THE SupportAI_Platform SHALL track conversation usage per billing period per Organization
5. THE SupportAI_Platform SHALL process Stripe webhook events for subscription status updates
6. THE SupportAI_Platform SHALL support annual billing with discount pricing (10× monthly rate)

### Requirement 10: Analytics and Reporting Dashboard

**User Story:** As a client administrator, I want to view conversation analytics and performance metrics, so that I can optimize my support operations and measure success.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL provide conversation volume analytics with daily, weekly, monthly aggregation
2. THE SupportAI_Platform SHALL generate sentiment distribution reports (positive, neutral, negative, frustrated, high_risk)
3. THE SupportAI_Platform SHALL track escalation rates and resolution times per Organization
4. THE SupportAI_Platform SHALL provide lead generation metrics with conversion funnel analysis
5. WHERE sufficient data exists, THE SupportAI_Platform SHALL display trend analysis with percentage changes
6. THE SupportAI_Platform SHALL implement real-time dashboard updates using analytics_events table

### Requirement 11: Security and Compliance Framework

**User Story:** As a platform operator, I want comprehensive security measures and compliance controls, so that customer data is protected and regulatory requirements are met.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL implement rate limiting: 60 requests/minute per conversation using Upstash Redis
2. THE SupportAI_Platform SHALL encrypt sensitive data including API keys in channel_connections.config using AES encryption
3. THE SupportAI_Platform SHALL validate webhook signatures: X-Hub-Signature-256 for WhatsApp, stripe.webhooks.constructEvent() for Stripe
4. THE SupportAI_Platform SHALL maintain audit logs in analytics_events table with action, user_id, organization_id, and timestamp
5. THE SupportAI_Platform SHALL provide GDPR compliance with conversation deletion and data export endpoints
6. THE SupportAI_Platform SHALL enforce HTTPS for all API communications and webhook endpoints

### Requirement 12: Embeddable Web Chat Widget

**User Story:** As a website owner, I want to embed a chat widget on my site, so that visitors can easily start support conversations without leaving my website.

#### Acceptance Criteria

1. THE Widget SHALL provide JavaScript embed code for client websites with customizable appearance
2. THE Widget SHALL support configuration options: title, welcome_message, primary_color, position (left/right)
3. WHEN widget loads, THE Widget SHALL authenticate using organization-specific channel tokens
4. THE Widget SHALL create new conversations via POST /api/webchat endpoint with CORS support
5. THE Widget SHALL maintain conversation persistence across page refreshes using localStorage
6. WHERE branding is enabled, THE Widget SHALL display "Powered by SupportAI" attribution

### Requirement 13: API Architecture and Endpoints

**User Story:** As a developer, I want well-documented API endpoints with proper authentication, so that I can integrate the platform with external systems.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL implement the complete API endpoint structure:
   - POST /api/chat (channel_token auth)
   - POST /api/knowledge/upload (client_admin auth)  
   - POST /api/knowledge/crawl (client_admin auth)
   - GET /api/conversations (client+ auth, paginated)
   - GET /api/conversations/[id] (client+ auth)
   - POST /api/escalations (system auth)
   - PATCH /api/escalations/[id] (team+ auth)
   - GET /api/analytics (client+ auth)
   - POST /api/leads (system auth)
   - POST /api/webhooks/whatsapp (meta_verify auth)
   - POST /api/webhooks/instagram (meta_verify auth)
   - POST /api/webhooks/facebook (meta_verify auth)
   - POST /api/webhooks/stripe (stripe_sig auth)
   - GET /api/admin/clients (super_admin auth)
   - PATCH /api/admin/clients/[id] (super_admin auth)
   - GET /api/admin/analytics (super_admin auth)

2. THE SupportAI_Platform SHALL implement the exact chat endpoint logic:
   - Verify channel token → get organization
   - Get or create conversation for customer_id
   - Retrieve customer profile + last 10 messages
   - Embed user message → similarity search → get top 5 chunks  
   - Build system prompt with agent config + RAG context + history
   - Call Claude API (claude-sonnet-4-20250514)
   - Analyze sentiment of user message
   - Check escalation triggers
   - Save messages to database
   - Update conversation sentiment + last_message_at
   - If escalation triggered → create escalation + notify team
   - Return AI response

3. THE SupportAI_Platform SHALL use Next.js 15 App Router with TypeScript, Tailwind CSS, and shadcn/ui components
4. THE SupportAI_Platform SHALL authenticate API requests using Supabase Auth with JWT tokens
5. THE SupportAI_Platform SHALL provide OpenAPI documentation for all public endpoints

### Requirement 14: Database Schema and Infrastructure

**User Story:** As a platform operator, I want a robust, scalable database design with proper constraints and relationships, so that the platform can handle enterprise workloads reliably.

#### Acceptance Criteria

1. THE SupportAI_Platform SHALL implement the exact database schema with all specified tables:
   - organizations (id, name, status, stripe_customer_id, created_at)
   - users (id, email, role, organization_id, stripe_customer_id)  
   - subscriptions (id, organization_id, stripe_subscription_id, plan, status, current_period_end, conversation_limit, conversation_count)
   - ai_agents (id, organization_id, name, persona, tone, brand_guidelines, custom_instructions)
   - conversations (id, organization_id, customer_id, channel, status, sentiment_score, last_message_at, assigned_to)
   - messages (id, conversation_id, role, content, sentiment, created_at)
   - knowledge_sources (id, organization_id, title, type, url, status, processed_at)
   - documents (id, knowledge_source_id, content, embedding vector(1536), organization_id)
   - escalations (id, conversation_id, reason, status, assigned_to, created_at, resolved_at)
   - channel_connections (id, organization_id, channel_type, config, is_active)
   - analytics_events (id, organization_id, event_type, data, created_at)
   - customer_profiles (id, organization_id, external_id, name, email, metadata, conversation_count, last_seen)

2. THE SupportAI_Platform SHALL use Supabase as the backend (Postgres + Auth + Realtime + Storage + Edge Functions)
3. THE SupportAI_Platform SHALL implement pgvector extension with HNSW indexing for efficient similarity search
4. THE SupportAI_Platform SHALL deploy on Vercel with proper environment variable configuration

### Requirement 15: Multi-Language Support System

**User Story:** As an international client, I want my AI agent to communicate in multiple languages including Roman Urdu, so that I can serve customers in their native languages.

#### Acceptance Criteria

1. THE AI_Agent SHALL detect customer language automatically using Claude-based language detection
2. THE AI_Agent SHALL support Roman Urdu + English mixed-language detection and responses
3. WHERE language mode is set to 'mixed_roman_urdu', THE AI_Agent SHALL respond in Roman Urdu mixing English words naturally
4. THE AI_Agent SHALL maintain conversation language consistency throughout the session
5. THE SupportAI_Platform SHALL store detected language in conversations.language column
6. THE AI_Agent SHALL adapt system prompts to include language-specific instructions for natural communication patterns