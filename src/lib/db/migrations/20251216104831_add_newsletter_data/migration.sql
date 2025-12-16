-- AlterTable
ALTER TABLE "user" ADD COLUMN     "lastNewsletterAtUtc" TIMESTAMP(3),
ADD COLUMN     "nextNewsletterAtUtc" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NewsletterSendLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledForUtc" TIMESTAMP(3) NOT NULL,
    "sentAtUtc" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsletterSendLog_scheduledForUtc_idx" ON "NewsletterSendLog"("scheduledForUtc");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSendLog_userId_scheduledForUtc_key" ON "NewsletterSendLog"("userId", "scheduledForUtc");

-- AddForeignKey
ALTER TABLE "NewsletterSendLog" ADD CONSTRAINT "NewsletterSendLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
