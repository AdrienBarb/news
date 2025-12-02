/*
  Warnings:

  - A unique constraint covering the columns `[userId,articleId,interactionType]` on the table `UserArticleInteraction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UserArticleInteraction_userId_articleId_key";

-- CreateIndex
CREATE INDEX "UserArticleInteraction_userId_interactionType_idx" ON "UserArticleInteraction"("userId", "interactionType");

-- CreateIndex
CREATE UNIQUE INDEX "UserArticleInteraction_userId_articleId_interactionType_key" ON "UserArticleInteraction"("userId", "articleId", "interactionType");
