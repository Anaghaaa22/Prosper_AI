# ProsperAI

Full-stack SaaS financial management application with AI-powered insights.

## Features

- **Frontend**: React.js with modern dark UI
- **Auth**: JWT-based login & signup
- **Dashboard**: Expense charts (Pie & Bar), monthly summary cards
- **CSV Upload**: Bank statement import with auto-categorization
- **AI Integration**: OpenAI API for personalized financial advice, savings recommendations, budget suggestions
- **Backend**: Node.js + Express REST API, PostgreSQL

## Project Structure

```
Prosper AI/
├── backend/           # Node.js + Express API
│   ├── src/
│   │   ├── config/    # Database config
│   │   ├── db/        # Schema, migrations
│   │   ├── middleware/# Auth, error handling
│   │   ├── models/    # User, Transaction
│   │   ├── routes/    # Auth, Transactions, Reports, AI
│   │   └── services/  # Categorizer, CSV parser, OpenAI
│   └── package.json
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── api/       # API clients
│   │   ├── context/   # Auth context
│   │   └── pages/     # Login, Signup, Dashboard, Upload, Insights
│   └── package.json
└── DEPLOYMENT.md      # AWS deployment steps
```

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (Supabase PostgreSQL)
- OpenAI API key

### 1. Database Setup

- Create a Supabase project.
- Copy your **connection string** from **Project Settings → Database → Connection string**.
- Run the schema in Supabase:
  - **Option A (recommended)**: Supabase **SQL Editor** → paste contents of `backend/src/db/schema.sql` → Run
  - **Option B**: Use `psql` locally:

```powershell
psql "<YOUR_DATABASE_URL>" -f ".\backend\src\db\schema.sql"
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, OPENAI_API_KEY

npm install
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` (proxies `/api` to backend)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Backend port (default: 5000) |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `FRONTEND_URL` | CORS allowed origin |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions/upload` | Upload CSV |
| GET | `/api/reports/summary` | Monthly summary |
| GET | `/api/reports/monthly?year=&month=` | Monthly report |
| POST | `/api/ai/advice` | Get financial advice |
| POST | `/api/ai/savings` | Get savings recommendations |
| POST | `/api/ai/budget` | Get budget suggestions |

## CSV Format

Upload a CSV with columns for:
- **Date** (e.g. YYYY-MM-DD, MM/DD/YYYY)
- **Description** (transaction text)
- **Amount** (single column) or **Debit/Credit** (two columns)

Common bank formats are auto-detected.

## License

MIT

# 🏦 ProsperAI (In Progress)

ProsperAI is a full-stack personal finance SaaS application currently under development.  
It aims to help users analyze bank statements and receive AI-powered financial insights.

## 🚀 Goal

To build a cloud-ready financial platform that allows users to:

- Upload bank statements (CSV/PDF)
- Automatically categorize expenses
- Visualize spending patterns
- Receive AI-generated budgeting and savings recommendations

__________________________________________________________________________________
## 🛠 Tech Stack

**Frontend:** React.js  
**Backend:** Node.js, Express.js  
**Database:** PostgreSQL  
**AI Integration:** OpenAI API  
**DevOps:** Docker  

___________________________________________________________________________________

## ⚙️ Current Status

- ✅ Project structure setup  
- ✅ Backend & frontend initialized  
- 🔄 Authentication module in progress  
- 🔄 Expense categorization logic in development  
- 🔄 AI recommendation module in development  
____________________________________________________________________________________
## 🧠 Vision

ProsperAI is inspired by modern FinTech platforms and focuses on combining:

- Scalable REST APIs  
- Cloud-native architecture  
- Generative AI integration  
- Clean product design  
_____________________________________________________________________________________
##  Author

Anagha Bhattad  
B.Tech Computer Science (Data Science)  
Nagpur, India  
_____________________________________________________________________________________

📌 This project is actively being developed and continuously improved.
