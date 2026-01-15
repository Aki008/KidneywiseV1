# 🚀 How to Start KidneyWise Application

## 📍 You Are Here
`/Users/ankitsharma/Documents/Kidneywise/kidneywise-app/`

---

## ⚡ Quick Start (Choose One Method)

### Method 1: Automatic Setup (Recommended)

**Open Terminal and run:**
```bash
cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app
./RUN_ME_FIRST.sh
```

This will:
1. Create database
2. Install dependencies
3. Run migrations
4. Prompt you for OpenAI API key
5. Give you commands to start the servers

---

### Method 2: Manual Setup (Step by Step)

#### Step 1: Create Database
Open Terminal and run:
```bash
psql postgres -c "CREATE DATABASE kidneywise_dev;"
psql postgres -c "CREATE USER dev WITH PASSWORD 'devpass';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE kidneywise_dev TO dev;"
psql kidneywise_dev -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
```

#### Step 2: Setup Backend
**Terminal 1:**
```bash
cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app/backend
npm install
cp .env.example .env
```

**⚠️ IMPORTANT:** Edit `.env` file and add your OpenAI API key:
```bash
nano .env
# Change this line:
# OPENAI_API_KEY=sk-your-actual-openai-key-here
```

**Then run:**
```bash
npx knex migrate:latest
npx knex seed:run
npm run dev
```

✅ **Backend is now running at http://localhost:8080**

#### Step 3: Setup Frontend
**Terminal 2 (NEW TERMINAL):**
```bash
cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app/frontend
npm install
npm run dev
```

✅ **Frontend is now running at http://localhost:3000**

---

## 🌐 How to Use the Link

### Once Both Servers Are Running:

1. **Open your web browser** (Chrome, Safari, or Firefox)

2. **Type or paste this URL:**
   ```
   http://localhost:3000
   ```

3. **Press Enter**

4. **You should see:** The KidneyWise landing page with a "Get Started Free" button

---

## 🎯 Visual Guide

```
┌─────────────────────────────────────────────────┐
│  Terminal 1: Backend                            │
│  ─────────────────────────────────────────────  │
│  $ cd backend                                   │
│  $ npm run dev                                  │
│                                                 │
│  ✅ Server Running at http://localhost:8080    │
│     Keep this terminal open!                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Terminal 2: Frontend                           │
│  ─────────────────────────────────────────────  │
│  $ cd frontend                                  │
│  $ npm run dev                                  │
│                                                 │
│  ✅ Server Running at http://localhost:3000    │
│     Keep this terminal open!                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  Browser                                        │
│  ─────────────────────────────────────────────  │
│  Address Bar: http://localhost:3000            │
│                                                 │
│  ✅ KidneyWise App Loaded!                     │
└─────────────────────────────────────────────────┘
```

---

## ❓ Troubleshooting "Can't Connect"

### Problem: "This site can't be reached"

**Check 1: Is Backend Running?**
```bash
# In a new terminal, test:
curl http://localhost:8080/health
```
✅ Should return: `{"status":"healthy",...}`
❌ If error: Backend is not running. Go back to Terminal 1

**Check 2: Is Frontend Running?**
```bash
# Look at Terminal 2, you should see:
# "Local: http://localhost:3000"
```
❌ If not there: Run `npm run dev` in frontend directory

**Check 3: Is PostgreSQL Running?**
```bash
pg_isready
```
❌ If error: Start PostgreSQL
```bash
# On Mac:
brew services start postgresql@14
```

**Check 4: Try Alternative URL**
```
http://127.0.0.1:3000
```

---

## 🔑 Getting OpenAI API Key

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Paste it in `backend/.env`:
   ```
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

---

## ✅ Success Checklist

- [ ] PostgreSQL is installed and running
- [ ] Database `kidneywise_dev` created
- [ ] Backend dependencies installed (`backend/node_modules` exists)
- [ ] Frontend dependencies installed (`frontend/node_modules` exists)
- [ ] OpenAI API key added to `backend/.env`
- [ ] Migrations run successfully
- [ ] Terminal 1 shows "Server Running" (backend)
- [ ] Terminal 2 shows "Local: http://localhost:3000" (frontend)
- [ ] Browser opens http://localhost:3000 and shows landing page

---

## 🎉 What to Do After It's Running

1. **Click "Get Started Free"**
2. **Create account:**
   - Email: test@kidneywise.com
   - Password: Test123456
   - Name: Your Name

3. **Complete Onboarding** (4 steps, 2 minutes):
   - Basic info (age, weight, height)
   - CKD stage
   - Dietary preferences
   - Permissions

4. **Explore Features:**
   - Dashboard with AI message
   - Scan Food → Upload image
   - Symptoms → Log health status
   - History → View past meals
   - Use bottom navigation bar

---

## 📱 Mobile Testing

Once running on computer:

1. **Get your computer's IP:**
   ```bash
   ipconfig getifaddr en0
   ```

2. **On your phone browser:**
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

3. **Install as app:**
   - iOS: Share → Add to Home Screen
   - Android: Menu → Add to Home Screen

---

## 🆘 Still Having Issues?

### Quick Reset:
```bash
# Stop both servers (Ctrl+C in both terminals)

# Reset backend
cd backend
rm -rf node_modules
npm install
npx knex migrate:rollback --all
npx knex migrate:latest
npx knex seed:run
npm run dev

# Reset frontend (new terminal)
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### Check Logs:
- **Backend logs:** Look at Terminal 1
- **Frontend logs:** Look at Terminal 2
- **Browser logs:** Press F12 → Console tab

---

## 📞 Common Error Messages

| Error | Solution |
|-------|----------|
| "Port 3000 already in use" | `lsof -ti:3000 \| xargs kill -9` |
| "Port 8080 already in use" | `lsof -ti:8080 \| xargs kill -9` |
| "Database connection failed" | Start PostgreSQL: `brew services start postgresql@14` |
| "Cannot find module" | Run `npm install` in that directory |
| "Invalid API key" | Check `backend/.env` has correct OpenAI key |

---

## 🎯 Expected Terminal Output

**Backend (Terminal 1) should show:**
```
╔═══════════════════════════════════════╗
║     KidneyWise API Server Running     ║
║                                       ║
║  🚀 Port: 8080                        ║
║  🌍 Environment: development          ║
║  📡 API: /api/v1                      ║
║  💚 Status: Healthy                   ║
╚═══════════════════════════════════════╝
```

**Frontend (Terminal 2) should show:**
```
  VITE v5.0.11  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## 🌐 **THE LINK YOU NEED:**

```
http://localhost:3000
```

**Copy this ↑ and paste it in your browser address bar!**

---

**Need more help? Check these files:**
- `START_APP.md` - Detailed setup guide
- `QUICKSTART.md` - 5-minute version
- `BROWSER_LINK.txt` - Quick reference
- `TESTING_GUIDE.md` - How to test features

---

**Last Updated:** January 14, 2025
