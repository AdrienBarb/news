# MVP.md — First Working Version

## Purpose of the MVP

The purpose of this MVP is to deliver a **trustworthy, continuous market intelligence experience** for SaaS founders with minimal setup.

The MVP must already demonstrate the core value of the product:

- understanding what users complain about in a market
- identifying unmet expectations and comparison behavior
- observing how these signals evolve over time

If the MVP does not clearly provide ongoing market awareness, it fails its purpose.

---

## Core Promise

The MVP enables a SaaS founder to:

- define a market with minimal input
- see the most important recurring pains and expectations in that market
- understand which signals are new, growing, or fading
- trust the insights enough to influence product or strategy decisions

---

## In-Scope Functionality

### 1. Market Creation

- A user can create a single market.
- Market creation is done by providing a product or competitor website URL.
- The system derives market context automatically (category, terminology, competitors).

No manual configuration is required from the user.

---

### 2. Continuous Conversation Analysis

- The system analyzes unprompted, public conversations relevant to the market.
- Only high-signal, low-risk sources are used:
  - Reddit (posts and comments)
  - Hacker News (posts and comments)
- Conversations are treated as inputs for pattern detection, not as standalone insights.

---

### 3. Signal Detection

The system detects recurring patterns across conversations, including:

- user pains and frustrations
- unmet or rising expectations
- tool comparisons and switching behavior

A signal must:

- appear in multiple independent conversations
- express similar intent
- persist or evolve over time

The MVP favors fewer, higher-confidence signals over exhaustive coverage.

---

### 4. Market Signal View

The user can view a ranked list of current market signals, each including:

- a short, plain-language description
- why the signal matters
- frequency indicator (relative, not absolute)
- recency indicator

Signals are market-level insights, not individual opinions.

---

### 5. Signal Evidence

For each signal, the user can inspect supporting evidence:

- short representative quotes (fair use)
- references to tools or competitors mentioned
- links to original public conversations

Evidence exists to justify trust in the signal, not to expose raw data.

---

### 6. Change Over Time

The MVP includes basic change detection:

- new signals appearing
- signals increasing in prominence
- signals fading
- long-standing unresolved signals

This comparison is time-based and enables recurring usage.

---

### 7. Market Report

The system generates a market report that summarizes:

- the current state of the market
- the most important signals
- notable changes since the previous period

The report represents a snapshot in time and can be regenerated.

---

## Out of Scope (Explicit Non-Goals)

The following are intentionally excluded from the MVP:

- Multiple markets per user
- User-defined sources
- Social media ingestion (Twitter, LinkedIn, etc.)
- Review platforms (G2, Capterra, App Store)
- Alerts or notifications
- Team collaboration
- Data exports or raw datasets
- Custom scraping of arbitrary URLs
- Advanced filtering or segmentation
- Enterprise features

Any feature not required to understand the market and its evolution is excluded.

---

## Core Concepts Implemented

The MVP must fully support these concepts:

- **User**: an authenticated founder using the app
- **Market**: a persistent representation of a problem space
- **Conversation**: a public discussion item
- **Signal**: a recurring pattern derived from multiple conversations
- **Evidence**: justification supporting a signal
- **Report**: a time-based snapshot of market state

These concepts must be clearly reflected in the product.

---

## What “Working” Means for the MVP

The MVP is considered successful if:

- a founder can understand their market in under a few minutes
- surfaced signals feel recognizable and grounded in reality
- changes over time are visible and meaningful
- the product feels useful beyond a single visit

The MVP does not need to be exhaustive.
It must be **clear, trustworthy, and repeatable**.

---

## Constraints

- One market per user
- Controlled ingestion frequency
- Predictable infrastructure cost per user
- Deterministic and repeatable signal generation

These constraints exist to protect focus, speed, and reliability.

---

## MVP Summary

The MVP of Market Signals Over Guesswork allows a SaaS founder to define a market by providing a website and receive continuous, evidence-backed insights into what users complain about, expect, and compare in that market. By detecting recurring patterns in public conversations and showing how they evolve over time, the MVP delivers ongoing market awareness rather than one-time research.
