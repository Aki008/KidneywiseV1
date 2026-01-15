# 📦 Install Prerequisites for KidneyWise

## ⚠️ You need to install these first before running the app!

---

## 1️⃣ Install Homebrew (Package Manager for Mac)

**Open Terminal and run:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**After installation, follow the instructions to add Homebrew to your PATH**

---

## 2️⃣ Install Node.js (JavaScript Runtime)

**Run in Terminal:**
```bash
brew install node@18
```

**Verify installation:**
```bash
node --version
# Should show: v18.x.x or higher
```

---

## 3️⃣ Install PostgreSQL (Database)

**Run in Terminal:**
```bash
brew install postgresql@14
```

**Start PostgreSQL:**
```bash
brew services start postgresql@14
```

**Verify it's running:**
```bash
psql --version
# Should show: psql (PostgreSQL) 14.x
```

---

## 4️⃣ Get OpenAI API Key

1. **Go to:** https://platform.openai.com/signup
2. **Create account** (or login)
3. **Go to:** https://platform.openai.com/api-keys
4. **Click:** "Create new secret key"
5. **Copy the key** (starts with `sk-proj-` or `sk-`)
6. **Save it somewhere** - you'll need it later!

---

## ✅ Verification Checklist

Run these commands to verify everything is installed:

```bash
# Check Homebrew
brew --version

# Check Node.js
node --version

# Check npm
npm --version

# Check PostgreSQL
psql --version

# Check if PostgreSQL is running
pg_isready
```

**All commands should return version numbers, not errors!**

---

## 🎯 After Installing All Prerequisites

**Follow these steps in order:**

### Step 1: Go to the app directory
```bash
cd /Users/ankitsharma/Documents/Kidneywise/kidneywise-app
```

### Step 2: Run the setup script
```bash
./RUN_ME_FIRST.sh
```

**OR follow the manual steps in `HOW_TO_START.md`**

---

## 🆘 Troubleshooting Installation

### Homebrew won't install
- Make sure you have internet connection
- Try running the command again
- Check: https://brew.sh

### Node.js won't install
```bash
# Try alternative method:
brew update
brew install node
```

### PostgreSQL won't start
```bash
# Check if it's running:
brew services list

# Try restarting:
brew services restart postgresql@14
```

### OpenAI says "No credits"
- Go to: https://platform.openai.com/account/billing
- Add payment method
- You need at least $5 credit

---

## 💰 Cost Estimate

**Free:**
- Homebrew
- Node.js
- PostgreSQL

**Paid:**
- OpenAI API: ~$0.01-0.05 per meal analysis
- Estimated: $1-2 for 100 test meals

---

## ⏱️ Installation Time

- Homebrew: 5-10 minutes
- Node.js: 2-3 minutes
- PostgreSQL: 3-5 minutes
- OpenAI signup: 2-3 minutes

**Total: ~15-20 minutes**

---

## 📋 Quick Command Summary

**Copy and paste these one by one:**

```bash
# 1. Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install Node.js
brew install node@18

# 3. Install PostgreSQL
brew install postgresql@14

# 4. Start PostgreSQL
brew services start postgresql@14

# 5. Verify everything
node --version && npm --version && psql --version && pg_isready
```

**If all commands work, you're ready to start the app!**

---

## 🎉 Next Steps

Once all prerequisites are installed:

1. **Read:** `HOW_TO_START.md`
2. **Or run:** `./RUN_ME_FIRST.sh`
3. **Then open:** http://localhost:3000 in your browser

---

## 🔗 Useful Links

- **Homebrew:** https://brew.sh
- **Node.js:** https://nodejs.org
- **PostgreSQL:** https://www.postgresql.org
- **OpenAI:** https://platform.openai.com

---

**Need help? All the documentation is in this folder!**
