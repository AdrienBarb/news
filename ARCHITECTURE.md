# ARCHITECTURE.md — Technical Implementation

## Overview

Market Signals is built with:
- **Next.js 16** (App Router) + TypeScript
- **Prisma** + PostgreSQL (Supabase)
- **Inngest** for background jobs
- **OpenAI** for extraction + embeddings

---

## Data Model

```
User (1) ──→ (N) Market
                    │
                    ├──→ (N) MarketSensor (search queries)
                    │
                    ├──→ (N) Conversation (Reddit/HN posts)
                    │         │
                    │         └──→ (N) PainStatement (extracted complaints)
                    │                   │
                    │                   └──→ (1) Signal (clustered pattern)
                    │
                    ├──→ (N) Signal
                    │         └──→ (N) SignalEvidence (quotes + links)
                    │
                    └──→ (N) Report
                              └──→ (N) ReportSignal (signal deltas)
```

### Key Entities

| Entity | Purpose |
|--------|---------|
| **Market** | User's market context (from website URL) |
| **MarketSensor** | Search queries for Reddit/HN |
| **Conversation** | Single Reddit post or HN comment |
| **PainStatement** | Extracted complaint with embedding |
| **Signal** | Clustered pattern across statements |
| **SignalEvidence** | Quote + URL for a signal |
| **Report** | Period snapshot with signal deltas |

### Enums

| Enum | Values |
|------|--------|
| **MarketStatus** | `pending`, `analyzing`, `active`, `error` |
| **SourceType** | `reddit`, `hackernews` |
| **ProcessingStatus** | `pending`, `processing`, `processed`, `error` |
| **PainType** | `frustration`, `limitation`, `unmet_expectation`, `comparison`, `switching_intent`, `feature_request`, `pricing`, `support`, `performance`, `other` |
| **SignalTrend** | `new`, `rising`, `stable`, `fading` |

---

## Background Jobs (Inngest)

| Job | Trigger | What It Does |
|-----|---------|--------------|
| `deriveMarketContext` | `market/context.derive` | Analyzes website, creates sensors |
| `fetchConversations` | Every 6h + `market/conversations.fetch` | Fetches from Reddit/HN |
| `processConversation` | `conversation/process` | Extracts pain statements |
| `clusterSignals` | Daily 2 AM + `market/signals.cluster` | Groups statements into signals |
| `generateReport` | Daily 3 AM + `market/report.generate` | Creates report with deltas |

### Job Flow

```
Market Created → deriveMarketContext → fetchConversations
                                              ↓
                                    processConversation (for each)
                                              ↓
                                       clusterSignals
                                              ↓
                                       generateReport
```

### Inngest Events

| Event Name | Payload | Triggers |
|------------|---------|----------|
| `market/context.derive` | `{ marketId }` | deriveMarketContext |
| `market/conversations.fetch` | `{ marketId }` | fetchConversations |
| `conversation/process` | `{ conversationId }` | processConversation |
| `market/signals.cluster` | `{ marketId }` | clusterSignals |
| `market/report.generate` | `{ marketId }` | generateReport |

---

## Key Files

### Connectors

| File | Purpose |
|------|---------|
| `src/lib/connectors/reddit/client.ts` | OAuth authentication + rate limiting (100 req/min) |
| `src/lib/connectors/reddit/search.ts` | Search posts and comments |
| `src/lib/connectors/reddit/types.ts` | TypeScript types for Reddit API |
| `src/lib/connectors/hn/client.ts` | Algolia HN API client (1 req/sec courtesy) |
| `src/lib/connectors/hn/search.ts` | Search stories and comments |
| `src/lib/connectors/hn/types.ts` | TypeScript types for HN API |

### Services

