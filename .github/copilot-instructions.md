<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# Creative Failure Analyzer - Project Instructions

## Overview
This is an AI-powered Meta Ads creation tool for business owners. The tool helps users automatically create high-performing Meta ads using conversational AI.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **AI Engine**: OpenAI GPT-4o-mini
- **Auth**: JWT (email + password)
- **Payments**: Razorpay

## Project Structure
```
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/    # API routes (auth, agent, payments, facebook)
│   │   ├── services/  # Business logic (AI Agent, Facebook API, OpenAI)
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
1. **AI Agent for auto-creating Meta ads** (PRIMARY)
2. Conversational interface for ad creation
3. AI-generated ad copy (headlines, primary text, descriptions)
4. Direct Facebook ad creation via API
5. Facebook OAuth with `ads_management` permission
6. Razorpay payment integration

## AI Agent Feature
- Conversational interface for creating Meta ads
- Guides users through objective, audience, budget selection
- Auto-generates ad copy (headlines, primary text, descriptions)
- Creates ads directly on Facebook via API
- Requires Facebook OAuth with `ads_management` permission

## DO NOT BUILD
- Creative analysis/diagnosis features
- PDF export functionality
- Template library
- Manual metric tracking
- Budget optimization beyond agent
- A/B testing
- Team roles
- Analytics dashboards beyond agent tasks
