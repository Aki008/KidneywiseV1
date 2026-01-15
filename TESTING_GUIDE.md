# Testing Guide - KidneyWise MVP

## Quick Test Scenarios

### Scenario 1: New User Journey (5 min)

**Goal:** Test complete user registration → onboarding → first meal

**Steps:**

1. **Landing Page**
   - Open http://localhost:3000
   - See hero section with features
   - Click "Get Started Free"

2. **Registration**
   - Email: test@kidneywise.com
   - Password: SecurePass123
   - Full Name: Sarah Johnson
   - Click "Create Account"
   - ✅ Should redirect to onboarding

3. **Onboarding - Step 1: Basic Info**
   - Name: Sarah Johnson (pre-filled)
   - Age: 45
   - Weight: 68 kg
   - Height: 165 cm (optional)
   - Click "Next"

4. **Onboarding - Step 2: CKD Stage**
   - Select "Stage 3b (GFR 30-44)"
   - Click "Next"

5. **Onboarding - Step 3: Dietary**
   - Select "Vegetarian"
   - Select cuisines: American, Italian, Indian
   - Food allergies: peanuts (optional)
   - Click "Next"

6. **Onboarding - Step 4: Permissions**
   - Enable: Camera ✓
   - Enable: Notifications ✓
   - Enable: Microphone (optional)
   - Click "Complete Setup"
   - ✅ Should redirect to dashboard

7. **Dashboard First View**
   - See: "Welcome back, Sarah!"
   - See: "0 day streak"
   - See: AI message (e.g., "Great job! Stay consistent...")
   - See: All nutrient bars at 0%
   - See: "Scan Food" and "View Trends" buttons
   - ✅ Verify all elements loaded

8. **Food Analysis**
   - Click "Scan Food"
   - Click "Upload from Gallery"
   - Upload a food photo (any image for MVP)
   - ✅ Should see "Analyzing your meal..."
   - ✅ Should detect foods (mock: chicken, rice, broccoli)

9. **Adjust Portions**
   - See 3 detected foods with portion sliders
   - Click "-" button on chicken (should decrease 10g)
   - Click "+" button on rice (should increase 10g)
   - Click "Analyze Nutrients"

10. **Review Analysis**
    - ✅ See safety status (green "Safe to Eat!" or red "Warning")
    - ✅ See nutrient breakdown per food
    - ✅ If warnings, see red/yellow alert boxes
    - Click "Alternatives" on a food item
    - ✅ See modal with safer options
    - Click "Use This Instead" or close modal

11. **Log Meal**
    - Click "Log This Meal"
    - ✅ Should see success toast
    - ✅ Should redirect to dashboard

12. **Dashboard After Meal**
    - ✅ See nutrient bars updated (no longer 0%)
    - ✅ See AI message changed based on intake
    - ✅ See contextual cards (if any)
    - ✅ Streak still 0 (same day)

**Expected Time:** 5 minutes
**Pass Criteria:** All ✅ items working

---

### Scenario 2: Unsafe Meal Warning (3 min)

**Goal:** Test nutrient limit warnings

**Setup:** Use account from Scenario 1 (already has some nutrients logged)

**Steps:**

1. Click "Scan Food" from dashboard
2. Upload a photo
3. Keep all portions at maximum (1000g each)
4. Click "Analyze Nutrients"
5. ✅ Should see red "Warning: Exceeds Limits" banner
6. ✅ Should see warning cards for nutrients over 100%
7. ✅ Each warning should show:
   - Nutrient name (e.g., "Potassium")
   - Severity badge (warning/danger)
   - Message (e.g., "This meal will put you 500mg over...")
   - Current intake vs limit breakdown
8. Click "Alternatives" on high-potassium food
9. ✅ Should see safer options with % reduction
10. Click "Adjust Portions" instead of logging
11. ✅ Should return to portion adjustment screen
12. Reduce portions by 50% on all foods
13. Analyze again
14. ✅ Warnings should decrease or disappear

**Expected Time:** 3 minutes
**Pass Criteria:** Warnings appear correctly