| File | Purpose |
|------|---------|
| `src/lib/services/markets/createMarket.ts` | Create market record |
| `src/lib/services/markets/getMarkets.ts` | Get/delete markets |
| `src/lib/services/markets/deriveContext.ts` | Analyze website + generate sensors |
| `src/lib/services/extraction/extractPainStatements.ts` | OpenAI extraction of pain points |
| `src/lib/services/extraction/generateEmbedding.ts` | Vector embeddings + cosine similarity |
| `src/lib/services/clustering/clusterPainStatements.ts` | Group statements into signals |
| `src/lib/services/signals/getSignals.ts` | Get signals with evidence |
| `src/lib/services/reports/generateReport.ts` | Delta computation + AI summary |
| `src/lib/services/reports/getReports.ts` | Get reports for a market |

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils/textSanitizer.ts` | Strip HTML, normalize text, detect prompt injection |

### Inngest Jobs

| File | Functions |
|------|-----------|
| `src/lib/inngest/deriveMarketContext.ts` | `deriveMarketContextJob` |
| `src/lib/inngest/fetchConversations.ts` | `fetchConversationsJob`, `scheduledFetchConversationsJob` |
| `src/lib/inngest/processConversation.ts` | `processConversationJob` |
| `src/lib/inngest/clusterSignals.ts` | `clusterSignalsJob`, `scheduledClusterSignalsJob` |
| `src/lib/inngest/generateReport.ts` | `generateReportJob`, `scheduledGenerateReportJob` |

### API Routes

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/markets` | GET, POST | List/create markets |
| `/api/markets/[marketId]` | GET, DELETE | Get/delete market |
| `/api/markets/[marketId]/refresh` | POST | Manual refresh trigger |
| `/api/markets/[marketId]/signals` | GET | List signals for market |
| `/api/markets/[marketId]/reports` | GET | List reports for market |
| `/api/signals/[signalId]` | GET | Signal detail with evidence |

### UI Pages

| Page | Path | Purpose |
|------|------|---------|
| Markets List | `/markets` | View all markets |
| New Market | `/markets/new` | Create market form |
| Market Detail | `/markets/[id]` | Report + signals tabs |
| Signal Detail | `/markets/[id]/signals/[signalId]` | Signal with evidence |
| Report History | `/markets/[id]/reports` | All reports |

### UI Components

| Directory | Components |
|-----------|------------|
| `src/components/markets/` | `MarketCard`, `MarketStatusBadge`, `CreateMarketForm` |
| `src/components/signals/` | `SignalCard`, `TrendBadge`, `PainTypeBadge`, `EvidenceList` |
| `src/components/reports/` | `ReportSummary`, `SignalDeltaTable` |

---

## How Conversation Processing Works

### Step 1: Fetch Conversations
- Reddit: OAuth API with query, returns posts + comments
- HN: Algolia API with query, returns stories + comments
- Deduplication: `externalId` unique per source (e.g., `t3_abc123`, `hn_12345`)

### Step 2: Sanitize Content
- Strip HTML tags
- Normalize unicode
- Detect prompt injection patterns
- Truncate to max length

### Step 3: Extract Pain Statements
- Send to OpenAI GPT-4o-mini with market context
- Returns structured JSON with:
  - `statement`: The extracted complaint
  - `painType`: Category of pain
  - `toolsMentioned`: Products referenced
  - `switchingIntent`: Boolean
  - `confidence`: 0.0-1.0

### Step 4: Generate Embeddings
- Each statement → OpenAI `text-embedding-3-small`
- Returns 1536-dimension vector
- Stored in database for clustering

---

## How Clustering Works

### The Algorithm

1. Get all **unclustered** pain statements (where `signalId = null`)
2. Get all **existing signals** with their centroids
3. For each statement:
   - Compare embedding to each signal centroid using **cosine similarity**
   - If similarity ≥ 0.85 → Add to that signal
   - Else → Try to match with other unclustered statements
   - If still no match → Start new potential cluster
4. For new clusters with 2+ statements:
   - Generate title via OpenAI
   - Create new Signal record
   - Link statements to signal
5. Update signal metrics:
   - Recalculate centroid (average of embeddings)
   - Update frequency (count of statements)
   - Update lastSeenAt

### Cosine Similarity

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

### Centroid Calculation

```typescript
function calculateCentroid(embeddings: number[][]): number[] {
  const centroid = new Array(1536).fill(0);
  for (const embedding of embeddings) {
    for (let i = 0; i < embedding.length; i++) {
      centroid[i] += embedding[i];
    }
  }
  for (let i = 0; i < centroid.length; i++) {
    centroid[i] /= embeddings.length;
  }
  return centroid;
}
```

