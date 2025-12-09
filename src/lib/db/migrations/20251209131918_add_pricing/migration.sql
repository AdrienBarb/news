/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionPlan` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `user` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('NONE', 'YEAR', 'LIFETIME');

-- DropIndex
DROP INDEX "user_stripeSubscriptionId_key";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripeSubscriptionId",
DROP COLUMN "subscriptionPlan",
DROP COLUMN "subscriptionStatus",
ADD COLUMN     "accessExpiresAt" TIMESTAMP(3),
ADD COLUMN     "planType" "PlanType" NOT NULL DEFAULT 'NONE';

-- DropEnum
DROP TYPE "SubscriptionStatus";
