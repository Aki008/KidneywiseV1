# Quick Start Guide - KidneyWise MVP

Get the app running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] OpenAI API key ready

## Step-by-Step Setup

### 1. Database (2 minutes)

```bash
# Create database
psql postgres -c "CREATE DATABASE kidneywise_dev;"
psql postgres -c "CREATE USER dev WITH PASSWORD 'devpass';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE kidneywise_dev TO dev;"

# Enable extension
psql kidneywise_dev -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

### 2. Backend (2 minutes)

```bash
cd backend

# Install & setup
npm install
cp .env.example .env

# IMPORTANT: Edit .env and add your OpenAI API key!
# Open .env in your editor and change this line:
# OPENAI_API_KEY=sk-your-actual-key-here

# Run migrations
npx knex migrate:latest
npx knex seed:run

# Start server
npm run dev
```

✅ Backend running at http://localhost:8080

### 3. Frontend (1 minute)

Open a NEW terminal:

```bash
cd frontend

# Install & start
npm install
npm run dev
```

✅ Frontend running at http://localhost:3000

## Test the App

### Quick Test Flow (30 seconds)

1. Open http://localhost:3000
2. Click "Get Started Free"
3. Register: test@example.com / password123
4. Complete onboarding (4 quick steps)
5. Dashboard → Click "Scan Food"
6. Upload any food photo
7. See detected foods → Analyze → Get warnings/alternatives

### Sample Test Account

**Email:** test@example.com
**Password:** password123
**CKD Stage:** 3b
**Weight:** 70kg

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql --version`
- Verify database exists: `psql -l | grep kidneywise`
- Check .env has correct DB credentials

### Frontend won't start
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is free: `lsof -ti:3000 | xargs kill -9`

### Database migration errors
- Reset DB: `npx knex migrate:rollback --all`
- Re-run: `npx knex migrate:latest`

### OpenAI errors
- Verify API key in backend/.env
- Check key has credits: https://platform.openai.com/account/usage
- Ensure model is 'gpt-4' (not gpt-4-turbo)

## Development URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api/v1
- **Health Check:** http://localhost:8080/health

## Next Steps

- Read full README.md for detailed documentation
- Test all food analysis features
- Review API endpoints in README
- Customize onboarding questions
- Add more foods to database

## Getting Help

1. Check README.md for detailed setup
2. Review backend logs in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are set

---

🎉 **You're ready to go! Start by creating an account at http://localhost:3000**
