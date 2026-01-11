/*
  Warnings:

  - You are about to drop the column `isSubscribed` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "isSubscribed",
DROP COLUMN "stripePriceId",
DROP COLUMN "stripeSubscriptionId",
ADD COLUMN     "accessExpiresAt" TIMESTAMP(3),
ADD COLUMN     "accessPassId" TEXT;
