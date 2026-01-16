-- Add Clerk authentication support
-- Remove password field and add clerkId

-- Add clerkId column (temporarily nullable for migration)
ALTER TABLE "User" ADD COLUMN "clerkId" TEXT;

-- Remove password column
ALTER TABLE "User" DROP COLUMN "password";

-- Make clerkId NOT NULL after data migration
-- (In production, you'd migrate existing users first)
ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

-- Add unique constraint on clerkId
ALTER TABLE "User" ADD CONSTRAINT "User_clerkId_key" UNIQUE ("clerkId");
