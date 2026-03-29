# Quick Start - Copy & Paste Commands

## 🚀 FASTEST WAY TO TEST

### Terminal 1: Start Backend
```bash
cd VouchBackend
npm run dev
```

**Wait for:**
```
✓ Server running on port 5000
✓ MongoDB connected
✓ Socket.IO configured
```

---

### Terminal 2: Start Frontend Metro Bundler
```bash
cd VouchFrontend
npm start
```

**Wait for:**
```
info Listening on http://localhost:8081
› Metro waiting on exp://...
› Scan this with Expo Go to run live reload
```

---

### Terminal 3: Launch App

**Option A - Android Emulator (Easiest)**
```bash
cd VouchFrontend
npm run android
```

**Option B - iOS Simulator (Mac)**
```bash
cd VouchFrontend
npm run ios
```

**Option C - Expo Go (Fastest)**
```bash
# Scan QR code from Terminal 2 output with Expo Go app (phone)
```

---

## ⚡ AUTOMATED TEST (No Manual Navigation)

**Just run this:**
```bash
cd VouchFrontend
npm run test:e2e
```

**Expected:**
```
PASS  __tests__/fullstack.e2e.test.ts (11.51 s)
✓ startup and professional can complete request and messaging flow (6783 ms)
```

It automatically:
- Starts backend ✅
- Creates startup & professional ✅
- Uploads verification docs ✅
- Admin approves ✅
- Creates request ✅
- Accepts request ✅
- Sends messages via Socket.IO ✅
- Closes request ✅

---

## 👤 MANUAL TESTING - Complete User Flow

### Step 1: Create Startup Account

```
1. App opens → Landing screen
2. Tap "Get Started"
3. Select "Startup"
4. Fill: 
   Email: startup@test.com
   Password: Test@1234
   Company: TechCo
5. Tap "Create Account" → Onboarding
6. Fill:
   Company: TechCo Inc
   Industry: SaaS
   City: Mumbai
   Description: We need legal help
7. Tap "Save Profile"
8. Tap "Continue"
9. You're now on Directory (Find Pro tab)
```

### Step 2: Create Professional Account (2nd Tab/Device)

```
1. Landing screen
2. Tap "Get Started"
3. Select "Lawyer"
4. Fill:
   Email: lawyer@test.com
   Password: Test@1234
   Name: John Smith
5. Tap "Create Account" → Onboarding
6. Fill:
   Name: John Smith
   City: Mumbai
   Experience: 5
   Specializations: Corporate Law,IP Law
   License: LAW123456
   Fee: ₹5k-15k
7. Tap "Save Profile"
8. Tap "Continue"
9. You're on Open Jobs (Professional tab)
10. Tap "Profile" tab
11. Tap "Upload Verification Docs"
12. Pick any image/PDF
13. Tap "Submit for Verification"
```

### Step 3: Admin Approval (3rd Tab)

```
1. Landing → "I already have an account"
2. Email: admin@vouch.com
3. Password: AdminPass123
4. Login
5. See "Pending Verifications"
6. Find John Smith's verification
7. Tap "Approve"
8. Confirm "Approve"
9. John now has ✓ Verified badge
```

### Step 4: Create Request (Back to Startup)

```
1. In startup app, Directory tab
2. Should see John Smith's card with ✓ badge
3. Tap his card
4. Tap "Create Service Request"
5. Select category: COMPLIANCE
6. Fill:
   Description: Need help with GDPR compliance audit
   City: Mumbai
   Budget: ₹20k-50k
7. Tap "Submit Request"
8. Back to Directory
9. Tap "My Requests" tab
10. See your request with status OPEN
```

### Step 5: Accept Request (Professional)

```
1. In professional app, Open Jobs tab
2. See your request card appeared
3. Tap "Accept Job"
4. 🎉 Chat opens automatically
5. Type: "Hi, I can help with that!"
6. Tap "Send"
```

### Step 6: View Chat (Startup)

```
1. Back in startup app
2. Tap "My Requests"
3. Request now shows status "ACCEPTED"
4. Tap "View Chat" button
5. See message from John
6. Type reply: "Great! Let's start next week"
7. Tap "Send"
8. See real-time message appears
```

### ✅ Full Flow Complete!

You can see:
- ✅ Profile creation for both roles
- ✅ Verification workflow
- ✅ Admin approval & verified badge
- ✅ Request creation, browsing, acceptance
- ✅ Auto-created chat
- ✅ Real-time messaging (Socket.IO)

