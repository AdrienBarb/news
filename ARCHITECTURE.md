# ARCHITECTURE.md — Technical Implementation

## Overview

Reddit Lead Finder is a one-time lead discovery tool built with:

- **Next.js 16** (App Router) + TypeScript
- **Prisma** + PostgreSQL (Supabase)
- **Inngest** for background jobs
- **OpenAI** for website analysis & lead scoring
- **Apify** for Reddit data fetching
- **Stripe** for one-time payments

---

## Data Model

```
User (1) ──→ (N) AiAgent
                    │
                    └──→ (N) Lead (Reddit posts with buying intent)
```

### Key Entities

| Entity      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| **User**    | Authenticated user                              |
| **AiAgent** | One-time job to find leads (website + keywords) |
| **Lead**    | Reddit post with potential buying intent        |

### AiAgent Fields

| Field             | Type        | Purpose                                    |
| ----------------- | ----------- | ------------------------------------------ |
| `websiteUrl`      | String      | User's product website                     |
| `description`     | String?     | Product description (AI-generated)         |
| `keywords`        | String[]    | Search keywords for Reddit (max 20)        |
| `competitors`     | String[]    | Competitor names (max 3)                   |
| `timeWindow`      | TimeWindow  | Search period (7d, 30d, 365d)              |
| `stripeSessionId` | String?     | Stripe checkout session ID                 |
| `amountPaid`      | Int?        | Amount paid in cents                       |
| `status`          | AgentStatus | PENDING_PAYMENT → QUEUED → ... → COMPLETED |
| `startedAt`       | DateTime?   | When agent started processing              |
| `completedAt`     | DateTime?   | When agent finished                        |

### Lead Fields

| Field             | Type        | Purpose                            |
| ----------------- | ----------- | ---------------------------------- |
| `source`          | SourceType  | Always "reddit" for now            |
| `externalId`      | String      | Reddit post ID (e.g., "t3_abc123") |
| `url`             | String      | Full Reddit URL                    |
| `subreddit`       | String?     | Subreddit name                     |
| `title`           | String      | Post title                         |
| `content`         | String      | Sanitized post content             |
| `author`          | String?     | Reddit username                    |
| `score`           | Int         | Reddit upvotes                     |
| `numComments`     | Int         | Number of comments                 |
| `publishedAt`     | DateTime?   | When post was created              |
| `intent`          | IntentType? | Detected buying intent type        |
| `relevance`       | Float?      | Relevance score (0-100)            |
| `relevanceReason` | String?     | AI explanation for score           |

### Enums

| Enum            | Values                                                                                  |
| --------------- | --------------------------------------------------------------------------------------- |
| **TimeWindow**  | `LAST_7_DAYS`, `LAST_30_DAYS`, `LAST_365_DAYS`                                          |
| **AgentStatus** | `PENDING_PAYMENT`, `QUEUED`, `FETCHING_LEADS`, `ANALYZING_LEADS`, `COMPLETED`, `FAILED` |
| **SourceType**  | `reddit`                                                                                |
| **IntentType**  | `recommendation`, `alternative`, `complaint`, `question`, `comparison`                  |

---

## Background Jobs (Inngest)

| Job        | Event       | What It Does                           |
| ---------- | ----------- | -------------------------------------- |
| `runAgent` | `agent/run` | Fetches Reddit posts, analyzes with AI |

### Job Flow

```
Payment Completed (Stripe webhook)
       ↓
  Update agent status → QUEUED
       ↓
  Trigger Inngest: agent/run
       ↓
  runAgent job:
    1. Status → FETCHING_LEADS
    2. For each keyword: fetch Reddit posts via Apify
    3. Status → ANALYZING_LEADS
    4. AI analyzes each post for relevance
    5. Save leads to database
    6. Status → COMPLETED
    7. Send email notification
```

### Time Window Configuration

| Time Window     | Label          | Price  | Apify Time | Internal Cap/Keyword |
| --------------- | -------------- | ------ | ---------- | -------------------- |
| `LAST_7_DAYS`   | Recent signals | $9.50  | week       | 10 posts             |
| `LAST_30_DAYS`  | Market scan    | $24.50 | month      | 20 posts             |
| `LAST_365_DAYS` | Deep research  | $49.50 | year       | 30 posts             |

_Note: Prices shown are after 50% launch discount_

---

## Key Files

### Components

| Directory                      | Components                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `src/components/agents/`       | `CreateAgentForm`, `CreateAgentModal`, `AgentCard`, `AgentsList`, `EmptyAgentsState` |
| `src/components/agents/steps/` | `WebsiteStep`, `ReviewStep`, `TimeWindowStep`                                        |

### Services

| File                                  | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `src/lib/connectors/reddit/client.ts` | Apify integration for Reddit scraping |
| `src/lib/utils/articleExtractor.ts`   | Extract content from websites         |

### Inngest Jobs

| File                          | Function      | Purpose                       |
| ----------------------------- | ------------- | ----------------------------- |
| `src/lib/inngest/runAgent.ts` | `runAgentJob` | Main lead fetching & analysis |

### Constants

| File                                | Purpose                             |
| ----------------------------------- | ----------------------------------- |
| `src/lib/constants/timeWindow.ts`   | Time window config, pricing, limits |
| `src/lib/constants/errorMessage.ts` | Centralized error messages          |

