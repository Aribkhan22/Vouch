# Manual Testing: Emulator vs Physical Device

## 🎯 Choose Your Path

### Path A: Android Emulator (Easiest, Windows/Mac/Linux)
### Path B: Physical Android Phone (USB Connected)
### Path C: iOS Simulator (Mac Only)
### Path D: Expo Go (Fastest - Any Phone)

---

## PATH A: Android Emulator

### Prerequisites
- ✅ Android Studio installed
- ✅ Android SDK (Android 11 or higher)
- ✅ Emulator created in Android Studio

### Step 1: Open Android Studio

```
Android Studio → Device Manager (bottom menu)
  ↓
+ Create Device
  ├─ Select Device: Pixel 6 (or any)
  ├─ System Image: Android 12 or higher
  └─ Click "Next" → "Finish"
```

### Step 2: Start the Emulator

```
Device Manager → Your Device
  ↓
Click Play button (▶️)
  ↓
Wait 2-3 minutes for emulator to fully load
  ↓
You'll see Android home screen
```

### Step 3: Start Backend

```bash
# Terminal 1: Open new terminal
cd VouchBackend
npm run dev

# Wait for:
# ✓ Server running on port 5000
# ✓ MongoDB connected
```

### Step 4: Start Frontend Metro

```bash
# Terminal 2: Another new terminal
cd VouchFrontend
npm start

# Wait for QR code + "Metro ready"
```

### Step 5: Run App on Emulator

```bash
# Terminal 3: Another new terminal
cd VouchFrontend
npm run android

# Wait for:
# → Installing APK on emulator
# → App launches automatically
# → Landing screen appears
```

### ✅ You're Ready!
App now running on emulator. Proceed to **Testing Section** below.

### Troubleshooting Emulator
```bash
# Emulator slow?
# → Allocate more RAM in Android Studio
# → Settings → Project Settings → Emulator → RAM: 4GB (or more)

# Emulator won't connect to backend?
# In app, backend URL should be: http://10.0.2.2:5000
# (10.0.2.2 = localhost from emulator perspective)
# File: VouchFrontend/src/utils/constants.ts

# Emulator freezes?
# Kill it: adb emu kill
# Restart: Click play button again
```

---

## PATH B: Physical Android Phone (USB)

### Prerequisites
- ✅ Android phone with Android 8.0+
- ✅ USB cable
- ✅ "Developer Mode" enabled on phone
- ✅ "USB Debugging" enabled on phone

### Step 1: Enable Developer Mode on Phone

```
Settings → About Phone
  ↓
Find "Build Number" (scroll down)
  ↓
Tap "Build Number" 7 times (quickly)
  ↓
Toast appears: "You are now a developer!"
  ↓
Go back → System → Advanced → Developer Options
  ↓
Turn ON: "USB Debugging"
```

### Step 2: Connect via USB Cable

```
1. Plug USB cable into phone
2. Choose: "Allow USB Debugging?" → Tap "OK"
3. Desktop shows: "Tick mark" next to phone
```

### Step 3: Verify Connection

```bash
# Terminal: Check if adb sees device
adb devices

# Expected output:
# emulator-5554          device   ← if emulator running
# 192.168.1.100:5555    device   ← if physical phone
```

### Step 4: Start Backend

```bash
# Terminal 1
cd VouchBackend
npm run dev
# Wait for port 5000 ready
```

### Step 5: Start Frontend Metro

```bash
# Terminal 2
cd VouchFrontend
npm start
# Wait for Metro ready
```

### Step 6: Deploy to Physical Phone

```bash
# Terminal 3
cd VouchFrontend
npm run android

# Will detect:
# 1. Emulator (if running)
# 2. Physical device (if connected)
#
# If multiple, you'll get a menu:
# ? Choose device
# › Emulator (Google Pixel Emulator)
#   Physical Device (Samsung Galaxy)
#
# Select the physical device option
```

### Step 7: App Launches on Phone

```
App installs → Launches → Landing screen appears
Camera/flashlight may flicker (normal)
Wait 5-10 seconds for full load
```

### ✅ Physical Phone Ready!
Proceed to **Testing Section** below.

### Troubleshooting Physical Phone

