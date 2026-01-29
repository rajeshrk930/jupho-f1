-- CreateTable
CREATE TABLE "GoogleSheetsConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "spreadsheetId" TEXT,
    "spreadsheetName" TEXT,
    "sheetName" TEXT NOT NULL DEFAULT 'Leads',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleSheetsConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "syncedToSheets" BOOLEAN NOT NULL DEFAULT false,
    "sheetsSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GoogleSheetsConnection_userId_key" ON "GoogleSheetsConnection"("userId");

-- CreateIndex
CREATE INDEX "GoogleSheetsConnection_userId_idx" ON "GoogleSheetsConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadSubmission_leadId_key" ON "LeadSubmission"("leadId");

-- CreateIndex
CREATE INDEX "LeadSubmission_userId_idx" ON "LeadSubmission"("userId");

-- CreateIndex
CREATE INDEX "LeadSubmission_formId_idx" ON "LeadSubmission"("formId");

-- CreateIndex
CREATE INDEX "LeadSubmission_syncedToSheets_idx" ON "LeadSubmission"("syncedToSheets");

-- CreateIndex
CREATE INDEX "LeadSubmission_submittedAt_idx" ON "LeadSubmission"("submittedAt");

-- AddForeignKey
ALTER TABLE "GoogleSheetsConnection" ADD CONSTRAINT "GoogleSheetsConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSubmission" ADD CONSTRAINT "LeadSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
