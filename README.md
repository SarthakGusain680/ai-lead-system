# AI Lead Follow-Up System

A full-stack AI-powered CRM for automated lead management, qualification, and follow-up.

🔗 **Live Demo:** https://ai-lead-system-pvc7.vercel.app  
🔗 **Backend API:** https://ai-lead-system-production-0c47.up.railway.app/docs

---

## What It Does

- **Captures leads** from multiple sources (website, social media, referrals)
- **AI-generated replies** using Groq LLaMA 3.1 — responds to leads automatically
- **Lead scoring** — AI qualifies leads as HOT, MEDIUM, or COLD
- **Automated follow-ups** — scheduler checks for inactive leads every hour
- **Full conversation history** — chat-style interface for each lead
- **Analytics dashboard** — pipeline overview with live stats
- **JWT Authentication** — secure login and register system

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy + Alembic |
| AI | Groq API (LLaMA 3.1) |
| Auth | JWT (python-jose) |
| Scheduler | APScheduler |
| Deployment | Vercel (frontend) + Railway (backend + DB) |

---

## Features

### AI Integration
- Automatic AI replies to lead messages using LLaMA 3.1
- Lead qualification scoring (0-100) with HOT/MEDIUM/COLD labels
- AI-generated follow-up messages for inactive leads

### Lead Management
- Create, view, update, delete leads
- Track lead source, status, score
- Full conversation thread per lead

### Automation
- Background scheduler runs every hour
- Detects leads inactive for 24+ hours
- Automatically creates AI follow-up messages

### Authentication
- JWT-based login and registration
- Protected routes on frontend
- Secure password hashing with bcrypt

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_lead_system
GROQ_API_KEY=your_groq_key
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
APP_ENV=development
```

```bash
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login |
| GET | /leads/ | Get all leads |
| POST | /leads/ | Create lead |
| PUT | /leads/{id} | Update lead |
| DELETE | /leads/{id} | Delete lead |
| GET | /conversations/lead/{id} | Get conversation |
| POST | /conversations/ | Add message |
| POST | /ai/reply | Generate AI reply |
| POST | /ai/qualify/{id} | Score lead with AI |
| GET | /followups/ | Get all followups |
| POST | /followups/trigger-scheduler | Trigger scheduler |

---

## Project Structure