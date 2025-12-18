-- CreateTable
CREATE TABLE "tiktok_post" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "pid" TEXT NOT NULL,
    "postText" TEXT NOT NULL,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tiktok_post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tiktok_post_pid_key" ON "tiktok_post"("pid");

-- CreateIndex
CREATE INDEX "tiktok_post_pid_idx" ON "tiktok_post"("pid");

-- CreateIndex
CREATE INDEX "tiktok_post_articleId_idx" ON "tiktok_post"("articleId");

-- AddForeignKey
ALTER TABLE "tiktok_post" ADD CONSTRAINT "tiktok_post_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
