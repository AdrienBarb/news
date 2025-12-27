# PROJECT.md — Market Signals Over Guesswork

## 1. App Description

Market Signals Over Guesswork is a **continuous market intelligence application for SaaS founders**.

The app analyzes unprompted, public conversations across the web to understand how a market behaves in reality:

- what users complain about
- what expectations are unmet
- how tools are compared
- why users switch or abandon solutions
- how these signals evolve over time

The goal is to give founders **ongoing situational awareness** of their market, so strategic decisions are grounded in real behavior rather than intuition, isolated feedback, or delayed metrics.

This is not a one-off research tool.  
It is designed to be used **continuously**, as markets, competitors, and expectations change.

---

## 2. Problem It Solves

SaaS founders must make frequent, high-impact decisions:

- what to build next
- how to position the product
- which segment to prioritize
- when to pivot or stay the course

Today, these decisions are made using:

- intuition and assumptions
- selective user feedback
- internal opinions
- lagging indicators (churn, revenue, NPS)

Public conversations already contain **leading indicators** of market reality, but they are:

- scattered across platforms
- noisy and anecdotal
- difficult to analyze consistently over time

The app solves this by transforming fragmented public conversations into **structured, evolving market intelligence**.

---

## 3. Who the App Is For

Primary users:

- SaaS founders
- Solo founders
- Small founding teams

These users:

- own product and strategic decisions
- operate with limited resources
- need confidence that their direction aligns with real market needs

The app is not designed for enterprise competitive intelligence teams or sales/marketing automation use cases.

---

## 4. Core User Journeys

### 4.1 Market Setup

- A user creates a market context by providing a product or competitor website.
- The app derives an understanding of the market space, positioning, and relevant terminology.

### 4.2 Continuous Market Monitoring

- The app continuously analyzes public conversations relevant to that market.
- Conversations are interpreted as signals, not individual opinions.

### 4.3 Market Signal Review

- The user reviews structured insights showing:
  - recurring pain points
  - unmet or rising expectations
  - comparison and switching behavior
  - emerging competitors or alternatives

### 4.4 Change Awareness

- The user observes how signals evolve over time:
  - what is new
  - what is increasing
  - what is fading
  - what remains unresolved

The user returns regularly to maintain awareness of market changes.

---

## 5. Core Concepts

### Market

A defined problem space or category derived from a product or competitor context.

### Signal

A recurring pattern observed across independent public conversations (e.g. repeated complaints, expectations, comparisons).

### Pain

A specific frustration, limitation, or unmet need expressed by users.

### Expectation

What users assume a product should provide, explicitly or implicitly.

### Comparison

A reference to multiple tools or alternatives within the same context.

### Change

A measurable shift in signal frequency, intensity, or composition over time.

---

## 6. Feature Scope

Included:

- Continuous analysis of public, unprompted conversations
- Detection of recurring and emerging signals
- Evidence-backed insights (frequency, recency, consistency)
- Historical comparison to observe change over time
- Market-level understanding rather than individual-level analysis

Excluded (non-goals):

- Scraping arbitrary URLs provided by users
- Monitoring private, paywalled, or authenticated content
- Social media engagement or posting tools
- Lead generation, outreach, or growth automation
- Raw data exports or datasets
- One-time static research reports

---

## 7. Data Concepts

The core data concepts used by the app include:

- **User**: an authenticated person using the app
- **Market**: a defined context representing a product category or problem space
- **Source**: a public platform where conversations occur
- **Conversation**: a public discussion item (post, comment, review)
- **Signal**: an aggregated pattern derived from multiple conversations
- **Insight**: a structured interpretation of one or more signals
- **Report**: a time-based snapshot of the current market state

These concepts exist to support pattern detection, not data accumulation.

---

## 8. What “Working” Means

The app is considered to be working when:

- signals reflect real, recognizable market behavior
- insights are consistent across independent conversations
- users can explain _why_ an insight exists and _what supports it_
- users detect meaningful market changes earlier than they would manually

The app does not need to be exhaustive.  
It needs to be **trustworthy and directionally correct**.

---

## 9. Success Criteria

The app is successful if:

- founders return regularly to understand their market
- decisions are influenced by surfaced signals
- users feel less exposed to guesswork
- users would notice the absence of the app if it disappeared

Success is not measured by:

- volume of data ingested
- number of sources displayed
- time spent in the app
- surface-level engagement metrics

---

## 10. Guiding Constraints

- Prioritize signal quality over data volume
- Favor clarity over completeness
- Avoid features that dilute market understanding
- Treat all external content as untrusted input
- Build for continuous usage, not one-time analysis

---

## 11. Summary

Market Signals Over Guesswork exists to give SaaS founders continuous, evidence-backed awareness of their market.

By structuring real public conversations into meaningful signals and tracking how they evolve, the app helps founders make better strategic decisions with less uncertainty.
