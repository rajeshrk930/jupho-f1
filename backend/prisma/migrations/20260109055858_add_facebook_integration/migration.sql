-- CreateTable
CREATE TABLE "FacebookAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "facebookUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME NOT NULL,
    "adAccountId" TEXT NOT NULL,
    "adAccountName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacebookAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FacebookAdCreative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "analysisId" TEXT NOT NULL,
    "fbCreativeId" TEXT NOT NULL,
    "fbCampaignId" TEXT,
    "fbAdSetId" TEXT,
    "campaignName" TEXT,
    "adSetName" TEXT,
    "creativeName" TEXT,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "spend" REAL NOT NULL,
    "conversions" INTEGER NOT NULL,
    "lastFetchedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FacebookAdCreative_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Analysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "creativeUrl" TEXT,
    "creativeType" TEXT NOT NULL,
    "primaryText" TEXT,
    "headline" TEXT,
    "objective" TEXT NOT NULL,
    "problemFaced" TEXT NOT NULL,
    "whatChanged" TEXT NOT NULL,
    "audienceType" TEXT NOT NULL,
    "cpm" REAL NOT NULL,
    "ctr" REAL NOT NULL,
    "cpa" REAL NOT NULL,
    "primaryReason" TEXT NOT NULL,
    "supportingLogic" TEXT NOT NULL,
    "singleFix" TEXT NOT NULL,
    "additionalNotes" TEXT,
    "failureReason" TEXT,
    "resultType" TEXT NOT NULL DEFAULT 'AVERAGE',
    "dataSource" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Analysis" ("additionalNotes", "audienceType", "cpa", "cpm", "createdAt", "creativeType", "creativeUrl", "ctr", "failureReason", "headline", "id", "objective", "primaryReason", "primaryText", "problemFaced", "resultType", "singleFix", "supportingLogic", "updatedAt", "userId", "whatChanged") SELECT "additionalNotes", "audienceType", "cpa", "cpm", "createdAt", "creativeType", "creativeUrl", "ctr", "failureReason", "headline", "id", "objective", "primaryReason", "primaryText", "problemFaced", "resultType", "singleFix", "supportingLogic", "updatedAt", "userId", "whatChanged" FROM "Analysis";
DROP TABLE "Analysis";
ALTER TABLE "new_Analysis" RENAME TO "Analysis";
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
CREATE INDEX "Analysis_userId_createdAt_idx" ON "Analysis"("userId", "createdAt");
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
CREATE INDEX "Analysis_objective_idx" ON "Analysis"("objective");
CREATE INDEX "Analysis_problemFaced_idx" ON "Analysis"("problemFaced");
CREATE INDEX "Analysis_resultType_idx" ON "Analysis"("resultType");
CREATE INDEX "Analysis_dataSource_idx" ON "Analysis"("dataSource");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "FacebookAccount_userId_key" ON "FacebookAccount"("userId");

-- CreateIndex
CREATE INDEX "FacebookAccount_userId_idx" ON "FacebookAccount"("userId");

-- CreateIndex
CREATE INDEX "FacebookAccount_adAccountId_idx" ON "FacebookAccount"("adAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "FacebookAdCreative_analysisId_key" ON "FacebookAdCreative"("analysisId");

-- CreateIndex
CREATE INDEX "FacebookAdCreative_fbCreativeId_idx" ON "FacebookAdCreative"("fbCreativeId");

-- CreateIndex
CREATE INDEX "FacebookAdCreative_analysisId_idx" ON "FacebookAdCreative"("analysisId");