---

### Scenario 3: Login & Logout (1 min)

**Goal:** Test authentication flow

**Steps:**

1. Click "Log Out" button (top right on dashboard)
2. ✅ Should redirect to login page
3. Try to visit http://localhost:3000/dashboard directly
4. ✅ Should redirect to /login (protected route)
5. Enter credentials from Scenario 1
6. Click "Log In"
7. ✅ Should redirect to dashboard
8. ✅ Should see previous nutrient data (persisted)

**Expected Time:** 1 minute
**Pass Criteria:** Auth working, data persists

---

### Scenario 4: Onboarding Back Navigation (2 min)

**Goal:** Test multi-step form navigation

**Steps:**

1. Create new account with different email
2. In onboarding Step 1, fill in basic info
3. Click "Next"
4. On Step 2, click "Back" button
5. ✅ Should return to Step 1 with data preserved
6. Click "Next" again
7. ✅ Should go to Step 2
8. Complete all steps normally
9. ✅ Progress bar should update (25% → 50% → 75% → 100%)

**Expected Time:** 2 minutes
**Pass Criteria:** Navigation and data preservation work

---

### Scenario 5: Empty Dashboard State (1 min)

**Goal:** Test UI with no data

**Steps:**

1. Create fresh account
2. Complete onboarding
3. On dashboard, verify:
   - ✅ All nutrient bars at 0%
   - ✅ "No meals logged today" message
   - ✅ "Scan Food Now" CTA button
   - ✅ AI message encouraging first meal

**Expected Time:** 1 minute
**Pass Criteria:** Empty states handled gracefully

---

## API Testing (with curl)

### Test Health Check
```bash
curl http://localhost:8080/health
# Expected: {"status":"healthy","timestamp":"2025-..."}
```

### Test Registration
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "TestPass123",
    "fullName": "API Test User"
  }'
# Expected: {"success":true,"data":{"userId":"...","accessToken":"...","refreshToken":"..."}}
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api-test@example.com",
    "password": "TestPass123"
  }'
# Expected: {"success":true,"data":{"userId":"...","accessToken":"...","refreshToken":"..."}}
```

### Test Protected Endpoint (Dashboard)
```bash
# Replace YOUR_TOKEN with accessToken from login response
curl http://localhost:8080/api/v1/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: {"success":false,"error":{"code":"ONBOARDING_REQUIRED"}} (if not onboarded)
```

### Test Food Search
```bash
curl "http://localhost:8080/api/v1/foods/search?q=chicken" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Expected: {"success":true,"data":{"foods":[...]}}
```

---

## Mobile Testing

### iOS Safari
1. Open http://localhost:3000 on iPhone
2. Tap "Share" → "Add to Home Screen"
3. ✅ Icon should appear on home screen
4. Open app from home screen
5. ✅ Should open in standalone mode (no browser chrome)
6. Test camera:
   - Go to Food Analysis
   - Tap "Capture Photo"
   - ✅ Should request camera permission
   - ✅ Camera preview should work
   - ✅ Capture should work

### Android Chrome
1. Open http://localhost:3000 on Android
2. Tap menu → "Add to Home Screen"
3. ✅ Install prompt should appear
4. Repeat iOS tests above

### Responsive Testing (Browser DevTools)
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test these viewports:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - Pixel 5 (393x851)
   - iPad (768x1024)
4. Verify:
   - ✅ All text readable
   - ✅ Buttons not too small
   - ✅ No horizontal scroll
   - ✅ Safe areas respected (notch)

---

## Database Testing

### Verify Migrations
```bash
cd backend
npx knex migrate:status
# Expected: All 5 migrations marked as "Completed"
```

### Check Tables Created
```bash
psql kidneywise_dev -c "\dt"
# Expected: 8 tables (users, daily_limits, foods, meals, meal_foods, daily_nutrient_totals, refresh_tokens, password_reset_tokens)
```

### Verify Seed Data
```bash
psql kidneywise_dev -c "SELECT COUNT(*) FROM foods;"
# Expected: 15 rows
```

### Test Daily Limits Trigger
```bash
psql kidneywise_dev -c "
  UPDATE users SET ckd_stage = '4', weight = 80 WHERE email = 'test@kidneywise.com';
  SELECT potassium, protein FROM daily_limits WHERE user_id = (SELECT user_id FROM users WHERE email = 'test@kidneywise.com');
