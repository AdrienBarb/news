/*
  Warnings:

  - You are about to drop the column `shortSummary` on the `Article` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Article" DROP COLUMN "shortSummary",
ADD COLUMN     "headline" TEXT;
