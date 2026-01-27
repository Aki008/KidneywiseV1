# KidneyWise - AI-Powered Kidney Disease Management

## Kidney Diet Analyzer MVP (FastAPI + React)

This MVP adds a dedicated Kidney Diet Analyzer with three flows:
1) Food photo → dish candidates → confirm dish/portion → nutrient estimates (K/Na/Protein).
2) Voice meal → transcript → clarification → nutrient estimates.
3) Menu photo → extracted items → kidney-friendlier suggestions.

### Required API Keys (no defaults)
- **OPENAI_API_KEY**: required for vision + parsing.
- **FDC_API_KEY**: required for USDA FoodData Central nutrient values.
  - Get a free key at https://fdc.nal.usda.gov/api-key-signup.html

### Run the Backend (FastAPI)

```bash
cd backend_fastapi && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run the Frontend (React + Vite)

```bash
cd frontend && npm install && npm run dev -- --host 0.0.0.0 --port 5173
```

Open `http://localhost:5173/kidney-diet-analyzer` in your browser.

### Test on a Mobile Phone (iOS Safari / Chrome)

1) Ensure your phone and laptop are on the same Wi-Fi network.
2) Find your laptop IP (example: `192.168.1.50`).
3) Open `http://<YOUR_IP>:5173/kidney-diet-analyzer` on your phone.

If you want a public link, use a tunneling tool such as `ngrok http 5173` and open the provided HTTPS URL on mobile.

### Environment Variables

Create `backend_fastapi/.env` (use the example):

```
OPENAI_API_KEY=sk-your-openai-key
FDC_API_KEY=your-usda-fdc-key
ENVIRONMENT=development
```

Optional frontend environment variable (default is `http://localhost:8000`):

```
VITE_API_BASE_URL=http://localhost:8000
```

### Sample Requests

**Identify food candidates**

```bash
curl -X POST http://localhost:8000/identify_food \\
  -F image=@/path/to/food.jpg \\
  -F optional_context_text=\"home cooked, no added salt\"
```

### Voice Input Notes

The MVP UI uses the **Web Speech API** for in-browser transcription (no additional API keys needed). If the browser lacks speech recognition support, you can still type or paste a transcript and submit it.

**Compute nutrients**

```bash
curl -X POST http://localhost:8000/compute_nutrients \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"confirmed_dish_name\": \"grilled chicken breast\",
    \"portion_description\": \"6 oz\",
    \"optional_clarifications\": \"skinless\"
  }'
```

**Menu suggestions**

```bash
curl -X POST http://localhost:8000/menu_suggestions \\
  -F image=@/path/to/menu.jpg \\
  -F optional_context_text=\"seafood dinner menu\" \\
  -F user_profile='{\"ckd_stage\":\"Stage 3\",\"dialysis\":\"no\"}'
```

### Example Output (Compute Nutrients)

```json
{
  \"standardized_portion_grams\": 170,
  \"nutrient_estimates\": {
    \"potassium_mg\": 382.5,
    \"sodium_mg\": 120.7,
    \"protein_g\": 53.4
  },
  \"uncertainty\": {
    \"low\": \"-20%\", 
    \"high\": \"+25%\"
  },
  \"data_sources\": [
    {
      \"fdc_id\": 123456,
      \"description\": \"Chicken breast, roasted\",
      \"fdc_link\": \"https://fdc.nal.usda.gov/fdc-app.html#/food-details/123456/nutrients\"
    }
  ],
  \"disclaimers\": [
    \"This is an estimate and not medical advice.\",
    \"Nutrient values are sourced from USDA FoodData Central and scaled to the portion.\"
  ]
}
```

A fully functional MVP Progressive Web App for chronic kidney disease (CKD) patients to manage their diet through AI-powered food photo analysis.

## Features Implemented

### Core Features (MVP)
- ✅ **User Authentication** - JWT-based secure login/register
- ✅ **Multi-step Onboarding** - CKD stage, dietary preferences, permissions
- ✅ **Food Photo Analysis** - Camera/upload → AI detection → nutrient calculation
- ✅ **Safety Warnings** - Real-time limit checking with color-coded alerts
- ✅ **Food Alternatives** - AI-generated safer food suggestions
- ✅ **Dashboard** - Personalized AI messages, daily nutrient tracking, contextual cards
- ✅ **Mobile-First PWA** - Optimized for mobile with offline capabilities

### Technical Highlights
- TypeScript throughout (backend + frontend)
- PostgreSQL with advanced features (triggers, functions, similarity search)
- OpenAI GPT-4 integration for personalized guidance
- React + Vite + Tailwind CSS for modern UI
- Zustand for state management
- Framer Motion for animations

## Project Structure

```
kidneywise-app/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # OpenAI service
│   │   ├── types/          # TypeScript interfaces
│   │   └── index.ts        # Express server
│   ├── database/
│   │   ├── migrations/     # 5 database migrations
│   │   └── seeds/          # Initial food data
│   ├── package.json
│   ├── tsconfig.json
│   └── knexfile.ts
│
└── frontend/               # React PWA
    ├── src/
    │   ├── lib/           # API client
    │   ├── pages/         # 6 main pages
    │   ├── store/         # Zustand state management
    │   ├── types/         # TypeScript interfaces
    │   ├── App.tsx        # Router + auth
    │   ├── main.tsx       # Entry point
    │   └── index.css      # Tailwind + custom styles
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── index.html

```

## Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL** 14+
- **OpenAI API Key** (for GPT-4 features)

## Setup Instructions

### 1. Clone & Navigate

```bash
cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app
```

### 2. Database Setup