"
# Expected: Limits should update automatically (potassium should be lower for stage 4)
```

---

## Error Testing

### Test Invalid Login
1. Go to /login
2. Enter: wrong@example.com / WrongPassword
3. ✅ Should see error toast: "Invalid credentials"

### Test Duplicate Registration
1. Try to register with existing email
2. ✅ Should see error: "Email already registered"

### Test Invalid Onboarding Data
1. In onboarding, enter weight: 5 kg (too low)
2. ✅ Should not allow submission (button disabled)

### Test Network Error
1. Stop backend server
2. Try to log in from frontend
3. ✅ Should see error toast: "Failed to..."
4. Restart backend
5. ✅ Should work again

### Test Token Expiry
1. Log in normally
2. Wait 16 minutes (token expires at 15min)
3. Try to access dashboard
4. ✅ Should auto-refresh token or redirect to login

---

## Performance Testing

### Load Dashboard
1. Open browser DevTools → Network tab
2. Load dashboard
3. Check:
   - ✅ API call completes in <500ms
   - ✅ Page renders in <1s
   - ✅ No JavaScript errors in console

### Upload Large Photo
1. Go to Food Analysis
2. Upload 8MB photo
3. Check:
   - ✅ Upload progress bar shows
   - ✅ Completes within 5 seconds
   - ✅ Photo displays correctly

### Multiple Nutrient Calculations
1. Add 10 foods to a meal
2. Adjust portions multiple times
3. Click "Analyze Nutrients"
4. ✅ Should complete in <1 second

---

## Regression Testing Checklist

Run this before any major changes:

- [ ] User can register
- [ ] User can login
- [ ] Onboarding saves data
- [ ] Dashboard loads with correct data
- [ ] Food analysis uploads photo
- [ ] Foods are detected (mock)
- [ ] Portions can be adjusted
- [ ] Nutrient analysis runs
- [ ] Warnings appear when over limits
- [ ] Alternatives load
- [ ] Meals can be logged
- [ ] Dashboard updates after meal
- [ ] User can logout
- [ ] Protected routes redirect to login
- [ ] PWA installs on mobile
- [ ] Camera works on mobile

---

## Bug Reporting Template

When you find a bug, report it like this:

```
**Bug:** [Short description]

**Steps to Reproduce:**
1. Go to...
2. Click...
3. Enter...

**Expected:** [What should happen]

**Actual:** [What actually happened]

**Environment:**
- Browser: Chrome 120
- Device: iPhone 12
- OS: iOS 16

**Console Errors:** [If any]

**Screenshots:** [If applicable]
```

---

## Test Data Reference

### Test Accounts
| Email | Password | CKD Stage | Use Case |
|-------|----------|-----------|----------|
| test@example.com | password123 | 3b | General testing |
| stage5@example.com | password123 | 5 | High restrictions |
| transplant@example.com | password123 | transplant | Different limits |

### Sample Foods in DB
- Grilled Chicken Breast (220mg K, 200mg P)
- White Rice (35mg K, 43mg P) - Low K
- Banana (358mg K, 22mg P) - High K
- Apple (107mg K, 11mg P) - Low K
- Salmon (363mg K, 252mg P) - High K&P

---

## Success Metrics

### MVP is passing if:
- ✅ All 5 scenarios complete successfully
- ✅ API tests return expected responses
- ✅ Mobile PWA installs and works
- ✅ No console errors during normal use
- ✅ Camera works on mobile devices
- ✅ Data persists after logout/login
- ✅ All migrations run successfully
- ✅ Responsive on mobile/tablet/desktop

---

**Last Updated:** January 2025
**Next Review:** After LogMeal API integration