```bash
# Phone won't connect?
# 1. Check USB cable (try different one)
# 2. Check Developer Options → USB Debugging is ON
# 3. Restart phone
# 4. Run: adb kill-server && adb start-server

# App won't load - white screen?
# 1. Check backend running: npm run dev
# 2. Check Metro bundler running: npm start
# 3. Wait 30 seconds (bundling)
# 4. Reload: adb shell input keyevent 82 (Menu button)

# API calls failing?
# File: VouchFrontend/src/utils/constants.ts
# Should be: http://<YOUR-COMPUTER-IP>:5000
# 
# Find your computer IP:
# Windows: ipconfig (look for "IPv4 Address": 192.168.x.x)
# Mac: ifconfig (look for "inet": 192.168.x.x)
# Linux: hostname -I
#
# Update constants.ts:
const API_BASE_URL = 'http://192.168.1.100:5000';  // Your computer IP
```

---

## PATH C: iOS Simulator (Mac Only)

### Prerequisites
- ✅ Mac with Xcode installed
- ✅ iOS 13 or higher

### Step 1: Open Simulator

```bash
# Terminal
open /Applications/Xcode.app/Contents/Developer/Applications/Simulator.app

# Or use Xcode:
# Xcode → Simulator → Choose device (iPhone 14, 15, etc.)
```

### Step 2: Start Backend

```bash
# Terminal 1
cd VouchBackend
npm run dev
```

### Step 3: Start Frontend

```bash
# Terminal 2
cd VouchFrontend
npm start
```

### Step 4: Deploy to Simulator

```bash
# Terminal 3
cd VouchFrontend
npm run ios

# Wait for:
# → Building for iOS
# → Installing app
# → App launches on simulator
# → Landing screen appears
```

### ✅ iOS Ready!
Proceed to **Testing Section** below.

### Troubleshooting iOS

```bash
# Simulator slow?
# Hardware → Device → Slower speed (or restart)

# Won't deploy?
# npm run ios -- --simulator="iPhone 15"

# API won't connect?
# constants.ts should be: http://localhost:5000
# (iOS simulator can use localhost directly)
```

---

## PATH D: Expo Go (FASTEST - Any Phone, No USB)

### Prerequisites
- ✅ Phone (Android or iPhone)
- ✅ Expo Go app installed (from Play Store or App Store)
- ✅ Phone on same WiFi as computer

### Step 1: Install Expo Go

**Android**: Google Play Store → Search "Expo Go" → Install
**iPhone**: App Store → Search "Expo Go" → Install

### Step 2: Start Backend

```bash
# Terminal 1
cd VouchBackend
npm run dev
```

### Step 3: Start Frontend with Expo

```bash
# Terminal 2
cd VouchFrontend
npm start

# You'll see:
# › Metro waiting on exp://...
# 
# Scan one of these QR codes:
# ┌──────────────────────┐
# │                      │
# │   [QR CODE HERE]     │  ← SCAN THIS
# │                      │
# └──────────────────────┘
#
# › Or enter the address manually:
# › http://192.168.1.100:8081
```

### Step 4: Scan QR Code with Phone

```
1. Open Expo Go app on phone
2. Tap "Scan QR" button
3. Point camera at QR code in terminal
4. App loads automatically
5. Wait 10-20 seconds
6. Landing screen appears! 🎉
```

### ✅ Expo Go Ready!
Proceed to **Testing Section** below.

### Advantages of Expo Go
- ✅ No USB cable needed
- ✅ Instant reload on code changes
- ✅ Works on any phone
- ✅ Faster than emulator
- ✅ No need for Android Studio/Xcode

### Troubleshooting Expo Go

```bash
# App won't load?
1. Check phone on same WiFi as computer
2. Check Backend running (npm run dev)
3. Try entering URL manually:
   Open Expo Go → Tap connection icon → 
   Enter: http://192.168.1.100:8081

# If still fails:
npm start -- --tunnel
# Uses Expo tunnel (works even on different WiFi)

# API still won't connect?
Check VouchFrontend/src/utils/constants.ts:
const API_BASE_URL = 'http://192.168.1.100:5000';  // Your computer IP
```

---

## 🧪 MANUAL TESTING SECTION (All Paths)

### Prerequisites Checklist
- ✅ Backend running: `npm run dev`
- ✅ Frontend running: `npm start` (and Android/iOS/Expo deployed)
- ✅ App showing Landing Screen
- ✅ Feel free to proceed below!

