# Lugha — Preserving Africa's Languages with AI

> Hackathon theme: **Technological Innovation for Africa**

Africa has **2,000+ languages** — but most are invisible to modern AI. Lugha is a
community-driven platform where Africans **teach AI their own languages**,
contribute words, voice samples, proverbs, and earn recognition while helping
preserve cultural heritage and bootstrap low-resource language datasets.

## Features

- **Teach AI** — contribute words, meanings, example sentences, and voice recordings in your mother tongue.
- **AI Translator** — translate between English and major African languages (Swahili, Yoruba, Zulu, Amharic, Hausa, Igbo, Wolof, Shona, Twi, Lingala, …). Uses OpenAI / Gemini if `AI_API_KEY` is set, falls back to a clever mock for offline demos.
- **Heritage Library** — proverbs, folktales, songs, riddles, and stories with rich filters.
- **Live Feed 🔴** — real-time SSE stream of contributions across Africa.
- **Language Partners** — matched native speakers by languages you speak & want to learn.
- **Interactive Language Map** — click countries to explore vitality & featured languages.
- **Live Heat Map** — Lugha contributions by country.
- **Leaderboard** — ranks, trophy badges, and your global standing.
- **Auth** — JWT-based registration & login.

## Stack

| Layer     | Technology                                             |
|-----------|--------------------------------------------------------|
| Frontend  | React 18 + Vite + React Router + Framer Motion        |
| Backend   | FastAPI (Python 3.11) + SQLAlchemy 2 + Pydantic v2     |
| Database  | MySQL 8 (works with MySQL Workbench)                   |
| Auth      | JWT (python-jose) + bcrypt                             |
| AI        | OpenAI / Google Gemini (optional) — mock fallback      |

## Quick Start

### Docker (recommended)

From the **repository root** (`LUGHA/`):

```bash
cp .env.example .env
docker compose up -d --build
# → http://localhost:5173
```

See the [root README](../README.md) for full Docker docs.

### Ubuntu (manual)

```bash
chmod +x setup.sh
./setup.sh
```

The script will:
1. Create a Python venv and install backend deps
2. Install frontend deps (npm)
3. Create the MySQL database `lugha_db` and load the schema
4. Seed languages, countries, and a demo user
5. Print commands to start both servers

### Manual steps

**1. MySQL** — open Workbench (or CLI) and create the database:

```sql
CREATE DATABASE lugha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then load the schema:

```bash
mysql -u root -p lugha_db < database/schema.sql
```

**2. Backend**

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # edit DB password + (optional) AI_API_KEY
python -m app.seed         # seed languages / countries / demo user
uvicorn app.main:app --reload --port 8000
```

API docs: <http://localhost:8000/docs>

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### Demo account
- Email: `demo@lugha.africa`
- Password: `demo1234`

## AI Provider Setup (optional)

Edit `backend/.env`:

```env
AI_PROVIDER=openai            # or "gemini"
AI_API_KEY=sk-...             # your key
```

Leave `AI_API_KEY` blank to use the deterministic mock translator (perfect for
offline demo days).

## Project Layout

```
lugha/
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app + CORS
│   │   ├── database.py         # SQLAlchemy engine
│   │   ├── models.py           # ORM models
│   │   ├── schemas.py          # Pydantic schemas
│   │   ├── auth.py             # JWT + password hashing
│   │   ├── ai.py               # Translator (real + mock)
│   │   ├── seed.py             # DB seeder
│   │   └── routers/
│   │       ├── auth.py
│   │       ├── languages.py
│   │       ├── contributions.py
│   │       ├── translations.py
│   │       └── leaderboard.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/              # Landing, Dashboard, Teach, Translator, Heritage, Map, Live, Partners, Leaderboard
│   │   ├── components/         # Nav, AfricaMap
│   │   ├── data/               # countryMap.js (vitality data)
│   │   ├── components/Nav.jsx
│   │   ├── api.js              # axios + JWT
│   │   ├── auth.jsx            # AuthContext
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── schema.sql
├── setup.sh
└── README.md
```

## License
MIT — built for an African hackathon. Fork it, ship it, preserve a language.
