#!/bin/bash
# Safe migration script - adds indexes without deleting data
# Run this in your production environment where database is accessible

echo "🔍 Checking database connection..."
npx prisma db execute --stdin <<SQL
SELECT 1;
SQL

if [ $? -eq 0 ]; then
  echo "✅ Database connected successfully"
  echo ""
  echo "📊 Applying migration: add_agent_task_indexes"
  echo "This will add indexes to AgentTask.fbCampaignId and AgentTask.fbAdId"
  echo "⚠️  This operation is SAFE and will NOT delete any data"
  echo ""
  
  npx prisma migrate deploy
  
  echo ""
  echo "✅ Migration complete!"
else
  echo "❌ Cannot connect to database"
  exit 1
fi
