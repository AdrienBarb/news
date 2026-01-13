# PROJECT.md — Reddit Lead Finder

## 1. App Description

Reddit Lead Finder is a **one-time lead discovery tool for SaaS founders**.

The app helps founders find high-intent Reddit conversations from the past week, month, or year — where people are actively expressing problems, asking for recommendations, or comparing tools.

Instead of setting up ongoing monitoring, founders pay once to run an AI agent that scans Reddit based on their product context and delivers a curated list of leads.

The app does not automate posting or messaging.
It finds opportunities — the founder decides which ones to engage with.

---

## 2. How the App Works (High-Level)

1. The user signs up and lands on their dashboard (`/d`)
2. They fill a form with:
   - Their website URL
   - Target keywords
   - Competitor names
3. They select a time window (7 days, 30 days, or 12 months)
4. They pay based on the selected time window
5. An AI agent runs and fetches relevant Reddit posts
6. The user reviews their leads on the dashboard

---

## 3. Problem It Solves

SaaS founders know Reddit has buying intent — but finding relevant posts is tedious.

Today, finding leads on Reddit means:

- manually scanning subreddits
- guessing which keywords to use
- missing older posts with valuable context
- spending hours scrolling

As a result:

- founders give up on Reddit
- or miss high-intent conversations

The app delivers a **curated list of leads** in one click, for any time period.

---

## 4. Who the App Is For

Primary users:

- SaaS founders
- Solo founders
- Small founding teams

Specifically:

- early to mid-stage SaaS
- founders doing their own distribution
- people launching a new product who need initial traction
- founders who want a one-time lead list, not another subscription

The app is **not** for:

- agencies running campaigns for clients
- automated posting or spam workflows
- mass outreach tools

---

## 5. Core User Journey

### 5.1 Sign Up & Dashboard

- User signs up (email or OAuth)
- Redirected to `/d` (dashboard)
- Dashboard shows:
  - Form to create a new AI agent
  - List of previous AI agents (if any)

### 5.2 Create AI Agent

Step 1: Product Context

- Website URL
- Description (auto-generated or manual)
- Target keywords
- Competitor names

Step 2: Time Window & Pricing

- Last 7 days (Recent signals) — $19
- Last 30 days (Market scan) — $49
- Last 12 months (Deep research) — $99

Step 3: Payment

- Stripe Checkout
- One-time payment (no subscription)

### 5.3 Agent Execution

After payment:

- Webhook triggers the AI agent
- Agent status: `QUEUED` → `FETCHING_LEADS` → `ANALYZING_LEADS` → `COMPLETED`
- User can leave — email notification when done

### 5.4 Lead Review

Once complete, the user sees:

- List of leads with:
  - Post title and content
  - Subreddit
  - Author name and link
  - Post link
  - Relevance score (0-100)
  - AI reasoning for why it's relevant
  - Date posted

The user can:

- Click to open the Reddit post
- Decide which leads to engage with manually

---

## 6. Core Concepts

### AI Agent

A one-time job that searches Reddit based on user-defined keywords and time window.

### Lead

A Reddit post identified as relevant to the user's product.

### Time Window

The period to search: 7 days, 30 days, or 12 months. Determines pricing.

### Relevance Score

AI-generated score (0-100) indicating how likely the post represents a lead opportunity.

---

## 7. Feature Scope

**Included:**

- Website-based keyword suggestions
- Keyword and competitor input
- Time window selection with clear pricing
- One-time payment via Stripe
- AI-powered Reddit search
- Lead relevance scoring and reasoning
- Email notification when leads are ready
- Dashboard to view all agents and leads

**Excluded (non-goals):**

- Subscriptions or recurring billing
- Daily/weekly automated monitoring
- Automated posting or commenting
- Reply suggestions or draft generation
- CRM or pipeline features
- Subreddit-specific targeting

---

## 8. What "Working" Means

The app is working when:

- users pay and receive relevant leads within minutes
- leads feel actionable and worth reviewing
- the process is faster than manual Reddit searching
- users come back to run new agents when they need fresh leads

The app does **not** need to:

- capture every possible post
- provide ongoing monitoring
- automate any engagement

It needs to **deliver a quality lead list for the price paid**.

---

## 9. Success Criteria

The app is successful if:

- users find leads they would have missed
- conversion from sign-up to payment is healthy
- users return to run additional agents
- founders recommend it to others

Success is **not** measured by:

- number of leads returned (quality > quantity)
- time spent in-app
- engagement metrics

---

## 10. Pricing Model

| Time Window    | Label          | Price | Internal Cap (per keyword) |
| -------------- | -------------- | ----- | -------------------------- |
| Last 7 days    | Recent signals | $19   | ~10 posts                  |
| Last 30 days   | Market scan    | $49   | ~20 posts                  |
| Last 12 months | Deep research  | $99   | ~30 posts                  |

Pricing reflects the volume of posts analyzed and leads returned.
Internal caps are not shown to users — they only see the time window.

---

## 11. Technical Flow

1. User submits form → Create `AiAgent` record with status `PENDING_PAYMENT`
2. Create Stripe Checkout Session with `agentId` in metadata
3. Redirect to Stripe
4. On `checkout.session.completed` webhook:
   - Update agent status to `QUEUED`
   - Trigger Inngest job `agent/run`
5. Inngest job:
   - Fetches Reddit posts for each keyword (using Apify)
   - Filters by time window
   - Runs AI analysis for relevance
   - Saves leads to database
   - Updates status to `COMPLETED`
   - Sends email notification
6. User views leads on dashboard

---

## 12. Summary

Reddit Lead Finder helps SaaS founders get a curated list of Reddit leads — fast.

Pick your time window, pay once, and receive AI-analyzed leads based on your product's keywords and competitors. No subscriptions, no ongoing monitoring — just leads when you need them.
