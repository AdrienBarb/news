# CLAUDE.md

## Project Overview

**Reddit Lead Finder** is a one-time lead discovery tool for SaaS founders. It helps founders find high-intent Reddit conversations where people are actively expressing problems, asking for recommendations, or comparing tools.

Founders pay once to run an AI agent that scans Reddit based on their product context and delivers a curated list of leads. The app does not automate posting or messaging - it finds opportunities, the founder decides which ones to engage with.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Prisma** + PostgreSQL (Supabase)
- **Inngest** for background jobs
- **OpenAI** for website analysis & lead scoring
- **Apify** for Reddit data fetching
- **Stripe** for one-time payments
- **React Query** (via useApi hook) for client-side data fetching
- **Zustand** for client-side global state
- **Tailwind CSS** + shadcn/ui for styling

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npx prisma migrate dev    # Run migrations
npx prisma generate       # Generate Prisma client
npx inngest dev           # Run Inngest dev server
```

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API route handlers
│   └── d/                # Dashboard pages (authenticated)
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   └── agents/           # Agent-specific components
├── lib/
│   ├── api/              # Axios instance
│   ├── connectors/       # External service integrations (Apify)
│   ├── constants/        # Constants (timeWindow, errorMessages)
│   ├── db/               # Prisma client
│   ├── errors/           # Error handler
│   ├── hooks/            # Custom hooks (useApi)
│   ├── inngest/          # Background jobs
│   ├── schemas/          # Zod validation schemas
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
└── types/                # TypeScript type definitions
```

## Data Model

```
User (1) ──→ (N) AiAgent ──→ (N) Lead
```

### Key Entities

| Entity      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| **User**    | Authenticated user                              |
| **AiAgent** | One-time job to find leads (website + keywords) |
| **Lead**    | Reddit post with potential buying intent        |

### AgentStatus Flow

`PENDING_PAYMENT` → `QUEUED` → `FETCHING_LEADS` → `ANALYZING_LEADS` → `COMPLETED` (or `FAILED`)

### Time Windows & Pricing

| Time Window     | Label          | Price  | Posts/Keyword |
| --------------- | -------------- | ------ | ------------- |
| `LAST_7_DAYS`   | Recent signals | $9.50  | 10            |
| `LAST_30_DAYS`  | Market scan    | $24.50 | 20            |
| `LAST_365_DAYS` | Deep research  | $49.50 | 30            |

## Key Files

| File                                  | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `src/lib/inngest/runAgent.ts`         | Main lead fetching & analysis job     |
| `src/lib/connectors/reddit/client.ts` | Apify integration for Reddit scraping |
| `src/lib/hooks/useApi.ts`             | Centralized API hook (React Query)    |
| `src/lib/constants/timeWindow.ts`     | Time window config, pricing, limits   |
| `src/lib/constants/errorMessage.ts`   | Centralized error messages            |
| `src/lib/errors/errorHandler.ts`      | Centralized error handler             |
| `src/lib/better-auth/strictlyAuth.ts` | Auth HOC for protected routes         |

## API Routes

| Route                   | Methods   | Purpose                         |
| ----------------------- | --------- | ------------------------------- |
| `/api/agents`           | GET, POST | List agents / Create + checkout |
| `/api/agents/[agentId]` | GET       | Get agent details with leads    |
| `/api/analyze-website`  | POST      | AI-analyze website for keywords |
| `/api/webhooks/stripe`  | POST      | Handle Stripe payment events    |

## Core Flows

### Agent Creation Flow

1. User enters website URL → POST `/api/analyze-website` → AI returns description + keywords
2. User reviews/edits keywords + competitors (max 20 keywords, max 3 competitors)
3. User selects time window → POST `/api/agents` → Create AiAgent (PENDING_PAYMENT) + Stripe Checkout
4. Payment completed → Stripe webhook → Status → QUEUED → Trigger Inngest `agent/run`

### Lead Discovery Flow (Inngest)

1. Status → FETCHING_LEADS
2. For each keyword: fetch Reddit posts via Apify, filter by time window
3. Deduplicate by externalId
4. Status → ANALYZING_LEADS
5. AI scores each post for relevance (0-100), classifies intent
6. Save leads to database
7. Status → COMPLETED
8. Send email notification

---

## Coding Standards

### Core Principles

