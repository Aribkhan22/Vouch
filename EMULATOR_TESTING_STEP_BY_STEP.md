# EMULATOR TESTING - STEP BY STEP (Windows/Mac/Linux)

## ✅ Checklist Before Starting
- [ ] Android Studio installed
- [ ] Android SDK downloaded (API 30+)
- [ ] Emulator created (or will create one)
- [ ] Windows: Git Bash or PowerShell
- [ ] Mac/Linux: Terminal

---

## STEP 1: Create & Start Android Emulator (5 minutes)

### If you already have an emulator, SKIP to Step 2

### Option A: Create New Emulator

**Open Android Studio:**
```
Android Studio → Welcome Screen
  ↓
Click: Device Manager (bottom menu or side panel)
  ↓
Click: + Create Device
```

**Select Device:**
```
Category: Phone
Model: Pixel 6 (or any Pixel model)
Click: Next
```

**Select System Image:**
```
Release Name: Android 12 or higher (e.g., S, T, U)
Click: Download (if not installed)
Wait 2-3 minutes...
Click: Next
```

**Finish:**
```
Configuration Name: Keep default
Click: Finish
```

### Option B: Start Existing Emulator

**Android Studio:**
```
Device Manager → Your Device → Click Play button ▶️

OR using command line:
emulator -avd Pixel_6_API_30
```

### ⏳ Wait for Emulator to Load

```
Emulator window opens
→ Android boot animation (colorful dots)
→ Emulator loading (2-3 minutes)
→ Android home screen appears ✅
```

**SIGNS IT'S READY:**
- ✅ You see Android home screen
- ✅ No splash screen or "Android" logo
- ✅ Time shows in top left
- ✅ No 100% CPU spinning

---

## STEP 2: Open 3 Terminal Windows

**All in separate windows/tabs:**

### Terminal 1: Backend
```bash
cd d:\Project\CodeBase\VouchBackend
npm run dev
```

**Wait for:**
```
✓ Server running on PORT 5000
✓ Database connected
✓ Socket.IO configured
```

**If errors:**
```
"Port 5000 in use" → kill process:
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Mac/Linux:
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

### Terminal 2: Metro Bundler (Frontend)
```bash
cd d:\Project\CodeBase\VouchFrontend
npm start
```

**Wait for:**
```
info Listening on http://localhost:8081
info Metro waiting on exp://...
```

**Or if issues:**
```bash
npm start -- --reset-cache
```

**DO NOT CLOSE THIS TERMINAL - Keep it running**

---

### Terminal 3: Deploy to Emulator
```bash
cd d:\Project\CodeBase\VouchFrontend
npm run android
```

**What happens:**
```
→ Detects emulator running
→ Builds APK
→ Installs APK on emulator
→ Launches app
→ Emulator screen flickers (normal!)
→ App loading...
→ Landing Screen appears! ✅
```

**If stuck at "Building APK":**
- Wait 1-2 minutes (Gradle can be slow)
- Don't close terminals
- If hangs > 3 min, close and retry: `npm run android`

---

## STEP 3: App Should Be Running on Emulator

### You should see:

```
┌─────────────────────────────┐
│     VOUCH                   │
│      V (in box)             │
│                             │
│  Connect with verified      │
│  Lawyers & CAs you trust    │
│                             │
│  ✓ Verified only            │
│  ⚡ Direct requests         │
│  💬 Real-time chat          │
│                             │
│  [Get Started]              │
│  [I already have account]   │
└─────────────────────────────┘
```

✅ **If you see this, SUCCESS!** Continue to next section.

### If blank/white screen:
```bash
# Keep waiting (10-30 seconds for Metro bundler)

