/*
  Warnings:

  - You are about to drop the `Analysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AnalysisBehavior` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FacebookAdCreative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `analysisId` on the `Conversation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Analysis_dataSource_idx";

-- DropIndex
DROP INDEX "Analysis_resultType_idx";

-- DropIndex
DROP INDEX "Analysis_problemFaced_idx";

-- DropIndex
DROP INDEX "Analysis_objective_idx";

-- DropIndex
DROP INDEX "Analysis_createdAt_idx";

-- DropIndex
DROP INDEX "Analysis_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Analysis_userId_idx";

-- DropIndex
DROP INDEX "AnalysisBehavior_createdAt_idx";

-- DropIndex
DROP INDEX "AnalysisBehavior_fixWorked_idx";

-- DropIndex
DROP INDEX "AnalysisBehavior_problemType_idx";

-- DropIndex
DROP INDEX "AnalysisBehavior_userId_idx";

-- DropIndex
DROP INDEX "AnalysisBehavior_analysisId_key";

-- DropIndex
DROP INDEX "FacebookAdCreative_analysisId_idx";

-- DropIndex
DROP INDEX "FacebookAdCreative_fbCreativeId_idx";

-- DropIndex
DROP INDEX "FacebookAdCreative_analysisId_key";

-- DropIndex
DROP INDEX "SavedTemplate_category_idx";

-- DropIndex
DROP INDEX "SavedTemplate_userId_createdAt_idx";

-- DropIndex
DROP INDEX "SavedTemplate_userId_category_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Analysis";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AnalysisBehavior";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "FacebookAdCreative";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SavedTemplate";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "goal" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "goal", "id", "title", "updatedAt", "userId") SELECT "createdAt", "goal", "id", "title", "updatedAt", "userId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