---

## Test Flow 1: Startup User (5 minutes)

### Step 1: Landing Screen
```
Screen shows:
├─ Vouch logo "V" in box
├─ App name: "Vouch"
└─ Features list:
   ✓ Verified professionals only
   ⚡ Direct service requests
   💬 Real-time secure chat

ACTION: Tap "Get Started" button (blue)
```

### Step 2: Register Screen
```
Fill form:
├─ I AM A: Tap "Startup" (should highlight blue)
├─ Full Name: "TechCo Inc"
├─ Email: "startup@example.com"
├─ Password: "Password123"
   (Must be: 8+ chars, letters + numbers)

ACTION: Tap "Create Account"
WAIT: 2-3 seconds (API call)
EXPECT: Alert "Account created" → Tap OK
```

### Step 3: Onboarding - Startup Profile
```
Fill form:
├─ Company Name: "TechCo Inc"
├─ Industry: "FinTech"
├─ City: "Mumbai"
└─ Description: "We build payment solutions and need legal help"
   (Must be 10+ characters)

ACTION: Tap "Save Profile"
WAIT: 1-2 seconds
EXPECT: Alert "Profile saved! Welcome to Vouch."
ACTION: Tap "Continue"
```

### Step 4: Home - Directory (Find Pro Tab)
```
You're now in Startup app!

Screen shows:
├─ Header: "Find a Professional"
├─ Search box: "Filter by city..."
├─ Filter buttons: [All] [Lawyer] [CA]
└─ Professional list: (empty until professional joins)

Note: We need to create a professional first.
Leave this for now and go to next section.
```

✅ **Startup account created!**

---

## Test Flow 2: Professional User (5 minutes - Second Tab/Device)

**Start a new browser tab, or second phone with Expo Go**

### Step 1: Landing Screen
```
ACTION: Tap "Get Started"
```

### Step 2: Register Screen
```
Fill form:
├─ I AM A: Tap "Lawyer" (or "CA")
├─ Full Name: "John Smith"
├─ Email: "professional@example.com"
├─ Password: "Password123"

ACTION: Tap "Create Account"
WAIT: 2-3 seconds
EXPECT: Navigate to Onboarding
```

### Step 3: Onboarding - Professional Profile
```
Fill form:
├─ Full Name: "John Smith"
├─ City: "Mumbai"
├─ Experience Years: "5"
├─ Specializations: "Corporate Law, IP Law"
   (Comma-separated, max 5)
├─ License Number: "LAW12345"
└─ Fee Range: "₹5k-20k"

ACTION: Tap "Save Profile"
WAIT: 1-2 seconds
EXPECT: Alert "Profile saved! Next: upload verification documents."
ACTION: Tap "Continue"
```

### Step 4: Professional Tabs - Open Jobs Tab
```
You're now in Professional app - Open Jobs tab!

Screen shows:
├─ Header: "Open Jobs - Requests from startups"
├─ Empty list: "No open requests right now"
└─ (No requests yet - we create one next)

ACTION: Tap "Profile" tab (3rd tab)
```

### Step 5: Professional Profile Screen
```
Screen shows:
├─ Section 1 - User Info:
│  ├─ Name: "John Smith"
│  ├─ Email: "professional@example.com"
│  └─ Role: "LAWYER"
│
├─ Section 2 - Professional Profile:
│  ├─ Name: "John Smith"
│  ├─ Type: "LAWYER"
│  ├─ City: "Mumbai"
│  ├─ Experience: "5 years"
│  ├─ Specializations: "Corporate Law, IP Law"
│  ├─ License: "LAW12345"
│  └─ Fee Range: "₹5k-20k"
│
├─ "Upload Verification Docs" button (outline)
└─ "Sign Out" button (ghost)

ACTION: Tap "Upload Verification Docs"
```

### Step 6: Verification Upload Screen
```
Screen shows:
├─ Title: "Verification Upload"
├─ Instructions: "Upload up to 3 documents (PDF or images)..."
├─ "Pick Documents (0/3)" button
└─ Submit button (currently disabled)

ACTION: Tap "Pick Documents (0/3)"
EXPECT: File picker opens
SELECT: Pick any image or PDF from phone
RESULT: File appears in list, counter shows (1/3)

ACTION: Tap "Submit for Verification"
WAIT: 2-3 seconds (uploading)
EXPECT: Alert "Documents submitted for review"
ACTION: Tap "OK"
```

