# 3 Minute Brief

A tech news application that curates and summarizes the most important tech stories every day. The app fetches tech news articles, uses OpenAI to generate concise summaries, and delivers 10 curated articles daily to users.

## 📰 About

**3 Minute Brief** is your daily tech briefing that helps you stay informed without the overwhelm. Every day, the app:

- Fetches the latest tech news articles from various sources
- Uses OpenAI to analyze and summarize each article
- Curates the 10 most important stories
- Delivers them to users in a clean, digestible format

**Tech Moves Fast. Stay Ahead in 3 Minutes a Day.**

## 🚀 Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 19** - Latest React features

### Styling

- **Tailwind CSS v4** - Utility-first CSS framework with CSS-first configuration
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Icon library

### Database & ORM

- **Prisma** - Next-generation ORM
- **PostgreSQL** - Database (via Supabase)
- **Supabase** - Local development database

### Authentication

- **Better-auth** - Modern authentication library
- Magic link authentication (passwordless)
- Session management

### AI & Processing

- **OpenAI** - Article summarization and analysis
- **Inngest** - Background job processing for article fetching and processing
- **@mozilla/readability** - Article content extraction
- **jsdom** - HTML parsing and content extraction

### State Management

- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management

### HTTP Client

- **Axios** - HTTP client with interceptors
- Global error handling
- Automatic error state management

### Email

- **Resend** - Email delivery service
- **React Email** - Build beautiful emails with React
- **Tailwind CSS** - Styled email templates

### Analytics

- **PostHog** - Product analytics (client & server-side)

### UI/UX

- **React Hot Toast** - Toast notifications
- **shadcn/ui** - Pre-built accessible components
- **Swiper** - Touch slider component
- **nuqs** - URL state management

## 📦 Features

- ✅ **Daily Tech News Curation** - Automatically fetches and processes tech news articles
- ✅ **AI-Powered Summaries** - Uses OpenAI to generate concise, informative summaries
- ✅ **10 Articles Daily** - Curated selection of the most important tech stories
- ✅ **User Personalization** - Tag-based preferences for customized feeds
- ✅ **Authentication** - Magic link authentication with Better-auth
- ✅ **Database** - Prisma + PostgreSQL (Supabase) for data persistence
- ✅ **Background Processing** - Inngest for reliable article processing workflows
- ✅ **Email Notifications** - Resend + React Email for beautiful email templates
- ✅ **Global Error Handling** - Comprehensive error management
- ✅ **API Client** - React Query hooks for efficient data fetching
- ✅ **State Management** - Zustand for client-side state
- ✅ **Analytics** - PostHog for product analytics
- ✅ **UI Components** - shadcn/ui for accessible, beautiful components
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Tailwind CSS v4** - Modern styling

## 🛠️ Setup Guide

Follow these steps to get the application up and running.

### Prerequisites

Before you begin, make sure you have installed:

- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm/yarn/pnpm** - Package manager (npm comes with Node.js)
- **Docker Desktop** - Required for local Supabase development
  - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Make sure Docker is running before starting Supabase

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd news
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Prisma, Better-auth, OpenAI, Inngest, and other dependencies.

### Step 3: Set Up Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` and configure the following variables:

#### Database Configuration (Supabase Local)

When you start Supabase locally, it will provide these URLs. For now, use the defaults:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
```

#### Authentication (Better-auth)

Generate a secure secret key for Better-auth:

```bash
# Generate a random secret (you can use this command)
openssl rand -base64 32
```

Then add to `.env`:

```env
BETTER_AUTH_SECRET="your-generated-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

#### OpenAI (Required for Article Summarization)

