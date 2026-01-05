<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# Creative Failure Analyzer - Project Instructions

## Overview
This is a Meta Ads Creative Failure Analyzer SaaS MVP. The tool analyzes ad creatives and provides:
- One clear reason why an ad failed/worked
- Supporting logic (2-3 bullet points)
- One actionable fix

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Analysis Engine**: Rule-based Decision Engine
- **Auth**: JWT (email + password)
- **Payments**: Razorpay

## Project Structure
```
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API routes (auth, analysis, payments)
│   │   ├── services/  # Business logic (Decision Engine, PDF generation)
│   │   ├── middleware/# Auth, upload, error handling
│   │   └── lib/       # Prisma client
│   └── prisma/        # Database schema
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # App router pages
│       ├── components/# Reusable components
│       ├── lib/       # API client, store
│       └── types/     # TypeScript types
```

## Development Commands
```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Database migrations
npm run db:migrate
npm run db:generate
```

## Environment Variables
- Backend: Copy `backend/.env.example` to `backend/.env`
- Frontend: Copy `frontend/.env.example` to `frontend/.env.local`

## Key Features
1. Creative upload (image/video) with manual metrics
2. AI-powered analysis with structured output
3. History page with search/filter
4. PDF export for client reporting
5. Razorpay payment integration

## DO NOT BUILD
- Meta API connection
- Auto ad posting
- Budget optimization
- A/B testing
- Team roles
- Analytics dashboards