✅ **Professional account + verification docs uploaded!**

---

## Test Flow 3: Admin Approval (1 minute - Third Tab/Device)

**Open a third browser/tab or third test user**

### Step 1: Landing - Login as Admin

```
ACTION: Tap "I already have an account"
(NOT "Get Started")

Screen shows:
├─ Email field
├─ Password field
└─ "Sign In" button

Fill:
├─ Email: "admin@vouch.com"
├─ Password: "AdminPass123"

ACTION: Tap "Sign In"
WAIT: 1-2 seconds
EXPECT: Admin Dashboard loads
```

### Step 2: Admin Dashboard Screen
```
Screen shows:
├─ Title: "Pending Verifications"
├─ Card with John Smith:
│  ├─ Name: "John Smith"
│  ├─ Email: "professional@example.com"
│  ├─ "1 document(s) submitted"
│  ├─ "Approve" button (green)
│  └─ "Reject" button (red)

ACTION: Tap "Approve" button
EXPECT: Dialog "Are you sure you want to approve?"
ACTION: Tap "Approve" in dialog
WAIT: 1-2 seconds
EXPECT: John disappears from queue (now approved!)
```

✅ **Professional now verified! ✓ Verified badge will appear everywhere.**

---

## Test Flow 4: Create & Accept Request (5 minutes)

**Back to Startup Tab**

### Step 1: Directory Screen - See Professional
```
ACTION: Tap "Find Pro" tab (if not already on it)

Screen shows:
├─ Search box: "Filter by city..."
├─ Filter: [All] [Lawyer] [CA]
└─ Professional Card:
   ├─ Avatar: "J"
   ├─ Name: "John Smith"
   ├─ Type·City: "LAWYER · Mumbai"
   ├─ ✓ Verified badge (GREEN CHECK)
   ├─ "5 yrs exp"
   ├─ "₹5k-20k"
   └─ [Corporate Law] [IP Law] tags

VERIFY: ✓ Verified badge is showing!

ACTION: Tap the card
```

### Step 2: Professional Detail Screen
```
Screen shows:
├─ Avatar: "J"
├─ Name: "John Smith"
├─ LAWYER · Mumbai
├─ ✓ Verified (if approved)
├─ 5 years experience
├─ License: LAW12345
├─ Fee: ₹5k-20k
├─ Specializations:
│  [Corporate Law] [IP Law]
└─ "Create Service Request" button (blue)

ACTION: Tap "Create Service Request"
```

### Step 3: Create Request Screen
```
Screen shows category scroll:
[TRADEMARK] [PATENT] [COPYRIGHT] [TAX] [COMPLIANCE]

ACTION: Tap "COMPLIANCE"
EXPECT: Button highlights blue

Fill form:
├─ Category: "COMPLIANCE" (selected)
├─ Description: "Need help with data privacy and GDPR compliance"
│  (Must be 20+ characters)
├─ City: "Mumbai"
└─ Budget Range: "₹20k-50k"

ACTION: Tap "Submit Request"
WAIT: 1-2 seconds
EXPECT: 
  ├─ Request created with status OPEN
  ├─ Navigate back to Directory
  └─ Success message (or navigate back)
```

✅ **Request created!**

---

## Test Flow 5: Accept Request (2 minutes - Professional Tab)

**Switch to Professional Tab**

### Step 1: Open Jobs Tab
```
ACTION: Tap "Open Jobs" tab (if not already)

WAIT: 2-3 seconds (if needed, refresh)
Can refresh by clicking tab again

Screen now shows:
├─ Header: "Open Jobs"
├─ RequestCard:
│  ├─ Category: "COMPLIANCE"
│  ├─ Status: "OPEN" (orange badge)
│  ├─ Description: "Need help with data privacy..."
│  ├─ City: "Mumbai"
│  ├─ Budget: "₹20k-50k"
│  └─ "Accept Job" button (blue)

ACTION: Tap "Accept Job"
WAIT: 2-3 seconds
  ├─ POST /requests/:id/accept (backend creates Chat)
  ├─ GET /chats/by-request/:requestId (get chatId)
  └─ Socket.IO connection opens
EXPECT: ChatScreen opens automatically! 🎉
```

