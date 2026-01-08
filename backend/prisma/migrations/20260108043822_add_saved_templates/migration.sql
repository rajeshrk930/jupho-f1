-- CreateTable
CREATE TABLE "SavedTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "analysisId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SavedTemplate_userId_category_idx" ON "SavedTemplate"("userId", "category");

-- CreateIndex
CREATE INDEX "SavedTemplate_userId_createdAt_idx" ON "SavedTemplate"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedTemplate_category_idx" ON "SavedTemplate"("category");
