# 🎉 Code is on GitHub! Now Let's Deploy

## ✅ What's Done

Your complete KidneyWise app with all features is now on GitHub:
**https://github.com/Aki008/KidneywiseV1**

✅ All 77 files pushed successfully
✅ Symptom Management system
✅ Meal History page
✅ Bottom Navigation
✅ Food Analysis with Claude AI
✅ Complete Authentication & Onboarding

---

## 🚀 Next Steps: Connect to Railway & Vercel

Since you already have Vercel deployed, we need to:
1. Connect Railway for the backend (new)
2. Update Vercel to use the new GitHub repo

---

## 📋 Step 1: Deploy Backend to Railway (10 minutes)

### 1. Go to Railway
- Visit: https://railway.app
- Click "Login" → Login with GitHub (Aki008)

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: **Aki008/KidneywiseV1**
- Railway will detect the configuration automatically from `railway.json`

### 3. Add PostgreSQL Database
- In your project, click "+ New"
- Select "Database"
- Choose "PostgreSQL"
- Wait ~30 seconds for provisioning

### 4. Add Environment Variables
Click on your backend service → "Variables" tab → Add these:

```
NODE_ENV=production

DATABASE_URL=${{Postgres.DATABASE_URL}}

CLAUDE_API_KEY=your-claude-api-key-here

CORS_ORIGIN=*

PORT=8080

JWT_SECRET=kidneywise-super-secret-key-production-$(openssl rand -hex 32)

JWT_REFRESH_SECRET=kidneywise-refresh-secret-production-$(openssl rand -hex 32)

JWT_EXPIRY=15m

JWT_REFRESH_EXPIRY=7d
```

### 5. Configure Build Settings
- Go to "Settings" tab
- Scroll to "Build"
- Build Command: `cd backend && npm install && npx knex migrate:latest && npx knex seed:run && npm run build`
- Start Command: `cd backend && npm run start`
- Root Directory: Leave blank (it will use `backend/` from commands)

### 6. Generate Domain
- Go to "Settings" tab
- Scroll to "Networking"
- Click "Generate Domain"
- **COPY THIS URL!** Example: `https://kidneywisev1-production-xxxx.up.railway.app`

### 7. Wait for Deployment
- Go to "Deployments" tab
- Wait for "Success" status (2-3 minutes)
- Check logs if there are any errors

✅ **Backend is live!**

**Save your Railway backend URL:** `_______________________________________`

---

## 📋 Step 2: Update Vercel to Use New Code (5 minutes)

### Option A: If You Have Existing Vercel Project

#### 1. Go to Vercel
- Visit: https://vercel.com
- Login with GitHub (Aki008)
- Find your existing KidneyWise project

#### 2. Update Git Repository
- Go to "Settings" tab
- Scroll to "Git"
- Click "Disconnect Git Repository"
- Click "Connect Git Repository"
- Select: **Aki008/KidneywiseV1**
- Save

#### 3. Update Environment Variables
- Go to "Settings" → "Environment Variables"
- Update or add: `VITE_API_URL`
- Value: `https://your-railway-url.up.railway.app/api/v1`
  (Replace with your actual Railway URL from Step 1!)

#### 4. Update Build Settings
- Go to "Settings" → "General"
- Framework Preset: **Vite**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 5. Redeploy
- Go to "Deployments" tab
- Click on the latest deployment
- Click "Redeploy"
- Or make a small change and push to GitHub (auto-deploy)

---

### Option B: Create New Vercel Project (If Starting Fresh)

#### 1. Go to Vercel
- Visit: https://vercel.com
- Click "Add New..." → "Project"

#### 2. Import Repository
- Select: **Aki008/KidneywiseV1**
- Click "Import"

#### 3. Configure Project
- Framework Preset: **Vite**
- Root Directory: Click "Edit" → Enter: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 4. Add Environment Variable
- Click "Environment Variables"
- Name: `VITE_API_URL`
- Value: `https://your-railway-url.up.railway.app/api/v1`
  (Use your Railway URL from Step 1!)