### Step 2: Chat Screen (Professional)
```
Screen shows:
├─ Empty or gray message list
│  (First time - no history)
├─ Bottom: Text input
│  └─ "Type a message..."
└─ "Send" button (blue)

ACTION: Type message:
"Hi! I received your request. I can help with data privacy audit."

ACTION: Tap "Send"
EXPECT:
  ├─ Message appears as BLUE bubble on RIGHT
  ├─ Input field clears
  ├─ Auto-scrolls to bottom
  └─ Socket.IO broadcasts to other user
```

✅ **Request accepted! Chat open!**

---

## Test Flow 6: View & Reply in Chat (1 minute - Startup Tab)

**Switch to Startup Tab**

### Step 1: My Requests Tab
```
ACTION: Tap "Requests" tab (middle tab)

Screen shows:
├─ Header: "My Requests"
├─ RequestCard:
│  ├─ Category: "COMPLIANCE"
│  ├─ Status: "ACCEPTED" (green badge now!)
│  ├─ Description: "Need help with data privacy..."
│  ├─ City: "Mumbai"
│  ├─ Budget: "₹20k-50k"
│  └─ "View Chat" button (NEW - only appears when ACCEPTED!)

ACTION: Tap "View Chat"
EXPECT: ChatScreen opens
```

### Step 2: Chat Screen (Startup)
```
Screen shows:
├─ Message list with:
│  ├─ GRAY bubble on LEFT (professional's message):
│  │  "Hi! I received your request. I can help..."
│  │  Sender name: "John Smith" (shown above)
│  │  Timestamp: "14:32"
│  │
│  └─ Input field: "Type a message..."
│
└─ "Send" button

ACTION: Type reply:
"Perfect! Let's schedule a call next week."

ACTION: Tap "Send"
EXPECT:
  ├─ Message appears as BLUE bubble on RIGHT
  ├─ Professional sees it INSTANTLY (real-time!)
  └─ Chat updated on both tabs
```

✅ **Real-time messaging working!**

---

## 🏆 Full Test Complete!

You have successfully tested:
- ✅ Startup registration & profile
- ✅ Professional registration & profile
- ✅ Verification document upload
- ✅ Admin verification approval
- ✅ ✓ Verified badge display
- ✅ Directory browsing
- ✅ Request creation
- ✅ Request acceptance
- ✅ Auto-chat creation
- ✅ Real-time messaging (Socket.IO)
- ✅ Status transitions (OPEN → ACCEPTED)

---

## 📱 Optional: Additional Features to Test

```
Test these on your own:

1. Try "Reject" verification in Admin Dashboard
2. Try closing request (if button available)
3. Try searching directory by city
4. Try filtering professionals by LAWYER vs CA
5. Try creating multiple requests
6. Try accepting multiple requests
7. Try logout and login again
8. Try creating new account with same email (should error)
9. Try updating profile (edit fields)
10. Try Socket.IO lag - send rapid messages
```

---

## 📊 What You're Testing

| Feature | Status | Evidence |
|---------|--------|----------|
| Multi-role system | ✅ | Can switch between Startup/Pro/Admin |
| Profile creation | ✅ | All fields saved and displayed |
| Verification workflow | ✅ | Upload → Admin approval → Badge |
| Directory search | ✅ | Professionals appear with filters |
| Request lifecycle | ✅ | Status: OPEN → ACCEPTED → CLOSED |
| Auto-chat creation | ✅ | Chat opens after accept |
| Real-time messaging | ✅ | Messages appear instantly both sides |
| Socket.IO | ✅ | < 1 second message delivery |

---

## 🎬 Tips for Testing

1. **Use different browsers for each role**
   - Chrome: Startup user
   - Firefox: Professional user
   - Safari/Incognito: Admin user

2. **Or use multiple devices**
   - Emulator: Startup
   - Phone 1: Professional
   - Phone 2: Admin

3. **Note timestamps of actions** to verify real-time updates

4. **Try poor network** to see error handling (airplane mode then back)

5. **Take screenshots** at each step for documentation

---

## ✅ You're Ready!

Choose your testing method:
- **Emulator?** → PATH A above
- **Physical phone?** → PATH B above  
- **iPhone?** → PATH C above
- **Fastest?** → PATH D (Expo Go) above

Then follow the **Test Flows** above!

Have fun testing! 🚀
