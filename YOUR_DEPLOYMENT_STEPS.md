# 🎯 Your Deployment Steps - Follow These Exactly

## ✨ I've prepared everything for you!

Since I can't directly access websites to create accounts, here's what you need to do. I've made it super simple - just follow these steps by clicking links and buttons.

---

## 📋 Step 1: Create GitHub Account (2 minutes)

1. **Go to:** https://github.com/signup

2. **Enter your info:**
   - Email: `ankisharma.work@gmail.com`
   - Password: `Sairam@21702166` (you'll change this later)
   - Username: Choose any (like `ankitsharma` or `ankitsharma-work`)

3. **Verify email:** Check your inbox and click the verification link

4. **Complete setup:** Answer the questions (you can skip)

✅ **Done!** You now have a GitHub account

---

## 📋 Step 2: Upload Code to GitHub (5 minutes)

### Option A: Using GitHub Website (Easiest - No Downloads)

1. **Go to:** https://github.com/new

2. **Fill in:**
   - Repository name: `kidneywise-app`
   - Description: "AI-powered kidney disease management app"
   - Keep it Public (or Private, your choice)

3. **Click:** "Create repository"

4. **On the next page, click:** "uploading an existing file"

5. **Upload your files:**
   - Open Finder
   - Go to: `/Users/ankitsharma/Documents/Kidneywise/kidneywise-app`
   - Select ALL files and folders
   - Drag them into the GitHub upload area
   - Wait for upload to complete

6. **Scroll down and click:** "Commit changes"

✅ **Done!** Your code is now on GitHub

---

## 📋 Step 3: Deploy Backend to Railway (7 minutes)

1. **Go to:** https://railway.app

2. **Click:** "Login" → "Login with GitHub"

3. **Authorize Railway:** Click "Authorize" when prompted

4. **Click:** "New Project"

5. **Click:** "Deploy from GitHub repo"

6. **Select:** `kidneywise-app` from the list

7. **Railway will start deploying, click on the service that appears**

8. **Add PostgreSQL Database:**
   - Click "+ New" button (top right)
   - Select "Database"
   - Choose "Add PostgreSQL"
   - Wait for it to provision (~30 seconds)

9. **Connect Database to Backend:**
   - Click on your backend service (the one that's not PostgreSQL)
   - Go to "Variables" tab
   - Click "+ New Variable"
   - Add these one by one:

   ```
   NODE_ENV=production

   DATABASE_URL=${Postgres.DATABASE_URL}

   CLAUDE_API_KEY=your-claude-api-key-here

   CORS_ORIGIN=*

   PORT=8080

   JWT_SECRET=kidneywise-super-secret-key-change-this-in-production-12345

   JWT_REFRESH_SECRET=kidneywise-refresh-secret-key-change-this-in-production-67890

   JWT_EXPIRY=15m

   JWT_REFRESH_EXPIRY=7d
   ```

10. **Update Build Settings:**
    - Go to "Settings" tab
    - Scroll to "Build"
    - Build Command: `cd backend && npm install && npx knex migrate:latest && npx knex seed:run && npm run build`
    - Start Command: `cd backend && npm run start`
    - Click "Update"

11. **Generate Domain:**
    - Go to "Settings" tab
    - Scroll to "Networking"
    - Click "Generate Domain"
    - **COPY THIS URL!** It will look like: `https://kidneywise-production-xxxx.up.railway.app`

12. **Wait for deployment:** Watch the "Deployments" tab until it says "Success" (2-3 minutes)

✅ **Done!** Backend is live!

**Save your backend URL:** `_______________________________________`

---

## 📋 Step 4: Deploy Frontend to Vercel (5 minutes)

1. **Go to:** https://vercel.com

2. **Click:** "Sign Up" → "Continue with GitHub"

3. **Authorize Vercel:** Click "Authorize" when prompted

4. **Click:** "Add New..." → "Project"

5. **Find and select:** `kidneywise-app` from your repositories

6. **Click:** "Import"

7. **Configure Project:**
   - Framework Preset: **Vite**
   - Root Directory: Click "Edit" → Enter: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

8. **Add Environment Variable:**
   - Click "Environment Variables"
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-url.up.railway.app/api/v1`
     (Replace with your actual Railway URL from Step 3!)
   - Click "Add"

9. **Click:** "Deploy"

10. **Wait for deployment:** (~2 minutes)

11. **When done, click on the screenshot to view your site**

12. **Copy your site URL!** It will look like: `https://kidneywise.vercel.app`

✅ **Done!** Frontend is live!

**Your app URL:** `_______________________________________`

---

## 🎉 Step 5: Test Your App!

1. **Open your Vercel URL** in a browser

2. **You should see:** KidneyWise landing page with "Get Started Free" button

3. **Test registration:**
   - Click "Get Started Free"
   - Email: `test@kidneywise.com`
   - Password: `Test123456`
   - Name: Your Name
   - Click "Create Account"

4. **Complete onboarding:**
   - Fill in age, weight, height
   - Select CKD stage
   - Choose dietary preferences
   - Enable permissions

5. **Test features:**
   - View dashboard
   - Try "Scan Food"
   - Log a symptom
   - Check meal history

✅ **If everything works, you're DONE!** 🎉

---

## 🔐 Step 6: Change Your Passwords (2 minutes)

**Important: Do this right after testing!**

1. **GitHub:**
   - Go to: https://github.com/settings/security
   - Click "Change password"
   - Enter new password
   - Save

2. **Note:** Railway and Vercel use GitHub login, so changing GitHub password secures them too!

---

## 📱 Step 7: Add to Your Phone (1 minute)

**iPhone:**
1. Open your Vercel URL in Safari
2. Tap the Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Name it "KidneyWise"
5. Tap "Add"

**Android:**
1. Open your Vercel URL in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home screen"
4. Name it "KidneyWise"
5. Tap "Add"

Now you can use it like a native app!

---

## ✅ Final Checklist

- [ ] GitHub account created
- [ ] Code uploaded to GitHub
- [ ] Railway account created (via GitHub)
- [ ] Backend deployed to Railway
- [ ] PostgreSQL database added
- [ ] Environment variables set in Railway
- [ ] Backend URL copied
- [ ] Vercel account created (via GitHub)
- [ ] Frontend deployed to Vercel
- [ ] API URL configured in Vercel
- [ ] Frontend URL works
- [ ] Can register account
- [ ] Can complete onboarding
- [ ] Features work
- [ ] Password changed
- [ ] App added to phone

---

## 🆘 Troubleshooting

### Backend Deploy Failed
- Check Railway logs: Railway → Your Service → Deployments → View logs
- Make sure all environment variables are set
- Make sure DATABASE_URL is connected

### Frontend Shows "Failed to Fetch"
- Check VITE_API_URL is correct in Vercel
- Make sure it ends with `/api/v1`
- Make sure Railway backend is running

### "Invalid API Key" Errors
- Go to Railway → Variables
- Double-check CLAUDE_API_KEY matches your actual key
- No extra spaces or quotes!

---

## 💡 Tips

- **Keep Railway and Vercel tabs open** while deploying
- **Watch the deployment logs** to see progress
- **Wait for "Success"** before testing
- **Copy URLs immediately** - you'll need them
- **Test thoroughly** before changing passwords

---

## 📊 What's Next?

After deployment:
1. **Share the URL** with friends/family
2. **Create your real account** (not test@...)
3. **Start logging meals** and symptoms
4. **Monitor usage** on Claude Console
5. **Enjoy your app!** 🎉

---

## 🎁 Your Deployed URLs

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

**Estimated Total Time: 20-25 minutes**

**You've got this! Follow each step carefully and you'll have a live app! 🚀**

---

**Need help?** If you get stuck on any step, take a screenshot and I can help you through it!
