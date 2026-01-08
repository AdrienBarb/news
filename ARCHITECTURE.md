# ARCHITECTURE.md — Technical Implementation

## Overview

PREDIQTE is a Reddit lead discovery tool built with:

- **Next.js 16** (App Router) + TypeScript
- **Prisma** + PostgreSQL (Supabase)
- **Inngest** for background jobs
- **OpenAI** for website analysis
- **ScrapingBee** for Reddit data fetching

---

## Data Model

```
User (1) ──→ (N) Market
                    │
                    └──→ (N) Lead (Reddit posts with buying intent)
```

### Key Entities

| Entity     | Purpose                                          |
| ---------- | ------------------------------------------------ |
| **User**   | Authenticated user with subscription             |
| **Market** | User's product context (website + keywords)      |
| **Lead**   | Reddit post/comment with potential buying intent |

### Market Fields

| Field         | Type         | Purpose                                       |
| ------------- | ------------ | --------------------------------------------- |
| `websiteUrl`  | String       | User's product website                        |
| `name`        | String       | Market name (usually domain)                  |
| `description` | String?      | Product description (AI-generated, editable)  |
| `keywords`    | String[]     | Search keywords for Reddit (max 20, editable) |
| `status`      | MarketStatus | pending → analyzing → active                  |

### Lead Fields

| Field        | Type        | Purpose                            |
| ------------ | ----------- | ---------------------------------- |
| `source`     | SourceType  | Always "reddit" for now            |
| `externalId` | String      | Reddit post ID (e.g., "t3_abc123") |
| `url`        | String      | Full Reddit URL                    |
| `subreddit`  | String?     | Subreddit name                     |
| `title`      | String      | Post title                         |
| `content`    | String      | Sanitized post content             |
| `author`     | String?     | Reddit username                    |
| `intent`     | IntentType? | Detected buying intent type        |
| `relevance`  | Float?      | Relevance score (0-1)              |
| `isRead`     | Boolean     | User marked as read                |
| `isArchived` | Boolean     | User archived                      |

### Enums

| Enum             | Values                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| **MarketStatus** | `pending`, `analyzing`, `active`, `paused`, `error`                    |
| **SourceType**   | `reddit`                                                               |
| **IntentType**   | `recommendation`, `alternative`, `complaint`, `question`, `comparison` |

---

## Background Jobs (Inngest)

| Job                   | Trigger                           | What It Does                        |
| --------------------- | --------------------------------- | ----------------------------------- |
| `deriveMarketContext` | `market/context.derive`           | Analyzes website, extracts keywords |
| `fetchLeads`          | Daily 1 AM + `market/leads.fetch` | Searches Reddit for leads           |

### Job Flow

```
Market Created (with keywords)
       ↓
  fetchLeads → Search Reddit → Save Leads

Market Created (without keywords)
       ↓
  deriveMarketContext → Analyze Website → Extract Keywords
       ↓
  fetchLeads → Search Reddit → Save Leads
```

### Inngest Events

| Event Name              | Payload        | Triggers               |
| ----------------------- | -------------- | ---------------------- |
| `market/context.derive` | `{ marketId }` | deriveMarketContextJob |
| `market/leads.fetch`    | `{ marketId }` | fetchLeadsJob          |

---

## Key Files

### Connectors

| File                                  | Purpose                          |
| ------------------------------------- | -------------------------------- |
| `src/lib/connectors/reddit/client.ts` | ScrapingBee proxy for Reddit API |
| `src/lib/connectors/reddit/search.ts` | Search Reddit posts              |
| `src/lib/connectors/reddit/types.ts`  | TypeScript types for Reddit API  |

### Services

| File                                         | Purpose                                          |
| -------------------------------------------- | ------------------------------------------------ |
| `src/lib/services/markets/createMarket.ts`   | Create market record                             |
| `src/lib/services/markets/getMarkets.ts`     | Get/delete/update markets                        |
| `src/lib/services/markets/analyzeWebsite.ts` | AI-powered website analysis + keyword extraction |

### Utilities

| File                             | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| `src/lib/utils/textSanitizer.ts` | Strip HTML, normalize text, detect prompt injection |

### Inngest Jobs

| File                                     | Functions                                 |
| ---------------------------------------- | ----------------------------------------- |
| `src/lib/inngest/deriveMarketContext.ts` | `deriveMarketContextJob`                  |
| `src/lib/inngest/fetchLeads.ts`          | `fetchLeadsJob`, `scheduledFetchLeadsJob` |

### API Routes

