# PROJECT.md — Find Inbound Leads on Reddit

## 1. App Description

Find Inbound Leads on Reddit is a **lead discovery and engagement assistant for SaaS founders**.

The app helps founders identify high-intent Reddit conversations where people are actively expressing problems, asking for recommendations, or comparing tools — signals that indicate inbound demand.

Instead of manually monitoring Reddit, founders enter their website URL.
The app analyzes it, understands what the product does, and continuously searches Reddit for conversations where engaging can realistically lead to customers.

The app does not automate posting or messaging.
It assists humans by detecting opportunities and suggesting replies — the founder stays in control.

---

## 2. How the App Works (High-Level)

1. The user enters their product website URL
2. The app analyzes the website using an LLM
3. The app derives:
   - a clear product description
   - problem statements
   - keywords and phrasing users would use
   - direct and indirect competitors
4. Based on this understanding, the app searches Reddit every day
5. Relevant conversations are detected, ranked, and surfaced as inbound leads
6. The user reviews opportunities and engages manually

---

## 3. Problem It Solves

SaaS founders know Reddit works — but using it consistently is difficult.

Today, finding leads on Reddit means:

- manually scanning multiple subreddits
- guessing which keywords to monitor
- missing posts because timing matters
- replying too late or in the wrong tone
- risking bans due to misunderstanding subreddit rules

As a result:

- founders either stop using Reddit
- or use it inconsistently and inefficiently

Meanwhile, people publicly express buying intent every day — but those conversations are scattered, short-lived, and easy to miss.

The app turns Reddit into a **repeatable inbound lead channel**, without spam or automation.

---

## 4. Who the App Is For

Primary users:

- SaaS founders
- Solo founders
- Small founding teams

Specifically:

- early to mid-stage SaaS
- founders doing their own distribution
- teams who care about credibility and tone
- people who already believe Reddit can work

The app is **not** for:

- agencies
- growth hackers
- mass outreach tools
- automated posting or spam workflows

---

## 5. Core User Journeys

### 5.1 Product Setup

- The user enters their website URL
- The app scans the website content
- An LLM generates:
  - a concise product description
  - the main problem(s) solved
  - target user profiles
  - keywords and expressions users are likely to use
  - known and adjacent competitors

This step defines the search and detection context.

### 5.2 Daily Reddit Scanning

Every day, the app searches Reddit using:

- generated keywords
- competitor names
- problem-focused phrasing

Searches are performed across:

- selected subreddits
- Reddit search results
- new and recent posts only

The goal is fresh, actionable conversations, not historical data.

### 5.3 Inbound Lead Detection

Each post is analyzed to determine:

- intent (complaint, alternative search, comparison, question)
- relevance to the product
- urgency (recency, engagement level)

Only posts with clear solution-seeking signals are surfaced.

Each qualifying post becomes a **potential inbound lead**.

### 5.4 Lead Review & Prioritization

The user sees a curated feed of opportunities, including:

- post content and context
- why this post is relevant
- detected intent
- time since posting
- engagement signals

The user should be able to quickly answer:

> "Is this worth replying to right now?"

### 5.5 Assisted Engagement

For each lead, the app can generate a draft reply:

- contextual
- value-first
- non-promotional by default

The user:

- edits the message
- copies it
- manually posts it on Reddit

**No automation.**
**No posting on behalf of the user.**

---

## 6. Core Concepts

### Inbound Lead

A Reddit conversation where the author has already expressed a problem, need, or comparison related to the user's product.

### Product Context

The structured understanding of what the user sells, derived from their website.

### Intent

The reason a post matters (complaint, comparison, alternative search, question).

### Conversation

A public Reddit post or thread that can be engaged with.

### Engagement Opportunity

A time-sensitive moment where thoughtful engagement can realistically lead to a customer.

---

## 7. Feature Scope

**Included:**

- Website scanning and product understanding via LLM
- Automatic keyword and competitor extraction
- Daily Reddit search and monitoring
- High-intent post detection
- Lead relevance explanations
- Draft reply suggestions (assistive only)
- Subreddit awareness and guardrails

**Excluded (non-goals):**

- Automated posting or commenting
- Mass outreach or bulk replies
- Direct messages or inbox automation
- CRM or pipeline management
- Raw data exports
- Engagement analytics inside Reddit

---

## 8. What "Working" Means

The app is considered to be working when:

- users regularly discover posts they would have missed
- detected leads feel relevant and timely
- founders engage more consistently on Reddit
- some conversations convert into real users or customers
- users feel confident engaging without spamming

The app does **not** need to:

- capture every possible post
- automate engagement
- replace human judgment

It needs to **surface the right opportunities at the right time**.

---

## 9. Success Criteria

The app is successful if:

- founders return daily or weekly
- Reddit becomes a reliable inbound channel
- users save time and mental effort
- missing the app would mean missing leads

Success is **not** measured by:

- volume of posts scanned
- number of alerts
- automated actions
- vanity engagement metrics

---

## 10. Guiding Constraints

- Human-in-the-loop always
- Quality > quantity
- Respect Reddit rules and communities
- Avoid features that encourage spam
- Optimize for trust and long-term use

---

## 11. Summary

Find Inbound Leads on Reddit helps SaaS founders turn Reddit into a consistent, ethical inbound channel.

By analyzing a product's website, understanding what it solves, and continuously scanning Reddit for high-intent conversations, the app helps founders engage exactly when people are actively looking for solutions — without automation or spam.
