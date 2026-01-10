-- CreateTable
CREATE TABLE "AgentTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'CREATE_AD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "input" TEXT,
    "output" TEXT,
    "errorMessage" TEXT,
    "conversationState" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "GeneratedCreative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isSelected" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedCreative_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "AgentTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AgentTask_userId_idx" ON "AgentTask"("userId");

-- CreateIndex
CREATE INDEX "AgentTask_status_idx" ON "AgentTask"("status");

-- CreateIndex
CREATE INDEX "AgentTask_createdAt_idx" ON "AgentTask"("createdAt");

-- CreateIndex
CREATE INDEX "GeneratedCreative_taskId_idx" ON "GeneratedCreative"("taskId");

-- CreateIndex
CREATE INDEX "GeneratedCreative_type_idx" ON "GeneratedCreative"("type");