**Create PostgreSQL database:**

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE kidneywise_dev;
CREATE USER dev WITH PASSWORD 'devpass';
GRANT ALL PRIVILEGES ON DATABASE kidneywise_dev TO dev;

# Enable pg_trgm extension (for similarity search)
\c kidneywise_dev
CREATE EXTENSION IF NOT EXISTS pg_trgm;

\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**Run database migrations:**

```bash
# Run all migrations
npx knex migrate:latest

# Seed initial food data
npx knex seed:run
```

**Start backend server:**

```bash
npm run dev
```

Backend should now be running on `http://localhost:8080`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should now be running on `http://localhost:3000`

## Testing the App

### 1. Open in Browser

Navigate to `http://localhost:3000`

### 2. Create Account

- Click "Get Started Free"
- Fill in registration form
- Complete 4-step onboarding:
  - Basic info (name, age, weight, height)
  - CKD stage selection
  - Dietary preferences and cuisines
  - App permissions

### 3. Dashboard

After onboarding, you'll see:
- Personalized AI greeting message
- Today's nutrient intake (initially 0%)
- "Scan Food" and "View Trends" buttons
- Contextual cards with suggestions

### 4. Food Analysis Flow

**Capture/Upload Photo:**
- Click "Scan Food" button
- Allow camera permission when prompted
- Take photo or upload from gallery

**Review Detected Foods:**
- See AI-detected foods from your photo
- Adjust portion sizes using +/- buttons
- Remove unwanted items with X button

**Analyze Nutrients:**
- Click "Analyze Nutrients"
- See safety status (green = safe, red = warning)
- View warnings for any exceeded limits
- See nutrient breakdown per food

**Get Alternatives:**
- Click "Alternatives" on any risky food
- See safer options with % reduction in K/P
- Read AI-generated explanations

**Log Meal:**
- Click "Log This Meal" if safe
- Or "Log Anyway" / "Adjust Portions" if warning

### 5. View Dashboard Progress

- Return to dashboard
- See updated nutrient bars
- Watch streak counter increase

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Onboarding
- `POST /api/v1/onboarding` - Complete onboarding
- `GET /api/v1/onboarding/status` - Check status

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data

### Meals (Food Analysis)
- `POST /api/v1/meals/upload-photo` - Upload & detect foods
- `POST /api/v1/meals/analyze-nutrients` - Calculate nutrients
- `POST /api/v1/meals/alternatives` - Get safer alternatives
- `POST /api/v1/meals/log` - Log meal
- `GET /api/v1/meals` - Get meal history
- `GET /api/v1/meals/:id` - Get specific meal
- `DELETE /api/v1/meals/:id` - Delete meal

### Foods
- `GET /api/v1/foods/search?q=chicken` - Search foods
- `GET /api/v1/foods/:id` - Get food details
- `GET /api/v1/foods/:id/similar` - Get similar foods

## Database Schema

**Key Tables:**
- `users` - User profiles with medical info
- `daily_limits` - Auto-calculated nutrient limits (via trigger)
- `foods` - Food database with nutrients per 100g
- `meals` - User meal records
- `meal_foods` - Junction table for meals ↔ foods
- `daily_nutrient_totals` - Cached daily aggregates
- `refresh_tokens` - JWT refresh token storage

**Advanced Features:**
- PostgreSQL function `calculate_daily_limits()` - CKD stage-based limits
- PostgreSQL trigger - Auto-updates limits when user changes
- GIN index with pg_trgm - Fuzzy food name search

## Tech Stack

### Backend
- **Runtime:** Node.js 18+ with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL 14 with Knex.js
- **Auth:** JWT (jsonwebtoken) + bcrypt
- **Validation:** express-validator
- **AI:** OpenAI GPT-4 API
- **File Upload:** Multer
- **Security:** Helmet, CORS

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State:** Zustand
- **HTTP:** Axios
- **UI:** Lucide React icons
- **Notifications:** React Hot Toast
- **PWA:** vite-plugin-pwa

## Mobile Features

- **PWA Installable** - Add to home screen
- **Camera Access** - Native camera for food photos
- **Touch Optimized** - 44px tap targets, smooth scrolling
- **Responsive** - Mobile-first design
- **Offline Ready** - Service worker caching
- **Safe Area** - iOS notch support

## Environment Variables

### Backend (.env)

```bash
# Server
NODE_ENV=development
PORT=8080
API_VERSION=v1

# Database
DATABASE_URL=postgresql://dev:devpass@localhost:5432/kidneywise_dev
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kidneywise_dev
DB_USER=dev
DB_PASSWORD=devpass

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OpenAI (REQUIRED)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_ORG_ID=org-your-org-id

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (32+ characters)
3. Configure production database URL
4. Enable SSL for database (set `DB_SSL=true`)
5. Set up proper CORS origin
6. Use AWS S3 for photo uploads (configure AWS credentials)
7. Enable Sentry for error tracking

### Frontend

```bash
npm run build
```

Deploy `dist/` folder to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

### Database

1. Create PostgreSQL instance (AWS RDS, Heroku Postgres, etc.)
2. Run migrations: `npx knex migrate:latest --env production`
3. Run seeds: `npx knex seed:run --env production`

## Future Enhancements

- [ ] LogMeal API integration for better food recognition
- [ ] Lab results OCR and tracking
- [ ] Medication tracking with reminders
- [ ] AI chatbot companion
- [ ] 7-day nutrient trends and analytics
- [ ] Voice commands
- [ ] MyChart integration
- [ ] Educational content library

## License

Proprietary - KidneyWise © 2025

## Support

For issues or questions, contact: [your-email]

---

**Built with ❤️ for kidney patients worldwide**
