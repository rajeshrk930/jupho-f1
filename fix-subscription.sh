#!/bin/bash

# Subscription Fix - Quick Setup Script
# This script migrates existing data and restarts the application

echo "🔧 Subscription Fix Setup"
echo "========================="
echo ""

# Check if we're in the project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Run database migration
echo "📊 Step 1: Migrating database (FREE→STARTER, PRO→GROWTH)..."
cd backend
npx ts-node scripts/migratePlanNames.ts
MIGRATION_EXIT_CODE=$?

if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
    echo "❌ Migration failed! Please check the error above."
    exit 1
fi

echo ""
echo "✅ Database migration completed successfully!"
echo ""

# Step 2: Ask if user wants to restart servers
echo "🔄 Step 2: Restart application?"
echo ""
echo "The following changes have been made:"
echo "  - All 'FREE' plans → 'STARTER'"
echo "  - All 'PRO' plans → 'GROWTH'"  
echo "  - Existing PRO users now have lifetime GROWTH access"
echo ""
echo "You need to restart both backend and frontend for changes to take effect."
echo ""
read -p "Would you like to restart the application now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Restarting application..."
    echo ""
    echo "Instructions:"
    echo "1. Stop your current backend and frontend servers (Ctrl+C)"
    echo "2. Run: npm run dev"
    echo ""
    echo "Or manually:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
else
    echo ""
    echo "⚠️  Remember to manually restart backend and frontend:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "  1. View testing guide: SUBSCRIPTION_FIX_TESTING.md"
echo "  2. Test admin panel: http://localhost:3000/admin"
echo "  3. Verify user plans in database"
echo ""