---

## 📱 VIEW ALL SCREENS

### Startup App Tabs:
1. **Find Pro** - Browse professionals with filters
2. **Requests** - Your service requests with status
3. **Profile** - Your company info

### Professional App Tabs:
1. **Open Jobs** - Browse open requests to accept
2. **My Jobs** - Your accepted requests  
3. **Profile** - Your professional profile

### Admin App:
1. **Dashboard** - Verify professionals (approve/reject)

### Auth Screens:
1. **Landing** - Welcome page
2. **Register** - Create account (choose role)
3. **Login** - Sign in
4. **Onboarding** - Fill profile after signup

### Shared Screens:
1. **Professional Detail** - View pro's full profile
2. **Create Request** - Create new service request
3. **Chat** - Real-time messaging (appears after request accepted)

---

## 🔍 VERIFICATION CHECKLIST

After manual testing, verify:

- [ ] Background changes to correct app for your role
- [ ] All form fields have validation (red error below if empty)
- [ ] Profile data displays correctly after save
- [ ] Verified badge shows ✓ only for approved professionals
- [ ] Directory shows filter results update in real-time
- [ ] Request status changes: OPEN → ACCEPTED → (CLOSED optional)
- [ ] Chat opens immediately after accepting request
- [ ] Messages appear in real-time (no refresh needed)
- [ ] Other user sees your messages instantly

---

## ❌ TROUBLESHOOTING

**App won't load:**
```bash
# Metro cache issue
npm start -- --reset-cache

# Or full reset
rm -rf node_modules
npm install
npm start
```

**Backend connection fails:**
- Check backend running: `npm run dev` in VouchBackend
- Check port 5000 is free: `lsof -i :5000`
- Check MongoDB connected (logs should show it)

**File upload fails:**
- Pick PDF or image only
- File under 5MB
- Check Cloudinary env vars on backend

**Socket.IO not connecting:**
- Both apps must use `http://127.0.0.1:5000` (or `10.0.2.2:5000` for emulator)
- Check backend Socket.IO logs: "Socket.IO configured"
- Messages still send via HTTP if Socket fails (slower but works)

**Chat not loading:**
- Make sure request was actually ACCEPTED (status changed)
- Check navigation params include both `requestId` and `chatId`
- Wait 2 seconds for messages to load

---

## 📊 EXPECTED TIMINGS

| Action | Time |
|--------|------|
| Startup register + profile | 1-2 min |
| Professional register + profile | 2 min |
| Upload verification | 30 sec |
| Admin approve | 10 sec |
| Create & accept request | 1-2 min |
| Chat message send/receive | < 1 sec (real-time) |
| **Complete flow** | **~10-15 min** |

---

## 🎥 WHAT YOU'LL SEE

### Landing Screen
```
        Vouch
   V (in box)
   
   Connect with verified Lawyers & CAs
   you can trust
   
   ✓ Verified professionals only
   ⚡ Direct service requests
   💬 Real-time secure chat
   
   [Get Started] [I already have account]
```

### Directory Screen (Professional Listing)
```
Find a Professional

[Search by city...]
[All] [Lawyer] [CA]

[R] Riya Sharma          ✓
    LAWYER · Mumbai
    5 yrs exp · ₹5k-20k
    [Corporate Law] [IP Law]
```

### Chat Screen
```
                    Hi, I can help!
                    (blue bubble, right)
            
    Thanks for accepting! Can you start?
    (gray bubble, left)

[Type message...] [Send]
```

---

## Quick Links

- **Full Test Guide**: [E2E_TESTING_GUIDE.md](E2E_TESTING_GUIDE.md)
- **Line-by-Line Verify**: [LINE_BY_LINE_VERIFICATION.md](LINE_BY_LINE_VERIFICATION.md)
- **Frontend Audit**: [FRONTEND_VERIFICATION_AUDIT.md](FRONTEND_VERIFICATION_AUDIT.md)
- **Backend API Docs**: [VouchBackend/API_REFERENCE.md](VouchBackend/API_REFERENCE.md)

---

## ✅ You're Ready!

Pick one:
- 🤖 Want automatic test? → Run `npm run test:e2e`
- 🎮 Want to play with app? → Start backend + frontend + emulator
- 📋 Want step-by-step guide? → Read E2E_TESTING_GUIDE.md

Let me know what you pick! 🚀