### API Routes

| Route                   | Methods   | Purpose                         |
| ----------------------- | --------- | ------------------------------- |
| `/api/agents`           | GET, POST | List agents / Create + checkout |
| `/api/agents/[agentId]` | GET       | Get agent details with leads    |
| `/api/analyze-website`  | POST      | AI-analyze website for keywords |
| `/api/webhooks/stripe`  | POST      | Handle Stripe payment events    |

### UI Pages

| Page         | Path             | Purpose                    |
| ------------ | ---------------- | -------------------------- |
| Dashboard    | `/d`             | Create agent / List agents |
| Agent Detail | `/d/agents/[id]` | View leads + status        |

---

## Agent Creation Flow

### 3-Step Process

```
Step 1: User enters website URL
        ↓
        POST /api/analyze-website
        ↓
        AI analyzes website → returns { description, keywords[] }

Step 2: User reviews/edits description + keywords + competitors
        ↓
        Max 20 keywords, max 3 competitors

Step 3: User selects time window
        ↓
        POST /api/agents
        ↓
        Create AiAgent (status: PENDING_PAYMENT)
        ↓
        Create Stripe Checkout Session
        ↓
        Redirect to Stripe
```

### Website Analysis

1. **Fetch website content**
   - Extract text using article extractor
   - Limit content for API

2. **AI keyword extraction**
   - Send to OpenAI GPT-4o-mini
   - Returns description + up to 15 keywords
   - Keywords focused on:
     - Product category terms
     - Problem-related searches
     - Use cases

---

## Payment Flow

```
1. User submits Step 3 (time window selected)
   ↓
2. POST /api/agents
   - Create AiAgent with PENDING_PAYMENT
   - Create Stripe Checkout Session
   - Return checkout URL
   ↓
3. User completes payment on Stripe
   ↓
4. Stripe webhook: checkout.session.completed
   - Get agentId from session.metadata
   - Update agent: status → QUEUED, amountPaid
   - Trigger Inngest: agent/run
   ↓
5. User redirected to /d/agents/[agentId]
```

---

## Lead Discovery Flow

### How runAgent Works

1. **Update status to FETCHING_LEADS**

2. **Build search queries**
   - Product keywords
   - Competitor + "alternative" patterns

3. **Fetch from Reddit (via Apify)**
   - For each keyword:
     - Scrape Reddit search results
     - Filter by time window (maxAgeDays)
     - Limit posts per keyword (based on tier)
   - Deduplicate by externalId

4. **Update status to ANALYZING_LEADS**

5. **AI Analysis**
   - For each post:
     - Score relevance (0-100)
     - Classify intent
     - Generate reasoning

6. **Save leads to database**

7. **Update status to COMPLETED**

8. **Send email notification**

---

## Environment Variables

```env
# Apify (Reddit scraping)
APIFY_API_KEY=your_key

# OpenAI
OPENAI_API_KEY=sk-...

# Database (Supabase)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Auth
BETTER_AUTH_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_BASE_URL=https://...
```

---

## Data Flow Summary

```
1. User enters website URL
   └── POST /api/analyze-website
       └── Fetch website content
       └── OpenAI: Extract description + keywords
       └── Return to UI

2. User edits keywords/competitors & selects time window
   └── POST /api/agents
       └── Create AiAgent (status: PENDING_PAYMENT)
       └── Create Stripe Checkout Session
       └── Redirect to Stripe

3. Payment completed
   └── Stripe webhook
       └── Update status → QUEUED
       └── Trigger Inngest: agent/run

4. Run Agent (Inngest)
   └── Status → FETCHING_LEADS
   └── For each keyword:
       └── Apify → Reddit search
       └── Filter by time window
   └── Status → ANALYZING_LEADS
   └── AI scores each post
   └── Save leads
   └── Status → COMPLETED
   └── Send email

5. User Views
   └── /d - Dashboard with agent list
   └── /d/agents/[id] - Lead list with sorting
```

---

## UI Components Structure

```
src/components/agents/
├── CreateAgentForm.tsx      # 3-step form orchestration
├── CreateAgentModal.tsx     # Modal wrapper for existing users
├── AgentCard.tsx            # Single agent card in list
├── AgentsList.tsx           # List of agent cards
├── EmptyAgentsState.tsx     # First-time user view
└── steps/
    ├── WebsiteStep.tsx      # Step 1: Enter URL
    ├── ReviewStep.tsx       # Step 2: Edit keywords/competitors
    └── TimeWindowStep.tsx   # Step 3: Select time window + pricing
```

---

## Dashboard Logic

```
User arrives at /d
       │
       ├── Has agents? → Show AgentsList + "Run an agent" button
       │                 Button opens CreateAgentModal
       │
       └── No agents? → Show EmptyAgentsState
                        Form displayed directly on page
```

---

## Agent Detail Page Features

- **Processing states**: QUEUED, FETCHING_LEADS, ANALYZING_LEADS
  - Shows animated progress indicator
  - Email notification reminder

- **Completed state**: Lead list with:
  - Subreddit badge
  - Intent badge
  - Relevance score
  - AI reasoning
  - Post metadata (author, upvotes, comments, date)
  - Link to Reddit

- **Sorting**: By relevance (default) or by newest
