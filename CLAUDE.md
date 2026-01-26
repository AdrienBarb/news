# CLAUDE.md

## Project Overview

**Prediqte** is a pay-per-lead discovery tool for B2B SaaS founders. It helps founders find high-intent conversations across multiple platforms (Reddit, HackerNews, Twitter, LinkedIn) where people are actively expressing problems, asking for recommendations, or comparing tools.

Founders pay once to run an AI agent that scans their chosen platform based on their product context and ICP (Ideal Customer Profile), delivering a guaranteed number of qualified leads. The app does not automate posting or messaging - it finds opportunities, the founder decides which ones to engage with.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript + React 19
- **Prisma** + PostgreSQL (Supabase)
- **Inngest** for background jobs
- **OpenAI** for website analysis & lead scoring
- **Apify** for Reddit data fetching
- **Stripe** for one-time payments
- **Upstash Redis** for rate limiting (protects free tools)
- **React Query** (via useApi hook) for client-side data fetching
- **Zustand** for client-side global state
- **react-hook-form** + Zod for form handling and validation
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

| Entity      | Purpose                                                     |
| ----------- | ----------------------------------------------------------- |
| **User**    | Authenticated user                                          |
| **AiAgent** | One-time job to find leads (website + keywords + platform)  |
| **Lead**    | Post/conversation with potential buying intent (any platform)|

### AgentStatus Flow

`PENDING_PAYMENT` → `QUEUED` → `FETCHING_LEADS` → `ANALYZING_LEADS` → `COMPLETED` (or `FAILED`)

### Platforms

| Platform      | Status       | Description                        |
| ------------- | ------------ | ---------------------------------- |
| `reddit`      | Live         | Find leads in Reddit discussions   |
| `hackernews`  | Coming Soon  | Find leads in HN discussions       |
| `twitter`     | Coming Soon  | Find leads in Twitter conversations|
| `linkedin`    | Coming Soon  | Find leads in LinkedIn posts       |

### Lead Tiers & Pricing (Pay-Per-Lead)

| Lead Tier  | Leads Included | Price  | Search Depth |
| ---------- | -------------- | ------ | ------------ |
| `STARTER`  | 10 leads       | $9.50  | 30 days      |
| `GROWTH`   | 30 leads       | $24.50 | 90 days      |
| `SCALE`    | 75 leads       | $49.50 | 365 days     |

*Note: Legacy agents may still use `timeWindow` field for backward compatibility.*

## Key Files

| File                                  | Purpose                               |
| ------------------------------------- | ------------------------------------- |
| `src/lib/inngest/runAgent.ts`         | Main lead fetching & analysis job     |
| `src/lib/connectors/reddit/client.ts` | Apify integration for Reddit scraping |
| `src/lib/hooks/useApi.ts`             | Centralized API hook (React Query)    |
| `src/lib/constants/platforms.ts`      | Platform config (Reddit, HN, etc.)    |
| `src/lib/constants/leadTiers.ts`      | Lead tier config, pricing, limits     |
| `src/lib/constants/timeWindow.ts`     | Legacy time window config             |
| `src/lib/constants/errorMessage.ts`   | Centralized error messages            |
| `src/lib/errors/errorHandler.ts`      | Centralized error handler             |
| `src/lib/better-auth/strictlyAuth.ts` | Auth HOC for protected routes         |
| `src/lib/ratelimit/client.ts`         | Upstash Redis rate limiters           |
| `src/lib/ratelimit/checkRateLimit.ts` | Rate limit check utility              |

## API Routes

| Route                                      | Methods | Purpose                             | Rate Limited |
| ------------------------------------------ | ------- | ----------------------------------- | ------------ |
| `/api/agents`                              | GET, POST | List agents / Create + checkout   | No (auth)    |
| `/api/agents/[agentId]`                    | GET     | Get agent details with leads        | No (auth)    |
| `/api/analyze-website`                     | POST    | AI-analyze website for keywords     | No (auth)    |
| `/api/webhooks/stripe`                     | POST    | Handle Stripe payment events        | No           |
| `/api/tools/icp-generator/analyze`         | POST    | Analyze input for ICP data          | 10/hour      |
| `/api/tools/icp-generator/generate`        | POST    | Generate comprehensive ICP report   | 5/hour       |
| `/api/tools/icp-generator/send-email`      | POST    | Email ICP report to user            | 5/hour       |

### Rate Limiting

Free public tools (ICP Generator) are rate-limited by IP address using **Upstash Redis** to prevent abuse and control OpenAI API costs:

- **Analyze endpoint**: 10 requests/hour (uses gpt-4o-mini)
- **Generate endpoint**: 5 requests/hour (uses gpt-4o - most expensive)
- **Email endpoint**: 5 requests/hour (Resend costs)

Rate limits use a **sliding window** algorithm and return:
- **429 status** when limit exceeded
- **X-RateLimit-*** headers (Limit, Remaining, Reset)
- Error message: "Too many requests. Please try again later."

## Core Flows

### Agent Creation Flow

1. User enters website URL → POST `/api/analyze-website` → AI returns description + keywords + target personas + platform suggestions
2. User reviews/edits description, keywords, competitors, and target personas (ICP)
3. User selects platform (Reddit live, others coming soon)
4. User selects lead tier (Starter/Growth/Scale) → POST `/api/agents` → Create AiAgent (PENDING_PAYMENT) + Stripe Checkout
5. Payment completed → Stripe webhook → Status → QUEUED → Trigger Inngest `agent/run`

### Lead Discovery Flow (Inngest)

1. Status → FETCHING_LEADS
2. Determine search depth from lead tier (30/90/365 days)
3. For each keyword: fetch posts from selected platform via Apify
4. Deduplicate by externalId
5. Status → ANALYZING_LEADS
6. AI scores each post for relevance (0-100), classifies intent
7. **Guarantee lead count**: Select top N leads by relevance to match tier (10/30/75)
8. Save leads to database, trim excess
9. Status → COMPLETED
10. Send email notification

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

**Authenticated Route:**
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

**Public Route with Rate Limiting:**
```typescript
import { errorMessages } from "@/lib/constants/errorMessage";
import { errorHandler } from "@/lib/errors/errorHandler";
import { NextResponse, NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/ratelimit/checkRateLimit";
import { someLimiter } from "@/lib/ratelimit/client";

export async function POST(req: NextRequest) {
  try {
    // Rate limit check (FIRST THING in public routes)
    const rateLimit = await checkRateLimit(req, someLimiter);
    if (!rateLimit.success) return rateLimit.response;

    const body = await req.json();
    const validatedData = someSchema.parse(body);
    const result = await someService({ data: validatedData });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}
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
  competitors: z.array(z.string()).max(3),
  targetPersonas: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).optional(),
  platform: z.enum(["reddit", "hackernews", "twitter", "linkedin"]),
  leadTier: z.enum(["STARTER", "GROWTH", "SCALE"]),
});
```

### Forms (react-hook-form + Zod + shadcn/ui)

Always use `react-hook-form` with Zod validation and shadcn/ui Form components for all forms.

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type FormValues = z.infer<typeof formSchema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", name: "" },
  });

  const onSubmit = (data: FormValues) => {
    // Handle submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Styling & Design

- Use Tailwind CSS utility classes
- Use shadcn/ui components from `@/components/ui/` for all UI elements
- Use theme-aware classes (`text-foreground`, `bg-background`, `text-muted-foreground`, etc.)
- **Respect the existing design**: Match the current app's visual style, spacing, and color palette
- Do not introduce new colors or design patterns without explicit approval
- Keep UI consistent with existing components and pages

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

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

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