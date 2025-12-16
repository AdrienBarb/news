-- AlterTable
ALTER TABLE "user" ADD COLUMN     "newsletterDay" TEXT NOT NULL DEFAULT 'Friday',
ADD COLUMN     "newsletterTime" TEXT NOT NULL DEFAULT '09:00';
