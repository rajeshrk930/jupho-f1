-- AlterTable: Remove old fields and add new decision engine fields
-- Step 1: Add new enum types
CREATE TYPE "ProblemFaced" AS ENUM ('LOW_CLICKS', 'CLICKS_NO_ACTION', 'MESSAGES_NO_CONVERSION');
CREATE TYPE "WhatChanged" AS ENUM ('CREATIVE_CHANGED', 'AUDIENCE_CHANGED', 'BUDGET_CHANGED', 'NOTHING_NEW_AD');
CREATE TYPE "AudienceType" AS ENUM ('BROAD', 'INTEREST_BASED', 'LOOKALIKE');

-- Step 2: Update Objective enum to only 3 values
ALTER TYPE "Objective" RENAME TO "Objective_old";
CREATE TYPE "Objective" AS ENUM ('LEADS', 'WHATSAPP', 'SALES');

-- Step 3: Add new columns with defaults temporarily
ALTER TABLE "Analysis" ADD COLUMN "problemFaced" "ProblemFaced" NOT NULL DEFAULT 'LOW_CLICKS';
ALTER TABLE "Analysis" ADD COLUMN "whatChanged" "WhatChanged" NOT NULL DEFAULT 'NOTHING_NEW_AD';
ALTER TABLE "Analysis" ADD COLUMN "audienceType" "AudienceType" NOT NULL DEFAULT 'BROAD';

-- Step 4: Make metrics required (remove nullable)
ALTER TABLE "Analysis" ALTER COLUMN "cpm" SET NOT NULL;
ALTER TABLE "Analysis" ALTER COLUMN "ctr" SET NOT NULL;
ALTER TABLE "Analysis" ALTER COLUMN "cpa" SET NOT NULL;

-- Step 5: Update objective column to new enum type
ALTER TABLE "Analysis" ALTER COLUMN "objective" TYPE "Objective" USING (
  CASE 
    WHEN "objective"::text = 'LEADS' THEN 'LEADS'::text
    WHEN "objective"::text = 'SALES' THEN 'SALES'::text
    ELSE 'LEADS'::text
  END
)::"Objective";

-- Step 6: Drop old columns and enums (order matters!)
DROP TYPE "Objective_old";
ALTER TABLE "Analysis" DROP COLUMN "industry";
ALTER TABLE "Analysis" DROP COLUMN "cpc";
DROP TYPE "Industry";

-- Step 7: Update indexes
DROP INDEX IF EXISTS "Analysis_industry_idx";
CREATE INDEX "Analysis_objective_idx" ON "Analysis"("objective");
CREATE INDEX "Analysis_problemFaced_idx" ON "Analysis"("problemFaced");
