# Creative Failure Analyzer for Meta Ads

A focused tool that does one job only: **Explain why a Meta ad creative failed or worked and tell what to change next.**

No automation. No Meta API. No dashboards. **Clarity over complexity.**

## Target Users

- Meta ads agencies
- Freelancers handling multiple clients
- Founders running ads themselves

## Core Features (MVP v1)

### 1. Creative Input Form
- Upload creative (image/video)
- Enter ad details (primary text, headline, objective)
- Manual metrics input (CPM, CTR, CPC/CPA)
- Industry selection

### 2. Analysis Engine (AI)
Every analysis outputs exactly 3 sections:
- **Primary Reason**: One sentence only
- **Supporting Logic**: Max 2-3 bullet points
- **Single Fix**: ONE actionable recommendation

### 3. History Page
- List of past analyses
- Search/filter by industry or reason
- Copy previous fixes

### 4. Export
- Copy analysis text
- Download simple PDF

## Tech Stack

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Analysis Engine**: Rule-based Decision Engine
- **Auth**: JWT (Email + Password)
- **Payments**: Razorpay

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