# If still blank after 30 sec:
# In Terminal 3, press Ctrl+L to reload
# Or press R twice to reload app
```

### If red error screen:
```
Don't panic! 
Take a screenshot of the error
Could be API connection issue (we'll fix below)
```

---

## STEP 4: Fix Any API Connection Issues

### Check if Backend URL Correct

**File to edit:**
```
d:\Project\CodeBase\VouchFrontend\src\utils\constants.ts
```

**Current content should be:**
```typescript
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://vouch-backend.up.railway.app'
  : 'http://10.0.2.2:5000';  // ← Emulator uses 10.0.2.2 for localhost
```

**Important:** For Android Emulator, use `10.0.2.2:5000` (NOT `localhost`)

If showing `http://127.0.0.1:5000` or `http://localhost:5000`, that's WRONG for emulator.

**To fix:**
```
1. Open VouchFrontend/src/utils/constants.ts
2. Find API_BASE_URL
3. Make sure it has: 'http://10.0.2.2:5000'
4. Save file
5. Terminal 2 auto-reloads (watch for "reload" message)
6. Emulator will refresh automatically
7. Try again
```

### Test if Connected

```
1. On emulator, tap "Get Started"
2. You should see Register screen load
3. If blank or error, API not connected

If error:
- Check Backend terminal - errors showing?
- Check constants.ts - correct URL?
- Check firewall - port 5000 blocking?
```

---

## STEP 5: User Testing Flows on Emulator

### Now Follow These Flows (Each ~3-5 minutes)

---

## FLOW A: Create Startup Account

### Screen 1: Landing
```
VISIBLE:
✓ Vouch logo
✓ Tagline
✓ 3 features
✓ Get Started button
✓ I already have account link

ACTION: Tap "Get Started" button (blue)
WAIT: 1 second
NEXT: Register screen
```

### Screen 2: Register
```
VISIBLE:
├─ Three role cards: [Startup] [Lawyer] [CA]
├─ Name field
├─ Email field
├─ Password field
└─ Create Account button

FILL:
├─ Tap "Startup" card (highlights blue)
├─ Name: "TechCo Inc"
├─ Email: "startup@test.com"
└─ Password: "Test@1234"
   (Must: 8+ chars, has letters + numbers)

ACTION: Tap "Create Account"
WAIT: 2-3 seconds (API call)
NEXT: Onboarding screen
```

### Screen 3: Onboarding
```
VISIBLE:
├─ Title: "Set up your profile"
├─ Subtitle: "Tell us about your company"
├─ Company Name field
├─ Industry field
├─ City field
├─ Description field (multiline)
└─ Save Profile button

FILL:
├─ Company Name: "TechCo Inc"
├─ Industry: "FinTech"
├─ City: "Mumbai"
└─ Description: "We build payment solutions and need legal compliance help"
   (Must: 10+ chars)

ACTION: Tap "Save Profile"
WAIT: 1-2 seconds
SEE: Alert "Profile saved! Welcome to Vouch."
ACTION: Tap "Continue"
WAIT: 1 second

NEXT: Directory screen (Find Pro tab)
```

### Screen 4: Home - Directory
```
VISIBLE:
├─ Header: "Find a Professional"
├─ Search box: "Filter by city..."
├─ Filter buttons: [All] [Lawyer] [CA]
└─ Empty list: "No professionals found."

NOTE: Empty because no professionals created yet
This is normal! Keep this app open.

Next: Create professional account in FLOW B
```

✅ **FLOW A COMPLETE**

---

## FLOW B: Create Professional Account (Parallel)

**IMPORTANT: Keep emulator/Flow A open!**

**Now we do professional in SAME EMULATOR:**

### Option 1: Different Chrome Profile (Easiest)
```
If testing in browser emulator:
1. Open NEW INCOGNITO window
2. Go to app again
3. New account = different "device/browser"
4. Or open in different browser (Chrome + Firefox)
```

### Option 2: Within Emulator
```
If using physical emulator window:
1. On emulator, system button to go back home
2. Tap app again to restart
3. OR just logout and login as new user
```

### For this guide, assume same emulator window:

**On emulator, go back to Landing:**
```
Press Android back button multiple times
OR
Tap and hold back button → "Vouch" option
```

### Screen 1: Landing
```
ACTION: Tap "Get Started"
```

### Screen 2: Register
```
FILL:
├─ Tap "Lawyer" card (highlights blue)
├─ Name: "John Smith"
├─ Email: "lawyer@test.com"
└─ Password: "Test@1234"

ACTION: Tap "Create Account"
WAIT: 2-3 seconds
NEXT: Onboarding
```

### Screen 3: Onboarding
```
VISIBLE:
├─ Title: "Set up your profile"
├─ Subtitle: "Tell clients about your lawyer practice"
├─ Full Name field
├─ City field
├─ Experience Years field
├─ Specializations field (comma-separated)
├─ License Number field
├─ Fee Range field (optional)
└─ Save Profile button

FILL:
├─ Full Name: "John Smith"
├─ City: "Mumbai"
├─ Experience Years: "5"
├─ Specializations: "Corporate Law, IP Law"
├─ License Number: "LAW12345"
└─ Fee Range: "₹5k-20k"

ACTION: Tap "Save Profile"
WAIT: 1-2 seconds
SEE: Alert "Profile saved! Next: upload verification documents."
ACTION: Tap "Continue"

NEXT: Professional home (Open Jobs tab)
```

### Screen 4: Professional Home
```
VISIBLE:
├─ Three tabs: [Open Jobs] [My Jobs] [Profile]
├─ Currently on: Open Jobs
├─ Header: "Open Jobs - Requests from startups needing help"
└─ Empty list: "No open requests right now"

ACTION: Tap "Profile" tab (3rd)
NEXT: Profile screen
```

### Screen 5: Professional Profile
```
VISIBLE:
├─ Section 1: User Info
│  ├─ Name: "John Smith"
│  ├─ Email: "lawyer@test.com"
│  └─ Role: "LAWYER"
│
├─ Section 2: Professional Profile
│  ├─ Name: "John Smith"
│  ├─ Type: "LAWYER"
│  ├─ City: "Mumbai"
│  ├─ Experience: "5 years"
│  ├─ Specializations: "Corporate Law, IP Law"
│  ├─ License Number: "LAW12345"
│  └─ Fee Range: "₹5k-20k"
│
├─ "Upload Verification Docs" button (orange outline)
└─ "Sign Out" button

ACTION: Tap "Upload Verification Docs"
NEXT: Verification Upload screen
```

### Screen 6: Verification Upload
```
VISIBLE:
├─ Title: "Verification Upload"
├─ Subtitle: "Upload up to 3 documents (PDF or images)..."
├─ "Pick Documents (0/3)" button
└─ "Submit for Verification" button (disabled)

ACTION: Tap "Pick Documents (0/3)"
NEXT: File picker opens

SELECT: 
  Any image or PDF from emulator storage
  (If none available: use default image)

RESULT:
  ├─ File appears in list
  ├─ Counter shows (1/3)
  └─ Submit button becomes enabled (blue)

ACTION: Tap "Submit for Verification"
WAIT: 2-3 seconds (upload)
SEE: Alert "Documents submitted for review"
ACTION: Tap "OK"

RESULT: Back to Profile screen
```

✅ **FLOW B COMPLETE**

---

## FLOW C: Admin Approval (Parallel - New Incognito/Window)

**For testing, open a NEW INCOGNITO WINDOW** (simulates different user)

### Screen 1: Landing
```
ACTION: Tap "I already have an account"
        (NOT Get Started)

NEXT: Login screen
```

### Screen 2: Login
```
VISIBLE:
├─ Email field
├─ Password field
└─ Sign In button
└─ Sign up link

FILL:
├─ Email: "admin@vouch.com"
├─ Password: "AdminPass123"

ACTION: Tap "Sign In"
WAIT: 2-3 seconds
NEXT: Admin Dashboard
```

### Screen 3: Admin Dashboard
```
VISIBLE:
├─ Title: "Pending Verifications"
├─ Card: John Smith's verification
│  ├─ Name: "John Smith"
│  ├─ Email: "lawyer@test.com"
│  ├─ "1 document(s) submitted"
│  ├─ "Approve" button (green)
│  └─ "Reject" button (red)

ACTION: Tap "Approve" button
WAIT: Dialog appears

SEE: "Are you sure you want to approve this verification request?"
ACTION: Tap "Approve" button in dialog
WAIT: 1-2 seconds

RESULT:
  ├─ John's card disappears (now approved!)
  ├─ List becomes empty again
  └─ John now has ✓ Verified status
```

✅ **FLOW C COMPLETE**

---

## FLOW D: Create Request (Back to Startup Window)

**Back to your first window with Startup account**

### Screen 1: Directory
```
ACTION: Refresh or wait 5 seconds

SHOULD NOW SEE:
├─ Professional Card: John Smith
│  ├─ Avatar: "J"
│  ├─ Name: "John Smith"
│  ├─ LAWYER · Mumbai
│  ├─ ✓ VERIFIED BADGE (green checkmark)
│  ├─ 5 yrs exp
│  ├─ ₹5k-20k
│  └─ [Corporate Law] [IP Law] tags

VERIFY: ✓ Badge is showing!
ACTION: Tap the card

NEXT: Professional Detail screen
```

### Screen 2: Professional Detail
```
VISIBLE:
├─ Avatar: "J"
├─ Name: "John Smith"
├─ LAWYER · Mumbai
├─ ✓ VERIFIED (green badge)
├─ 5 years experience
├─ License: LAW12345
├─ Fee: ₹5k-20k
├─ Specializations: [Corporate Law] [IP Law]
└─ "Create Service Request" button (blue)

ACTION: Tap "Create Service Request"
NEXT: Create Request screen
```

### Screen 3: Create Request
```
VISIBLE:
├─ Category scroll: [TRADEMARK] [PATENT] [COPYRIGHT] [TAX] [COMPLIANCE]
├─ Description field
├─ City field
├─ Budget Range field
└─ Submit Request button

SELECT CATEGORY:
  ACTION: Tap "COMPLIANCE"
  RESULT: Button highlights blue

FILL FORM:
├─ Category: "COMPLIANCE" (selected)
├─ Description: "Need help with GDPR data privacy compliance audit"
│  (Must: 20+ chars)
├─ City: "Mumbai"
└─ Budget Range: "₹20k-50k"

ACTION: Tap "Submit Request"
WAIT: 1-2 seconds
RESULT: Navigate back to Directory or show success

✅ Request created with status: OPEN
```

✅ **FLOW D COMPLETE**

---

## FLOW E: Accept Request & Chat (Professional Window)

**Back to professional window**

### Screen 1: Open Jobs Tab
```
ACTION: Click "Open Jobs" tab (if not already)
WAIT: 2-3 seconds for refresh

SHOULD NOW SEE:
├─ RequestCard:
│  ├─ Category: "COMPLIANCE"
│  ├─ Status: "OPEN" (orange badge)
│  ├─ Description: "Need help with GDPR..."
│  ├─ City: "Mumbai"
│  ├─ Budget: "₹20k-50k"
│  └─ "Accept Job" button (blue)

ACTION: Tap "Accept Job"
WAIT: 2-3 seconds
  ├─ Backend accepts request
  ├─ Backend creates Chat
  ├─ Socket.IO connects
  └─ Navigate to Chat

NEXT: Chat screen opens! 🎉
```

### Screen 2: Chat (Professional)
```
VISIBLE:
├─ Empty message list
├─ Bottom: Text input "Type a message..."
└─ Send button

ACTION: Type message:
"Hi! I've reviewed your GDPR requirements. I can help with compliance."

ACTION: Tap "Send"
RESULT:
  ├─ Message appears as BLUE bubble on RIGHT
  ├─ Input clears
  └─ Auto-scrolls down

✅ Message sent via Socket.IO!
```

✅ **FLOW E COMPLETE**

---

## FLOW F: Reply Chat (Startup Window)

**Back to startup window**

### Screen 1: My Requests Tab
```
ACTION: Tap "Requests" tab (middle)

SHOULD SEE:
├─ RequestCard:
│  ├─ Category: "COMPLIANCE"
│  ├─ Status: "ACCEPTED" (green badge - changed!)
│  ├─ Description: "Need help with GDPR..."
│  ├─ "View Chat" button (NEW!)

ACTION: Tap "View Chat"
NEXT: Chat screen opens
```

### Screen 2: Chat (Startup)
```
VISIBLE:
├─ Message list shows:
│  ├─ GRAY bubble on LEFT (professional's message):
│  │  "Hi! I've reviewed your GDPR..."
│  │  Sender: "John Smith"
│  │  Time: "14:35"
│  │
│  └─ Input field below

ACTION: Type reply:
"Perfect! Let's start next week. When works best for you?"

ACTION: Tap "Send"
RESULT:
  ├─ Message appears as BLUE bubble on RIGHT
  ├─ Professional's window sees it INSTANTLY!

✅ Real-time Socket.IO working!
```

✅ **FLOW F COMPLETE - FULL E2E TEST DONE!**

---

## 🎉 EMULATOR TESTING COMPLETE!

### What You Tested:
- ✅ Startup account creation & profile
- ✅ Professional account & verification upload
- ✅ Admin verification approval
- ✅ ✓ Verified badge visible
- ✅ Directory search & filtering
- ✅ Request creation (status: OPEN)
- ✅ Request acceptance (status: ACCEPTED)
- ✅ Auto-chat creation
- ✅ Real-time messaging (Socket.IO)
- ✅ Both users seeing messages instantly

---

## 📊 Timing Log

| Step | Time |
|------|------|
| Startup account | 2 min |
| Professional + docs | 2 min |
| Admin approval | 1 min |
| Create request | 1 min |
| Accept + chat | 2 min |
| **TOTAL** | **~10 min** |

---

## ✅ You're Done with Emulator!

### Next Steps:
1. **Keep emulator open** - we'll use it for physical device testing too
2. **Repeat on Physical Device** - follow same flows with real phone
3. **Compare performance** - emulator vs device

### Want to test Physical Device Next?
See: [MANUAL_TESTING_EMULATOR_OR_DEVICE.md - PATH B](MANUAL_TESTING_EMULATOR_OR_DEVICE.md#path-b-physical-android-phone-usb)

---

## 🐛 If Anything Goes Wrong

| Issue | Fix |
|-------|-----|
| App blank screen | Wait 30 sec, then reload (R key twice) |
| API errors | Check constants.ts has `10.0.2.2:5000` |
| Chat not loading | Restart app (back button, tap app again) |
| Messages not real-time | Check backend terminal for "Socket.IO" |
| Can't find file picker | Use default image in picker |
| Emulator slow | Close other apps, increase RAM in Android Studio |

---

## 📸 Screenshots to Take (Optional)

1. Landing screen
2. Register with role selection
3. Directory with professional card (with ✓ badge)
4. Professional detail
5. Create request form
6. Chat with real-time messages
7. Both users seeing message simultaneously

---

## 🚀 Ready for Physical Device?

Once done with emulator, go to:
**[MANUAL_TESTING_EMULATOR_OR_DEVICE.md - PATH B](MANUAL_TESTING_EMULATOR_OR_DEVICE.md)**

For testing on real Android phone!

---

**Great job testing! 🎉**
