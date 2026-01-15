# 🔗 Connect Your Existing Railway & Vercel Deployments

## ✅ What We Know

- **GitHub Repo:** https://github.com/Aki008/KidneywiseV1 ✅ (Code pushed!)
- **Railway Project ID:** `7b4526f7-e366-4350-9591-35fb495e9f1e` ✅
- **Vercel:** Already connected to your Claude account ✅

All we need to do is connect these existing deployments to your new GitHub repo!

---

## 🚀 Step 1: Connect Railway to GitHub (5 minutes)

### 1. Go to Your Railway Project
- Visit: https://railway.app/project/7b4526f7-e366-4350-9591-35fb495e9f1e
- (Or go to https://railway.app and find your KidneyWise project)

### 2. Check Current Setup
You should see your project dashboard. Let's update it to use your new GitHub repo.

### 3. Connect to GitHub Repo

**If you see a service already:**
- Click on the service
- Go to "Settings" tab
- Scroll to "Source"
- Click "Connect Repo"
- Select: **Aki008/KidneywiseV1**
- Root Directory: Leave blank
- Click "Connect"

**If you need to add a new service:**
- Click "+ New" in your project
- Select "GitHub Repo"
- Choose: **Aki008/KidneywiseV1**
- Railway will detect the configuration from `railway.json`

### 4. Verify PostgreSQL Database
- In your project, you should see a PostgreSQL service
- If not, add it:
  - Click "+ New"
  - Select "Database" → "PostgreSQL"
  - Wait 30 seconds for provisioning

### 5. Add/Update Environment Variables

Click on your backend service → "Variables" tab

Add or update these variables:

```
NODE_ENV=production

DATABASE_URL=${{Postgres.DATABASE_URL}}

CLAUDE_API_KEY=your-claude-api-key-here

CORS_ORIGIN=*

PORT=8080

JWT_SECRET=kidneywise-super-secret-key-production-change-this

JWT_REFRESH_SECRET=kidneywise-refresh-secret-production-change-this

JWT_EXPIRY=15m

JWT_REFRESH_EXPIRY=7d
```

**Important:** The `${{Postgres.DATABASE_URL}}` syntax tells Railway to use the PostgreSQL database URL automatically.

### 6. Update Build & Start Commands

Still in your service, go to "Settings" tab:

**Build Command:**
```
cd backend && npm install && npx knex migrate:latest && npx knex seed:run && npm run build
```

**Start Command:**
```
cd backend && npm run start
```

**Watch Directory:** `/backend`

### 7. Generate Domain (if not already done)

- Go to "Settings" → "Networking"
- Click "Generate Domain" (if you don't have one)
- **COPY THIS URL!**

Example: `https://kidneywisev1-production.up.railway.app`

**Your Railway URL:** `_______________________________________`

### 8. Deploy!

- Railway should automatically start deploying
- Go to "Deployments" tab
- Watch the logs
- Wait for "Success" status (2-4 minutes)

✅ **Backend is live!**

---

## 🚀 Step 2: Connect Vercel to GitHub (5 minutes)

### 1. Go to Vercel
- Visit: https://vercel.com
- Login (already connected to your account)

### 2. Find Your KidneyWise Project
- You should see your existing deployment
- Click on it

### 3. Update Git Repository

**Option A: If it's already connected to a repo:**
- Go to "Settings" tab
- Click "Git" in the left sidebar
- Look for "Connected Git Repository"
- If it's the wrong repo, click "Disconnect"
- Then click "Connect Git Repository"
- Select: **Aki008/KidneywiseV1**

**Option B: If no repo connected:**
- Go to "Settings" → "Git"
- Click "Connect Git Repository"
- Select: **Aki008/KidneywiseV1**

### 4. Update Build Settings

Go to "Settings" → "General":

```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
Node.js Version: 18.x
```

### 5. Update Environment Variables

Go to "Settings" → "Environment Variables"

Add or update:

**Variable Name:** `VITE_API_URL`
**Value:** `https://your-railway-url.up.railway.app/api/v1`

(Replace `your-railway-url` with the actual Railway URL from Step 1!)

**Environment:** All (Production, Preview, Development)

Click "Save"

### 6. Redeploy

- Go to "Deployments" tab
- Find the latest deployment
- Click the three dots (...)
- Click "Redeploy"
- OR just wait - Vercel will auto-deploy from the GitHub connection

Wait 2-3 minutes for deployment to complete.

**Your Vercel URL:** `_______________________________________`

✅ **Frontend is live!**

---

## 🧪 Step 3: Test Everything! (5 minutes)

### 1. Check Backend Health

Visit: `https://your-railway-url.up.railway.app/health`

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T...",
  "database": "connected",
  "environment": "production"
}
```

If you get an error, check Railway logs:
- Railway → Your Service → Deployments → Latest → View logs

### 2. Open Your App

Visit your Vercel URL (e.g., `https://kidneywise-xxx.vercel.app`)

You should see:
- ✅ Landing page loads
- ✅ "Get Started Free" button visible
- ✅ Professional design

### 3. Test Registration

- Click "Get Started Free"
- Email: `test@example.com`
- Password: `Test123456`
- Name: Test User
- Click "Create Account"

Should redirect to onboarding.

### 4. Complete Onboarding

Fill in:
- Age: 30
- Weight: 70 kg
- Height: 170 cm
- CKD Stage: Stage 3
- Dietary Preferences: Vegetarian
- Enable notifications: Yes

Click through all steps.

### 5. Test All Features

**Dashboard:**
- Should see 4 quick action cards
- Food Analysis, Symptoms, Meal History, Profile

**Bottom Navigation:**
- Should see 4 icons at bottom:
  1. Home (house icon)
  2. Scan (camera icon)
  3. History (clock icon)
  4. Symptoms (activity icon)

**Scan Food:**
- Click camera icon
- Upload a food photo
- Should analyze with Claude AI
- Should show nutrients

**Meal History:**
- Click history icon
- Should show meals you've scanned
- Should have photos and nutrient data

**Symptoms:**
- Click symptoms icon (activity)
- Should see symptom tracking
- Should have 15+ symptom types
- Can log new symptoms

---

## 🎉 Success Checklist

- [ ] Railway connected to GitHub repo
- [ ] Railway backend deployed successfully
- [ ] Railway health check returns JSON
- [ ] Vercel connected to GitHub repo
- [ ] Vercel frontend deployed successfully
- [ ] Landing page loads
- [ ] Can register new account
- [ ] Can complete onboarding
- [ ] Dashboard shows 4 action cards
- [ ] Bottom navigation has 4 icons
- [ ] Food analysis works (Claude AI)
- [ ] Symptom tracking works
- [ ] Meal history shows data

---

## 🔄 Auto-Deployment Now Active!

From now on:
- Push to GitHub → Railway auto-deploys backend
- Push to GitHub → Vercel auto-deploys frontend

No manual steps needed!

---

## 🆘 Troubleshooting

### Railway Deploy Failed

**Check Logs:**
- Railway → Service → Deployments → Latest → View logs

**Common Issues:**
1. **"Cannot find module"** - Build command might be wrong
   - Solution: Update build command in Settings
2. **"Migration failed"** - Database not connected
   - Solution: Check `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
3. **"Port already in use"** - Port conflict
   - Solution: Set `PORT=8080` in variables

### Vercel Deploy Failed

**Check Logs:**
- Vercel → Deployments → Latest → Click to see logs

**Common Issues:**
1. **"Module not found"** - Wrong root directory
   - Solution: Set root directory to `frontend`
2. **"Build failed"** - Missing dependencies
   - Solution: Check `package.json` in frontend folder
3. **API calls fail** - Wrong API URL
   - Solution: Update `VITE_API_URL` to Railway URL + `/api/v1`

### Frontend Loads But API Fails

1. Open browser console (F12)
2. Check Network tab for failed requests
3. Verify API URL:
   - Should be: `https://your-railway.up.railway.app/api/v1`
   - NOT: `http://localhost:3001/api/v1`
4. Check CORS:
   - Railway should have `CORS_ORIGIN=*`

### Database Errors

1. Check PostgreSQL is running in Railway
2. Verify migrations ran:
   - Railway logs should show "Migration complete"
3. Test database connection:
   - Visit `/health` endpoint

---

## 📊 Your URLs

**GitHub Repo:**
```
https://github.com/Aki008/KidneywiseV1
```

**Railway Project:**
```
https://railway.app/project/7b4526f7-e366-4350-9591-35fb495e9f1e
```

**Railway Backend API:**
```
https://_____________________.up.railway.app
```

**Vercel Frontend:**
```
https://_____________________.vercel.app
```

---

## 💰 Costs Reminder

- **Railway:** $5/month free credit
- **Vercel:** Free forever
- **Claude API:** ~$0.01-0.03 per analysis
- **Total:** Essentially free for personal use!

---

## 📱 Install as App

**iPhone (Safari):**
1. Visit your Vercel URL
2. Tap Share → Add to Home Screen
3. Name it "KidneyWise"

**Android (Chrome):**
1. Visit your Vercel URL
2. Tap menu → Add to Home screen
3. Name it "KidneyWise"

---

**Need help? Tell me:**
1. Which step you're on
2. What error you're seeing
3. Screenshot if possible

I'll help you debug it!