- Click "Add"

#### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Copy your Vercel URL when done!

✅ **Frontend is live!**

**Your app URL:** `_______________________________________`

---

## 📋 Step 3: Test Your Deployed App! (5 minutes)

### 1. Check Backend Health
Visit: `https://your-railway-url.up.railway.app/health`

Should show:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T...",
  "database": "connected"
}
```

### 2. Open Your App
Visit your Vercel URL (e.g., `https://kidneywise.vercel.app`)

You should see:
- ✅ Landing page with "Get Started Free"
- ✅ Registration working
- ✅ Onboarding flow
- ✅ Dashboard with 4 quick actions
- ✅ Bottom navigation (Home, Scan, History, Symptoms)

### 3. Test All Features

#### Register Account
- Click "Get Started Free"
- Email: `test@kidneywise.com`
- Password: `Test123456`
- Name: Your Name

#### Complete Onboarding
- Age, weight, height
- CKD stage
- Dietary preferences
- Notifications

#### Test Features
1. **Dashboard** - See overview
2. **Scan Food** (Camera icon) - Upload a photo
3. **Meal History** (History icon) - View past meals
4. **Symptoms** (Activity icon) - Log symptoms

---

## 🎉 Success Criteria

- ✅ Railway backend deployed and running
- ✅ PostgreSQL database connected
- ✅ Vercel frontend deployed
- ✅ Can access the app in browser
- ✅ Can register and login
- ✅ Can complete onboarding
- ✅ Can see all 4 navigation items
- ✅ Food analysis works with Claude AI
- ✅ Symptom tracking works
- ✅ Meal history shows past meals

---

## 🔄 Auto-Deployment is Now Set Up!

From now on, whenever you push code to GitHub:
- Railway will automatically redeploy the backend
- Vercel will automatically redeploy the frontend

No manual steps needed!

---

## 📱 Add to Your Phone

**iPhone:**
1. Open your Vercel URL in Safari
2. Tap Share button → "Add to Home Screen"
3. Name it "KidneyWise"
4. Tap "Add"

**Android:**
1. Open your Vercel URL in Chrome
2. Tap menu (3 dots) → "Add to Home screen"
3. Name it "KidneyWise"
4. Tap "Add"

Now it works like a native app!

---

## 🆘 Troubleshooting

### Backend Deploy Failed
- Check Railway logs: Railway → Your Service → Deployments → View logs
- Verify all environment variables are set correctly
- Make sure DATABASE_URL is `${{Postgres.DATABASE_URL}}`

### Frontend Shows "Failed to Fetch"
- Check VITE_API_URL in Vercel environment variables
- Make sure it ends with `/api/v1`
- Verify Railway backend is running

### "Invalid API Key" Errors
- Go to Railway → Variables
- Check CLAUDE_API_KEY is correct
- No extra spaces or quotes

### Database Migration Errors
- Railway runs migrations automatically on build
- Check build logs for "Migration complete"
- If failed, check PostgreSQL is connected

---

## 📊 Your Deployed URLs

**Fill these in after deployment:**

Frontend (Main App):
```
https://_____________________.vercel.app
```

Backend API:
```
https://_____________________.up.railway.app
```

Health Check:
```
https://_____________________.up.railway.app/health
```

---

## 💰 Costs

**Railway:** $5/month free credit (should last 1-2 months with light use)
**Vercel:** Free forever for personal projects
**Claude API:** ~$0.01-0.03 per food analysis

**Total:** Essentially free for testing and personal use!

---

## 🎁 What You Have Now

✅ Full-stack app deployed to the cloud
✅ Accessible from any device with a browser
✅ Professional backend with PostgreSQL database
✅ Modern React frontend with Tailwind CSS
✅ AI-powered food analysis with Claude
✅ Complete symptom tracking system
✅ Meal history with photos
✅ Mobile-first design with bottom navigation
✅ Secure authentication with JWT
✅ Auto-deployment on every GitHub push

---

**Need help with any step? Let me know which step you're on and I'll guide you through it!**
