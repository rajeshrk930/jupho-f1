-- AlterTable
ALTER TABLE "AgentTask" ADD COLUMN "conversionMethod" TEXT DEFAULT 'lead_form',
ADD COLUMN "leadFormId" TEXT,
ADD COLUMN "originalWebsiteUrl" TEXT;