1. Sign up for an account at [OpenAI](https://platform.openai.com)
2. Get your API key from the API keys section
3. Add to `.env`:

```env
OPENAI_API_KEY="sk-your-api-key-here"
```

#### Inngest (Background Job Processing)

1. Sign up at [Inngest](https://www.inngest.com) (free tier available)
2. Get your event key and signing key from the dashboard
3. Add to `.env`:

```env
INNGEST_EVENT_KEY="your-event-key-here"
INNGEST_SIGNING_KEY="your-signing-key-here"
```

#### Email Service (Resend)

1. Sign up for a free account at [Resend](https://resend.com)
2. Get your API key from the dashboard
3. Add to `.env`:

```env
RESEND_API_KEY="re_your_api_key_here"
```

**Note:** For development/testing, you can use Resend's test domain `onboarding@resend.dev` as the `from` email address. For production, you'll need to verify your own domain.

#### Analytics (PostHog) - Optional

1. Sign up at [PostHog](https://posthog.com) (free tier available)
2. Get your API key from project settings
3. Add to `.env`:

```env
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

#### App Environment

```env
NEXT_PUBLIC_APP_ENV="development"
```

### Step 4: Start Supabase (Local Database)

Supabase provides a local PostgreSQL database for development.

1. Start Supabase:

```bash
supabase start
```

This will:

- Start a local PostgreSQL database
- Start Supabase Studio (database GUI)
- Provide connection URLs

2. **Important:** After starting Supabase, check the output and update your `.env` file if the database URLs are different from the defaults.

3. Access Supabase Studio (optional):
   - Open http://127.0.0.1:54328 in your browser
   - You can view and manage your database here

### Step 5: Set Up Database Schema

The application includes a Prisma schema with models for users, articles, tags, and interactions. Since the migrations folder is empty (by design), you need to create your initial migration or push the schema directly.

**Option A: Create Migration (Recommended for Production)**

This creates a migration file that you can version control:

```bash
npm run db:migrate
```

When prompted, enter a migration name like `initial_setup` or `init`.

This will:

- Create a migration file in `src/lib/db/migrations/`
- Apply the migration to your database
- Generate Prisma Client automatically

**Option B: Push Schema Directly (Quick for Development)**

This syncs your database schema without creating migration files:

```bash
npm run db:push
```

This is faster and useful for rapid prototyping, but doesn't create migration files for version control.

**Which option to choose?**

- Use **Option A** (`db:migrate`) if you want to track schema changes in git
- Use **Option B** (`db:push`) if you're just prototyping and don't need migration history

**Note:** After running either command, the database will have all tables from `schema.prisma`:

- `user` - User accounts
- `session` - User sessions
- `account` - Authentication accounts
- `verification` - Email verification tokens
- `article` - Tech news articles
- `tag` - Article tags/categories
- `userTagPreference` - User tag preferences
- `interaction` - User interactions with articles

### Step 6: Generate Prisma Client (if needed)

If you used `db:push` in Step 5, you need to generate Prisma Client manually:

```bash
npm run db:generate
```

**Note:** If you used `db:migrate`, Prisma Client is generated automatically, so you can skip this step.

### Step 7: Configure Your Project

1. Open `config.json` and update with your project details:

```json
{
  "project": {
    "name": "3 Minute Brief",
    "shortName": "3minBrief",
    "description": "Your daily 3-minute tech briefing",
    "tagline": "Tech Moves Fast. Stay Ahead in 3 Minutes a Day.",
    "url": "https://thehackerbrief.com"
  },
  "contact": {
    "email": "hello@thehackerbrief.com",
    "supportEmail": "support@thehackerbrief.com"
  }
}
```

2. Update SEO settings, social links, and feature flags as needed.

### Step 8: Start Development Server

```bash
npm run dev
```

Your application will be available at:

- **Frontend:** http://localhost:3000
- **Supabase Studio:** http://127.0.0.1:54328
- **Inngest Dev Server:** http://localhost:8288 (if running locally)

### Step 9: Set Up Inngest Dev Server (Optional)

For local development of background jobs:

```bash
npx inngest-cli@latest dev
```

This will start the Inngest dev server at http://localhost:8288 where you can monitor and test your background jobs.

### Step 10: Verify Setup

1. **Check Authentication:**
   - Click "Sign In" in the navbar
   - Try signing in with a magic link (email will be sent via Resend)

2. **Check Article Feed:**
   - Navigate to `/news` to see the article feed
   - Articles should be displayed with summaries

3. **Check Database:**
   - Open Supabase Studio at http://127.0.0.1:54328
   - Verify tables are created (user, session, account, article, tag, etc.)

### Troubleshooting

#### Database Connection Issues

- Make sure Docker is running
- Verify Supabase is started: `supabase status`
- Check that `DATABASE_URL` in `.env` matches Supabase output

#### Migration Errors

- If migrations fail, try `npm run db:push` instead
- Make sure your database is running: `supabase status`
- Check Prisma schema syntax: `npx prisma validate`

#### OpenAI API Issues

- Verify `OPENAI_API_KEY` is set correctly
- Check your OpenAI account has sufficient credits
- Review API rate limits in OpenAI dashboard

#### Inngest Issues

- Make sure `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are set
- Verify Inngest dev server is running (if testing locally)
- Check Inngest dashboard for job execution logs

#### Email Not Sending

- Verify `RESEND_API_KEY` is set correctly
- For development, use `onboarding@resend.dev` as the `from` email
- Check Resend dashboard for email logs
- Check server console for error messages

#### Port Already in Use

- Change the port in `next.config.ts` or use: `npm run dev -- -p 3001`
- For Supabase ports, edit `supabase/config.toml`

### Next Steps

- Configure RSS feeds or news sources for article fetching
- Set up Inngest functions for daily article processing
- Customize `config.json` with your branding
- Update landing page content in `src/components/sections/`
- Set up production database (Supabase Cloud or your own PostgreSQL)
- Configure production environment variables

## 🔐 Environment Variables Reference

All environment variables should be set in your `.env` file. Here's a complete reference:

### Required Variables

```env
# Database (Supabase)
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:54325/postgres"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# OpenAI (Required for article summarization)
OPENAI_API_KEY="sk-your-api-key-here"

# Inngest (Background job processing)
INNGEST_EVENT_KEY="your-event-key-here"
INNGEST_SIGNING_KEY="your-signing-key-here"

# Resend (for email sending)
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="onboarding@resend.dev"  # Optional: defaults to config.contact.email
```

### Optional Variables

```env
# PostHog Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY="your_posthog_key_here"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# App Environment
NEXT_PUBLIC_APP_ENV="development"
```

### Production Variables

For production, update these:

```env
DATABASE_URL="your-production-database-url"
DIRECT_URL="your-production-direct-url"
BETTER_AUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_ENV="production"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # Use your verified domain
```

**Security Note:** Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## ⚙️ Configuration

This application uses a centralized `config.json` file to manage project-specific settings like SEO, branding, contact info, and feature flags.

### Config Structure

The `config.json` file contains:

- **Project Info**: Name, description, tagline, URLs, logos
- **SEO**: Title, description, keywords, Open Graph settings
- **Contact**: Email addresses
- **Social**: Social media links

### Using the Config

Simply import the config object and use it directly:

```typescript
import config from "@/lib/config";

function MyComponent() {
  return (
    <div>
      <h1>{config.project.name}</h1>
      <p>{config.project.tagline}</p>
      <p>{config.seo.description}</p>
      <a href={config.social.twitter}>Twitter</a>
    </div>
  );
}
```

### Customizing Your Project

1. **Update `config.json`** with your project details:

```json
{
  "project": {
    "name": "3 Minute Brief",
    "tagline": "Tech Moves Fast. Stay Ahead in 3 Minutes a Day.",
    "url": "https://thehackerbrief.com"
  },
  "contact": {
    "email": "hello@thehackerbrief.com"
  }
}
```

2. **Use in components**:

```typescript
import config from "@/lib/config";

const { name, tagline } = config.project;
```

### Theme Colors

Theme colors are managed directly in `src/app/globals.css` using Tailwind v4's `@theme` directive. Edit the CSS file to customize colors.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Better-auth endpoints
│   │   ├── inngest/       # Inngest webhook handler
│   │   ├── interactions/  # User interaction endpoints
│   │   ├── tags/          # Tag endpoints
│   │   ├── user/          # User endpoints
│   │   └── webhooks/      # Webhook handlers (RSS, etc.)
│   ├── news/              # News feed page
│   ├── onboarding/        # User onboarding flow
│   ├── globals.css        # Global styles + Tailwind
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── providers/        # Context providers
│   ├── sections/         # Landing page sections
│   ├── setup/            # Setup/onboarding components
│   ├── tracking/         # Analytics components
│   ├── FeedCard.tsx      # Article feed card component
│   ├── UserFeed.tsx      # User feed component
│   └── ...
├── lib/                  # Library code
│   ├── api/             # API client (Axios)
│   ├── better-auth/     # Auth configuration
│   ├── db/              # Prisma client & schema
│   ├── emails/          # Email templates
│   ├── hooks/           # Custom React hooks
│   ├── inngest/         # Inngest functions
│   ├── openai/          # OpenAI client & article analysis
│   ├── resend/          # Email client
│   ├── schemas/         # Zod schemas
│   ├── services/        # Business logic services
│   ├── stores/          # Zustand stores
│   ├── tracking/        # PostHog client
│   └── utils/           # Utility functions
└── data/                # Static data
    └── siteMetadata.ts  # Site metadata
```

## 🎯 Usage Examples

### Authentication

```typescript
import { signIn, signOut, useSession } from "@/lib/better-auth/auth-client";

// Sign in with magic link
await signIn.magicLink({
  email: "user@example.com",
  callbackURL: "/",
});

// Get session
const { data: session } = useSession();

// Sign out
await signOut();
```

### API Requests with React Query

```typescript
import useApi from "@/lib/hooks/useApi";

function MyComponent() {
  const { useGet, usePost, usePut } = useApi();

  // GET request
  const { data, isLoading, error } = useGet("/api/articles", { page: 1 });

  // POST request
  const createInteraction = usePost("/api/interactions", {
    onSuccess: () => {
      console.log("Interaction created!");
    },
  });

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={() => createInteraction.mutate({ articleId: "123" })}>
        Create Interaction
      </button>
    </div>
  );
}
```

### State Management with Zustand

```typescript
import { useErrorStore } from "@/lib/stores/errorStore";

function MyComponent() {
  const { isError, statusCode, errorMessage, setError, clearError } =
    useErrorStore();

  // Use error state
  if (isError) {
    console.log(`Error ${statusCode}: ${errorMessage}`);
  }
}
```

### Sending Emails

```typescript
import { resendClient } from "@/lib/resend/resendClient";
import { render } from "@react-email/render";
import { WelcomeEmail } from "@/lib/emails/WelcomeEmail";

const emailHtml = await render(WelcomeEmail({ name: "John" }));

await resendClient.emails.send({
  from: "onboarding@resend.dev",
  to: "user@example.com",
  subject: "Welcome!",
  html: emailHtml,
});
```

### Using OpenAI for Article Analysis

```typescript
import { analyzeArticleLLM } from "@/lib/openai/analyzeArticleLLM";

const articleContent = "Full article text here...";
const summary = await analyzeArticleLLM(articleContent);
```

### Using shadcn/ui Components

```typescript
import { Button } from "@/components/ui/button";

<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
```

### PostHog Analytics

**Client-side:**

```typescript
import { usePostHog } from "posthog-js/react";

const posthog = usePostHog();
posthog.capture("event_name", { property: "value" });
```

**Server-side:**

```typescript
import { postHogClient } from "@/lib/tracking/postHogClient";

postHogClient.capture({
  distinctId: "user-id",
  event: "server_event",
  properties: { key: "value" },
});
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run email:dev` - Start React Email dev server

## 🗄️ Database

### Prisma Schema

- **Schema Location:** `src/lib/db/schema.prisma`
- **Migrations Folder:** `src/lib/db/migrations/` (empty by default - you'll create your own)

The schema includes:

- User authentication models (User, Session, Account, Verification)
- Article models for storing tech news articles
- Tag models for categorizing articles
- UserTagPreference for personalized feeds
- Interaction models for tracking user engagement

### Database Migrations

**First Time Setup:**

When you first clone this repository, the migrations folder is empty. You need to apply the database schema. You have two options:

**1. Create Initial Migration (Recommended)**

```bash
npm run db:migrate
```

Enter a name like `initial_setup` when prompted. This will:

- Create a migration file in `src/lib/db/migrations/`
- Apply all tables from `schema.prisma` to your database
- Generate Prisma Client

**2. Push Schema Directly (Quick Alternative)**

```bash
npm run db:push
```

This applies the schema without creating migration files. Useful for quick setup, but migration files won't be tracked in git.

**After Initial Setup:**

For all future schema changes, use migrations:

```bash
# 1. Modify src/lib/db/schema.prisma
# 2. Create and apply migration
npm run db:migrate
```

This ensures your database changes are version-controlled and can be applied consistently across environments.

### Supabase Local Development

**Start Supabase:**

```bash
supabase start
```

This starts:

- PostgreSQL database (port 54325)
- Supabase Studio (port 54328)
- API server (port 54333)
- Email testing (Inbucket on port 54331)

**Check Status:**

```bash
supabase status
```

**Stop Supabase:**

```bash
supabase stop
```

**Reset Database (⚠️ Deletes all data):**

```bash
supabase db reset
```

**Access Supabase Studio:**

Open http://127.0.0.1:54328 in your browser to:

- View database tables
- Run SQL queries
- Manage data
- View API documentation

**View Test Emails:**

Open http://127.0.0.1:54331 to see emails sent during development (magic links, welcome emails, etc.)

### Production Database

For production, you can use:

- **Supabase Cloud** - Managed PostgreSQL with Supabase features
- **Your own PostgreSQL** - Self-hosted or managed (AWS RDS, Railway, etc.)

Update `DATABASE_URL` and `DIRECT_URL` in your production environment variables.

## 🔧 Configuration Files

- `config.json` - Project configuration (SEO, branding, contact, features)
- `components.json` - shadcn/ui configuration
- `tailwind.config.ts` - Tailwind CSS configuration (optional in v4)
- `postcss.config.mjs` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration
- `supabase/config.toml` - Supabase local configuration

## 📚 Key Libraries Documentation

- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [Better-auth](https://www.better-auth.com/docs)
- [OpenAI](https://platform.openai.com/docs)
- [Inngest](https://www.inngest.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://docs.pmnd.rs/zustand)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [React Email](https://react.email)
- [PostHog](https://posthog.com/docs)

## 🚀 Deployment

### Environment Variables for Production

Make sure to set all environment variables in your hosting platform:

- Vercel: Project Settings → Environment Variables
- Railway: Variables tab
- Other platforms: Check their documentation

### Database

For production, use Supabase Cloud or your own PostgreSQL instance. Update `DATABASE_URL` and `DIRECT_URL` in your production environment.

### Inngest

Set up Inngest in production and configure the webhook endpoint at `/api/inngest/route.ts` in your Inngest dashboard.

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
