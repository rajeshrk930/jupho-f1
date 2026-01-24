# Jupho - AI-Powered Meta Ads Creator

An **"Agency-in-a-Box"** tool that automatically creates high-performing Meta ads using conversational AI.

**No agency knowledge required. No complex dashboards. Just paste your website URL and launch.**

## Target Users

- Small business owners (like coaching centers, salons, ecommerce)
- Entrepreneurs who need ads but can't afford agencies
- Anyone who wants to run Meta ads without learning the platform

## Core Features (3-Step Wizard)

### 1. Business Scan (Step 1)
- Paste website URL or Instagram link
- AI auto-scrapes business details (brand, products, USPs)
- Fallback to manual text input if scraping fails
- Takes ~10 seconds

### 2. AI Consultant (Step 2)
- One unified OpenAI prompt generates complete campaign strategy
- Recommends: Objective, Budget, Targeting, Ad Copy
- Dynamic Facebook interest search (no hardcoded IDs)
- Generates 3 variants each: Headlines, Primary Text, Descriptions
- Takes ~15 seconds

### 3. One-Click Launch (Step 3)
- Upload image (optional)
- Creates campaign directly on Facebook (PAUSED status)
- Uses best practices: automatic placements, optimal bid strategy
- Takes ~30 seconds

**Total time: 55 seconds from URL to live ad.**

## Pricing

- **FREE**: 2 campaigns/month (templates preview)
- **BASIC**: ₹1,499/month for 10 campaigns (templates-based)
- **GROWTH**: ₹1,999/month for 25 campaigns (AI Agent + templates)

**vs Agency**: ₹20,000/month + setup fees

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Razorpay account (for payments)

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend
cp frontend/.env.example frontend/.env.local
```

3. Set up the database:
```bash
npm run db:migrate
npm run db:generate
```

4. Run the development servers:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── package.json
└── package.json
```

## License

MIT
