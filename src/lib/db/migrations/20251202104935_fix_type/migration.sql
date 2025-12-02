/*
  Warnings:

  - You are about to drop the column `subcriptionPlan` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `subcriptionStatus` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "subcriptionPlan",
DROP COLUMN "subcriptionStatus",
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE';
