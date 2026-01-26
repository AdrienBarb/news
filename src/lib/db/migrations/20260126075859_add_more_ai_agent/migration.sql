-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('reddit', 'hackernews', 'twitter', 'linkedin');

-- CreateEnum
CREATE TYPE "LeadTier" AS ENUM ('STARTER', 'GROWTH', 'SCALE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SourceType" ADD VALUE 'hackernews';
ALTER TYPE "SourceType" ADD VALUE 'twitter';
ALTER TYPE "SourceType" ADD VALUE 'linkedin';

-- AlterTable
ALTER TABLE "ai_agent" ADD COLUMN     "leadTier" "LeadTier",
ADD COLUMN     "leadsIncluded" INTEGER,
ADD COLUMN     "platform" "Platform" NOT NULL DEFAULT 'reddit',
ADD COLUMN     "targetPersonas" JSONB,
ALTER COLUMN "timeWindow" DROP NOT NULL;
