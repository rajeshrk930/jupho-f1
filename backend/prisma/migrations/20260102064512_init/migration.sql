-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "CreativeType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "Objective" AS ENUM ('AWARENESS', 'TRAFFIC', 'ENGAGEMENT', 'LEADS', 'APP_PROMOTION', 'SALES');

-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('ECOMMERCE', 'SAAS', 'FINANCE', 'HEALTH', 'EDUCATION', 'REAL_ESTATE', 'TRAVEL', 'FOOD', 'FASHION', 'TECHNOLOGY', 'OTHER');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('DEAD', 'AVERAGE', 'WINNING');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creativeUrl" TEXT,
    "creativeType" "CreativeType" NOT NULL,
    "primaryText" TEXT,
    "headline" TEXT,
    "objective" "Objective" NOT NULL,
    "industry" "Industry" NOT NULL,
    "cpm" DOUBLE PRECISION,
    "ctr" DOUBLE PRECISION,
    "cpc" DOUBLE PRECISION,
    "cpa" DOUBLE PRECISION,
    "primaryReason" TEXT NOT NULL,
    "supportingLogic" TEXT[],
    "singleFix" TEXT NOT NULL,
    "failureReason" TEXT,
    "resultType" "ResultType" NOT NULL DEFAULT 'AVERAGE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "plan" "Plan" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");

-- CreateIndex
CREATE INDEX "Analysis_industry_idx" ON "Analysis"("industry");

-- CreateIndex
CREATE INDEX "Analysis_resultType_idx" ON "Analysis"("resultType");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