| Route                             | Methods          | Purpose                        |
| --------------------------------- | ---------------- | ------------------------------ |
| `/api/markets`                    | GET, POST        | List/create markets            |
| `/api/markets/analyze`            | POST             | Analyze website URL → keywords |
| `/api/markets/[marketId]`         | GET, PUT, DELETE | Get/update/delete market       |
| `/api/markets/[marketId]/refresh` | POST             | Manual lead refresh trigger    |
| `/api/markets/[marketId]/leads`   | GET              | List leads for market          |

### UI Pages

| Page          | Path            | Purpose            |
| ------------- | --------------- | ------------------ |
| Markets List  | `/markets`      | View all markets   |
| New Market    | `/markets/new`  | Create market form |
| Market Detail | `/markets/[id]` | Leads + settings   |

### UI Components

| Directory                 | Components                                            |
| ------------------------- | ----------------------------------------------------- |
| `src/components/markets/` | `MarketCard`, `MarketStatusBadge`, `CreateMarketForm` |

---

## Market Creation Flow

### 2-Step Process

```
Step 1: User enters website URL
        ↓
        POST /api/markets/analyze
        ↓
        AI analyzes website → returns { description, keywords[] }

Step 2: User reviews/edits description + keywords (max 20)
        ↓
        User confirms
        ↓
        POST /api/markets → Create market with keywords
        ↓
        Trigger: market/leads.fetch
```

### Website Analysis (analyzeWebsite.ts)

1. **Fetch website content**
   - HTTP GET with user-agent header
   - Extract text from HTML (strip scripts, styles)
   - Limit to 15,000 characters

2. **AI keyword extraction**
   - Send to OpenAI GPT-4o-mini
   - Returns description + 10-20 keywords
   - Keywords focused on:
     - Product category terms
     - Problem-related searches
     - Competitor names
     - Alternative/recommendation queries

---

## Lead Discovery Flow

### How fetchLeads Works

1. **Get market keywords**
   - Load market from database
   - Get user-defined keywords (max 20)

2. **Search Reddit for each keyword**
   - Use ScrapingBee proxy → Reddit JSON API
   - Timeframe: last week (initial) or last day (subsequent)
   - Limit: 25 posts (initial) or 15 posts (subsequent)

3. **Process results**
   - Sanitize content (strip HTML, normalize)
   - Skip very short content (<30 chars)
   - Skip prompt injection attempts
   - Extract subreddit from URL

4. **Save leads**
   - Upsert by `source + externalId`
   - Skip duplicates

### Reddit API Integration

```typescript
// Search endpoint via ScrapingBee
const url = `https://www.reddit.com/search.json?q=${query}&t=${timeframe}&limit=${limit}&sort=relevance`;

// ScrapingBee handles:
// - Rate limiting (100 req/min)
// - IP rotation
// - CAPTCHA solving
```

---

## Key Configuration

| Setting                | Location        | Default     | Description                    |
| ---------------------- | --------------- | ----------- | ------------------------------ |
| Max keywords           | Schema + UI     | 20          | Per market keyword limit       |
| Fetch schedule         | `fetchLeads.ts` | `0 1 * * *` | Daily 1 AM UTC                 |
| Initial fetch posts    | `fetchLeads.ts` | 25          | Posts per keyword on first run |
| Subsequent fetch posts | `fetchLeads.ts` | 15          | Posts per keyword on updates   |
| Min content length     | `fetchLeads.ts` | 30          | Skip shorter posts             |

---

## Environment Variables

```env
# ScrapingBee (for Reddit API proxy)
SCRAPINGBEE_API_KEY=your_key

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

# Stripe (payments)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PRICE_LINK_MONTHLY=...
```

---

## Data Flow Summary

```
1. User enters website URL
   └── POST /api/markets/analyze
       └── Fetch website content
       └── OpenAI: Extract description + keywords
       └── Return to UI

2. User edits keywords & confirms
   └── POST /api/markets
       └── Create Market (status: active, with keywords)
       └── Trigger: market/leads.fetch

3. Fetch Leads (Inngest - daily 1 AM)
   └── For each keyword:
       └── ScrapingBee → Reddit JSON API
       └── Sanitize content
       └── Upsert leads (dedup by externalId)

4. User Views
   └── /markets - List markets with lead counts
   └── /markets/[id] - Lead feed with filters
   └── Settings modal - Edit keywords & description
```

---

## Future Improvements

- [ ] Intent detection using AI (classify leads by buying intent)
- [ ] Relevance scoring for better lead ranking
- [ ] AI-generated reply suggestions
- [ ] Email/Slack notifications for new leads
- [ ] Export functionality (CSV)
- [ ] Multiple domains per user (higher tier plans)
- [ ] Competitor mention tracking
- [ ] Lead engagement tracking (replied, converted)
