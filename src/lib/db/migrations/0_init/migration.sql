-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "supabase_vault";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "MarketStatus" AS ENUM ('pending', 'analyzing', 'active', 'paused', 'archived', 'error');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('reddit', 'hackernews');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('pending', 'processing', 'processed', 'error');

-- CreateEnum
CREATE TYPE "PainType" AS ENUM ('frustration', 'limitation', 'unmet_expectation', 'comparison', 'switching_intent', 'feature_request', 'pricing', 'support', 'performance', 'other');

-- CreateEnum
CREATE TYPE "SignalTrend" AS ENUM ('new', 'rising', 'stable', 'fading');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contextJson" JSONB,
    "status" "MarketStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_sensor" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "source" "SourceType" NOT NULL,
    "queryText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetchedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "source" "SourceType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "rawContent" TEXT NOT NULL,
    "sanitizedContent" TEXT,
    "author" TEXT,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processingStatus" "ProcessingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pain_statement" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "painType" "PainType" NOT NULL,
    "toolsMentioned" TEXT[],
    "switchingIntent" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION NOT NULL,
    "embedding" DOUBLE PRECISION[],
    "signalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pain_statement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "painType" "PainType" NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "centroid" DOUBLE PRECISION[],
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signal_evidence" (
    "id" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "painStatementId" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signal_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summaryJson" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_signal" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "signalId" TEXT NOT NULL,
    "trend" "SignalTrend" NOT NULL,
    "currentFrequency" INTEGER NOT NULL,
    "previousFrequency" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_signal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "market_userId_idx" ON "market"("userId");

-- CreateIndex
CREATE INDEX "market_status_idx" ON "market"("status");

-- CreateIndex
CREATE INDEX "market_sensor_marketId_idx" ON "market_sensor"("marketId");

-- CreateIndex
CREATE INDEX "market_sensor_source_isActive_idx" ON "market_sensor"("source", "isActive");

-- CreateIndex
CREATE INDEX "conversation_marketId_idx" ON "conversation"("marketId");

-- CreateIndex
CREATE INDEX "conversation_processingStatus_idx" ON "conversation"("processingStatus");

-- CreateIndex
CREATE INDEX "conversation_publishedAt_idx" ON "conversation"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_source_externalId_key" ON "conversation"("source", "externalId");

-- CreateIndex
CREATE INDEX "pain_statement_conversationId_idx" ON "pain_statement"("conversationId");

-- CreateIndex
CREATE INDEX "pain_statement_signalId_idx" ON "pain_statement"("signalId");

-- CreateIndex
CREATE INDEX "pain_statement_painType_idx" ON "pain_statement"("painType");

-- CreateIndex
CREATE INDEX "pain_statement_createdAt_idx" ON "pain_statement"("createdAt");

-- CreateIndex
CREATE INDEX "signal_marketId_idx" ON "signal"("marketId");

-- CreateIndex
CREATE INDEX "signal_painType_idx" ON "signal"("painType");

-- CreateIndex
CREATE INDEX "signal_frequency_idx" ON "signal"("frequency");

-- CreateIndex
CREATE INDEX "signal_lastSeenAt_idx" ON "signal"("lastSeenAt");

-- CreateIndex
CREATE INDEX "signal_evidence_signalId_idx" ON "signal_evidence"("signalId");

-- CreateIndex
CREATE UNIQUE INDEX "signal_evidence_signalId_painStatementId_key" ON "signal_evidence"("signalId", "painStatementId");

-- CreateIndex
CREATE INDEX "report_marketId_idx" ON "report"("marketId");

-- CreateIndex
CREATE INDEX "report_periodEnd_idx" ON "report"("periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "report_marketId_periodStart_periodEnd_key" ON "report"("marketId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "report_signal_reportId_idx" ON "report_signal"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "report_signal_reportId_signalId_key" ON "report_signal"("reportId", "signalId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market" ADD CONSTRAINT "market_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sensor" ADD CONSTRAINT "market_sensor_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_statement" ADD CONSTRAINT "pain_statement_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pain_statement" ADD CONSTRAINT "pain_statement_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal" ADD CONSTRAINT "signal_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_evidence" ADD CONSTRAINT "signal_evidence_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signal_evidence" ADD CONSTRAINT "signal_evidence_painStatementId_fkey" FOREIGN KEY ("painStatementId") REFERENCES "pain_statement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_signal" ADD CONSTRAINT "report_signal_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_signal" ADD CONSTRAINT "report_signal_signalId_fkey" FOREIGN KEY ("signalId") REFERENCES "signal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