1. **Type Safety First**: Always use TypeScript types. Avoid `any` unless absolutely necessary.
2. **Server Components Default**: Use Server Components by default, Client Components only when needed.
3. **Code Reusability**: Extract reusable logic into utilities, hooks, and services.
4. **Readability**: Split complex code into smaller, well-named functions/components.

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities/Hooks/Services**: camelCase (`formatDate.ts`, `useApi.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **No index files**: Never create `index.ts` for re-exporting. Always import directly from source.

### API Routes Pattern

```typescript
import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { strictlyAuth } from "@/lib/better-auth/strictlyAuth";
import { NextResponse, NextRequest } from "next/server";

export const POST = strictlyAuth(async (req: NextRequest) => {
  try {
    const { auth } = req;
    const userId = auth?.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: errorMessages.MISSING_FIELDS },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = someSchema.parse(body);
    const result = await someService({ userId, data: validatedData });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
});
```

### Client-Side Data Fetching (useApi Hook)

Always use `useApi` hook for client-side API calls. Never use axios directly.

```typescript
import useApi from "@/lib/hooks/useApi";

// GET request
const { useGet } = useApi();
const { data, isLoading, error } = useGet("/endpoint", { param: "value" });

// POST request
const { usePost } = useApi();
const { mutate: createItem, isPending } = usePost("/endpoint", {
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["items"] });
  },
});
```

### Service Layer Pattern

Extract database logic to `src/lib/services/`. Services should be reusable and single-responsibility.

```typescript
import { prisma } from "@/lib/db/prisma";

export async function createAgent({
  userId,
  data,
}: {
  userId: string;
  data: { websiteUrl: string; keywords: string[] };
}) {
  return await prisma.aiAgent.create({
    data: { userId, ...data },
  });
}
```

### Validation with Zod

Define schemas in `src/lib/schemas/`. Use for request validation in API routes.

```typescript
import { z } from "zod";

export const createAgentSchema = z.object({
  websiteUrl: z.string().url(),
  keywords: z.array(z.string()).max(20),
  timeWindow: z.enum(["LAST_7_DAYS", "LAST_30_DAYS", "LAST_365_DAYS"]),
});
```

### Styling

- Use Tailwind CSS utility classes
- Use shadcn/ui components from `@/components/ui/`
- Use theme-aware classes (`text-foreground`, `bg-background`)

### Import Organization

```typescript
// External
import { NextRequest } from "next/server";
import { z } from "zod";

// Internal
import { prisma } from "@/lib/db/prisma";
import { errorHandler } from "@/lib/errors/errorHandler";

// Types
import type { AiAgent } from "@prisma/client";
```

## Environment Variables

```env
# Apify (Reddit scraping)
APIFY_API_KEY=

# OpenAI
OPENAI_API_KEY=

# Database (Supabase)
DATABASE_URL=
DIRECT_URL=

# Inngest
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Auth
BETTER_AUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_BASE_URL=
```

## MCP Servers

This project uses MCP (Model Context Protocol) servers to extend Claude Code capabilities.

### Available Servers

| Server | Purpose |
|--------|---------|
| **context7** | Up-to-date documentation for Next.js, Prisma, Stripe, React Query, etc. |
| **puppeteer** | Browser automation, screenshots, UI testing |
| **github** | PR creation, issue management, branch operations |
| **prisma** | Migration status, schema management, Prisma CLI |
| **postgres** | Direct database queries for debugging |

### Usage Guidelines

1. **Always use Context7** when working with external libraries:
   - Before implementing features with Next.js, Prisma, Stripe, or any library
   - Add `use context7` to prompts or let the skill auto-detect

2. **Use Puppeteer** for:
   - Taking screenshots of the dashboard UI
   - Visual regression testing
   - Debugging frontend issues

3. **Use GitHub MCP** for:
   - Creating PRs with proper descriptions
   - Managing issues
   - Branch operations

4. **Use Prisma MCP** for:
   - Checking migration status (`prisma migrate status`)
   - Generating client after schema changes
   - Database workflow assistance

5. **Use PostgreSQL MCP** for:
   - Debugging data issues with direct SQL queries
   - Exploring database state
   - Quick data verification

### Configuration

MCP servers are configured in `~/.claude.json`. Ensure environment variables are set:

- `GITHUB_PERSONAL_ACCESS_TOKEN` for GitHub operations
- `DATABASE_URL` for PostgreSQL access