---

## How Reports Work

### Delta Computation

1. Define periods:
   - **Current**: last 30 days
   - **Previous**: 30-60 days ago
2. For each signal:
   - Count pain statements in current period
   - Count pain statements in previous period
3. Determine trend:
   - `new`: previous = 0, current > 0
   - `rising`: current > previous × 1.3
   - `fading`: current < previous × 0.7
   - `stable`: otherwise

### AI Summary

- Send signal data to GPT-4o-mini
- Returns:
  - `overview`: 2-3 sentence summary
  - `keyInsights`: Array of insights
  - `recommendations`: Actionable suggestions

---

## Key Configuration

| Setting | Location | Default | Description |
|---------|----------|---------|-------------|
| `SIMILARITY_THRESHOLD` | `clusterPainStatements.ts` | 0.85 | Min similarity to cluster (0-1) |
| `REPORT_PERIOD_DAYS` | `generateReport.ts` | 30 | Days in each report period |
| Fetch schedule | `fetchConversations.ts` | `0 */6 * * *` | Every 6 hours |
| Cluster schedule | `clusterSignals.ts` | `0 2 * * *` | Daily 2 AM |
| Report schedule | `generateReport.ts` | `0 3 * * *` | Daily 3 AM |
| Min cluster size | `clusterPainStatements.ts` | 2 | Min statements to form signal |
| Confidence threshold | `extractPainStatements.ts` | 0.5 | Min confidence to keep |

---

## Environment Variables

```env
# Reddit API (create "script" app at reddit.com/prefs/apps)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

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
```

---

## Data Flow Summary

```
1. User pastes URL
   └── POST /api/markets
       └── Create Market (status: pending)
       └── Trigger: market/context.derive

2. Derive Context (Inngest)
   └── Fetch website HTML
   └── OpenAI: Analyze content
   └── Generate search sensors
   └── Update status: active
   └── Trigger: market/conversations.fetch

3. Fetch Conversations (Inngest - every 6h)
   └── For each sensor:
       └── Reddit API / HN Algolia
       └── Sanitize content
       └── Upsert conversations (dedup by externalId)
   └── Trigger: conversation/process (for each new)

4. Process Conversation (Inngest)
   └── OpenAI: Extract pain statements
   └── OpenAI: Generate embeddings
   └── Save pain statements with embeddings

5. Cluster Signals (Inngest - daily 2 AM)
   └── Get unclustered statements
   └── Compare to existing signal centroids
   └── Group similar statements
   └── Create new signals (if 2+ statements)
   └── Update signal metrics
   └── Create evidence records
   └── Trigger: market/report.generate

6. Generate Report (Inngest - daily 3 AM)
   └── Compute 30-day deltas
   └── Determine trends (new/rising/stable/fading)
   └── OpenAI: Generate summary
   └── Save report + report signals

7. User Views
   └── /markets - List markets
   └── /markets/[id] - Report + signals
   └── /markets/[id]/signals/[id] - Evidence
```

---

## Current Limitations

1. **No cross-user sharing** - Each market is isolated per user. If 100 users monitor "notion.so", we fetch the same data 100 times.

2. **No real-time updates** - Jobs run on schedule (6h for fetch, daily for cluster/report).

3. **Reddit API limits** - 100 requests/minute with OAuth.

4. **OpenAI costs** - Each extraction + embedding costs money. Budget ~$0.01-0.05 per conversation.

5. **Single statements stay unclustered** - Need 2+ similar statements to form a signal.

---

## Future Improvements

- [ ] Shared conversation pool across users (reduce API calls)
- [ ] More sources (Twitter/X, ProductHunt, G2, Capterra)
- [ ] Custom sensor configuration (user can add/edit queries)
- [ ] Alert notifications for rising signals
- [ ] Export functionality (CSV, PDF reports)
- [ ] Webhook integrations (Slack, email)
- [ ] Manual signal merging/splitting
- [ ] Confidence tuning per market

