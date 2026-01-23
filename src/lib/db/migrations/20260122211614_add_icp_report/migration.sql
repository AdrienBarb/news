-- CreateEnum
CREATE TYPE "InputType" AS ENUM ('URL', 'DESCRIPTION');

-- CreateTable
CREATE TABLE "icp_report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "input" TEXT NOT NULL,
    "inputType" "InputType" NOT NULL,
    "analyzedData" JSONB NOT NULL,
    "finalData" JSONB,
    "report" TEXT,
    "email" TEXT,
    "emailSentAt" TIMESTAMP(3),
    "source" TEXT,

    CONSTRAINT "icp_report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "icp_report_createdAt_idx" ON "icp_report"("createdAt");

-- CreateIndex
CREATE INDEX "icp_report_email_idx" ON "icp_report"("email");
