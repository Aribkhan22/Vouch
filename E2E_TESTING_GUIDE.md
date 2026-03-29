# End-to-End Testing & Manual Navigation Guide

## Quick Start - Run the Full Stack

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas connection string
- Android Studio (for Android emulator) OR Xcode (for iOS)
- React Native CLI installed

---

## Part 1: Automated E2E Testing

### Run E2E Tests Suite

```bash
cd VouchFrontend

# Run the complete end-to-end test suite
npm run test:e2e

# Or use Jest directly
npx jest __tests__/fullstack.e2e.test.ts --detectOpenHandles
```

**What it tests**:
✅ Backend spawns automatically (starts on port 5000)
✅ Startup registration → Profile creation
✅ Professional registration → Profile creation  
✅ Verification document upload
✅ Admin approval
✅ Service request creation
✅ Request acceptance with auto-chat
✅ Real-time messaging via Socket.IO
✅ Request closure

**Expected Output**:
```
PASS  __tests__/fullstack.e2e.test.ts (11.51 s)
  fullstack e2e: frontend API clients with live backend
    ✓ startup and professional can complete request and messaging flow (6783 ms)

Test Suites: 1 passed, 1 total
Tests: 1 passed, 1 total
```

**Test File Location**: `VouchFrontend/__tests__/fullstack.e2e.test.ts`

---

## Part 2: Manual Testing - Development Setup

### Step 1: Start Backend Server

```bash
cd VouchBackend

# Install dependencies (if not done)
npm install

# Start backend server
npm run dev

# Expected output:
# ✓ Server running on port 5000
# ✓ MongoDB connected
# ✓ Socket.IO configured
```

**Verify Backend Ready**:
```bash
# Test in another terminal
curl http://localhost:5000/auth/me
# Should return: {"status":"error","message":"No token provided"}
```

### Step 2: Start Frontend in Development

#### Option A: Android Emulator

```bash
cd VouchFrontend

# Start Metro bundler (keeps running in background)
npm start

# In another terminal
npm run android

# Expected:
# → Emulator launches
# → App loads on emulator
# → You're on Landing screen
```

#### Option B: iOS Simulator (Mac only)

```bash
cd VouchFrontend

npm start

# In another terminal
npm run ios
```

#### Option C: Expo Go (Easiest, Phone Required)

```bash
cd VouchFrontend

npm start

# Scan QR code with Expo Go app
# App launches instantly on your phone
```

---

## Part 3: Manual Navigation Flows

### Flow 1: Startup User Journey

```
Step 1: Landing Screen
├─ URL: src/features/auth/screens/LandingScreen.tsx
├─ Components shown:
│  ├─ "Vouch" logo + tagline
│  ├─ Feature list (3 bullets)
│  ├─ "Get Started" button (BLUE)
│  └─ "I already have an account" link
│
└─ ACTION: Tap "Get Started" button

Step 2: Register Screen
├─ URL: src/features/auth/screens/RegisterScreen.tsx
├─ Fields to fill:
│  ├─ I AM A: Select "Startup" (should highlight blue)
│  ├─ Full Name / Company Name: Enter "TechCorp Inc"
│  ├─ Email: Enter "startup@example.com"
│  └─ Password: Enter "Password123" (8+ chars, letters + numbers)
│
├─ ACTION: Tap "Create Account" button
├─ WAIT: API call to POST /auth/register
└─ Expected: Alert shows, then navigate to Onboarding

Step 3: Onboarding Screen (Startup)
├─ URL: src/features/auth/screens/OnboardingScreen.tsx
├─ Fields to fill:
│  ├─ Company Name: "TechCorp Inc"
│  ├─ Industry: "FinTech"
│  ├─ City: "Mumbai"
│  └─ Description: "We build payment solutions and need legal help with compliance"
│
├─ ACTION: Tap "Save Profile" button
├─ WAIT: API call to PUT /startup/profile
└─ Expected: Alert "Profile saved! Welcome to Vouch." → Tap Continue

Step 4: Startup Home - Directory Tab
├─ URL: Startup Bottom Tab (Find Pro)
├─ Components shown:
│  ├─ Header: "Find a Professional"
│  ├─ Search box: "Filter by city..."
│  ├─ Type filter: [All] [Lawyer] [CA] buttons
│  └─ Professional cards list (empty until professionals exist)
│
├─ Note: You need a professional to exist first
└─ For now: Go to "My Requests" tab or Profile tab

Step 5: My Requests Tab
├─ Components shown:
│  ├─ Header: "My Requests"
│  ├─ Empty state: "No requests yet. Create one to get started!"
│
├─ ACTION: Go back or log out
└─ Expected: Return to Landing or logout state

CHECKPOINT: Startup account created ✅
```

### Flow 2: Professional User Journey (Parallel)

**Open a second browser tab or device, then:**

```
Step 1: Landing Screen
├─ ACTION: Tap "Get Started"

Step 2: Register Screen
├─ I AM A: Select "Lawyer" (or "CA")
├─ Full Name: "Riya Sharma"
├─ Email: "lawyer@example.com"
├─ Password: "Password123"
├─ ACTION: Tap "Create Account"

Step 3: Onboarding Screen (Professional)
├─ Fields:
│  ├─ Full Name: "Riya Sharma"
│  ├─ City: "Mumbai"
│  ├─ Experience Years: "5"
│  ├─ Specializations: "Corporate Law, IP Law" (comma-separated)
│  ├─ License Number: "LAW12345"
│  └─ Fee Range: "₹5k–₹20k"
│
├─ ACTION: Tap "Save Profile"
└─ Expected: Navigate to Professional Home

Step 4: Professional Tabs
├─ You're on: "Open Jobs" tab (first tab)
├─ Components:
│  ├─ Header: "Open Jobs - Requests from startups"
│  └─ Empty list: "No open requests right now"
│
├─ NOTE: No requests exist yet, so empty
└─ ACTION: Tap "Profile" tab (3rd)

Step 5: Professional Profile Screen
├─ Components:
│  ├─ User Info section:
│  │  ├─ Name: "Riya Sharma"
│  │  ├─ Email: "lawyer@example.com"
│  │  └─ Role: "LAWYER"
│  │
│  ├─ Professional Profile section:
│  │  ├─ Name: "Riya Sharma"
│  │  ├─ Type: "LAWYER"
│  │  ├─ City: "Mumbai"
│  │  ├─ Experience: "5 years"
│  │  ├─ Specializations: "Corporate Law, IP Law"
│  │  ├─ License Number: "LAW12345"
│  │  └─ Fee Range: "₹5k–₹20k"
│  │
│  └─ "Upload Verification Docs" button (orange/outline)
│
├─ ACTION: Tap "Upload Verification Docs"
└─ Navigate to VerificationUploadScreen

Step 6: Verification Upload Screen
├─ URL: src/features/professional/screens/VerificationUploadScreen.tsx
├─ Components:
│  ├─ Title: "Verification Upload"
│  ├─ Instruction: "Upload up to 3 documents (PDF or images)..."
│  ├─ "Pick Documents (0/3)" button
│  └─ Submit button (disabled until file selected)
│
├─ ACTION: Tap "Pick Documents (0/3)"
├─ Expected: Document picker opens
├─ SELECT: Any PDF or image from phone
├─ RESULT: File name appears in list, counter shows (1/3)
├─ ACTION: Tap "Submit for Verification"
├─ WAIT: Upload to backend (Cloudinary)
├─ Expected: Alert "Your documents submitted for review" → Tap OK
└─ Back to Profile Screen

CHECKPOINT: Professional account + verification docs uploaded ✅
```

### Flow 3: Both Users Creating & Accepting Request

**Switch back to Startup Tab:**

```
Step 1: Directory Screen (Startup)
├─ Components:
│  ├─ Search box (empty)
│  └─ Type filter: [All] [Lawyer] [CA]
│
├─ WAIT: Professionals list should now show Riya Sharma's card
├─ Card shows:
│  ├─ Avatar: "R"
│  ├─ Name: "Riya Sharma"
│  ├─ Type·City: "LAWYER · Mumbai"
│  ├─ ✓ Verified badge (NOT SHOWN YET - pending admin approval)
│  ├─ "5 yrs exp"
│  ├─ "₹5k–₹20k"
│  └─ Specializations: [Corporate Law] [IP Law]
│
├─ ACTION: Tap the card
└─ Navigate to ProfessionalDetailScreen

Step 2: Professional Detail Screen
├─ Shows full profile:
│  ├─ Name: "Riya Sharma"
│  ├─ LAWYER · Mumbai
│  ├─ 5 years experience
│  ├─ License: LAW12345
│  ├─ Fee: ₹5k–₹20k
│  └─ Specializations: "Corporate Law, IP Law"
│
├─ Bottom: "Create Service Request" button (BLUE)
├─ ACTION: Tap "Create Service Request"
└─ Navigate to CreateRequestScreen

Step 3: Create Request Screen
├─ Category selector (horizontal scroll):
│  ├─ [TRADEMARK] [PATENT] [COPYRIGHT] [TAX] [COMPLIANCE]
│  └─ Select: "COMPLIANCE"
│
├─ Form fields:
│  ├─ Category: "COMPLIANCE" (selected)
│  ├─ Description: "We need help with data privacy compliance and GDPR regulations"
│  ├─ City: "Mumbai"
│  └─ Budget Range: "₹20k–₹50k"
│
├─ ACTION: Tap "Submit Request"
├─ WAIT: POST /requests API call
└─ Expected: Navigate back to Directory or alert "Request created!"

CHECKPOINT: Service request created (status: OPEN) ✅
```

**Switch to Professional Tab:**

```
Step 1: Open Jobs Tab (Professional)
├─ WAIT: Page refreshes (or refresh manually)
├─ Components:
│  ├─ Header: "Open Jobs - Requests from startups"
│  └─ RequestCard appears:
│     ├─ Category label: "COMPLIANCE"
│     ├─ Status badge: "OPEN" (orange)
│     ├─ Description: "We need help with data privacy..."
│     ├─ City: "Mumbai"
│     ├─ Budget: "₹20k–₹50k"
│     └─ "Accept Job" button (BLUE)
│
├─ ACTION: Tap "Accept Job" button
├─ WAIT: Multiple API calls:
│  ├─ POST /requests/:id/accept
│  ├─ GET /chats/by-request/:requestId (backend auto-created chat)
│  └─ Refetch open requests
│
├─ Expected: Navigate immediately to ChatScreen
└─ CHECKPOINT: Request accepted, chat created ✅

Step 2: Chat Screen
├─ Components:
│  ├─ Header: (varies by framework setup)
│  ├─ Message list: (empty - first message)
│  │  ├─ Bubble styling: Own (right, blue), Other (left, gray)
│  │  ├─ Sender name: Shows on received messages
│  │  └─ Timestamp: HH:MM format
│  │
│  ├─ Input row (bottom):
│  │  ├─ TextInput: "Type a message..."
│  │  └─ "Send" button
│  │
│  └─ WAIT: Socket.IO connects (should be instant)
│
├─ ACTION: Type message
│  └─ "Hi Riya, thanks for accepting! Can you start with data privacy audit?"
│
├─ ACTION: Tap "Send"
├─ EXPECTED: 
│  ├─ Message appears as blue bubble on right (own message)
│  ├─ Socket.IO emits message:send
│  ├─ Input clears
│  └─ Auto-scroll to bottom
│
└─ Waiting for other user to respond...
```

**Switch back to Startup Tab (or other device):**

```
Step 1: My Requests Tab (Startup)
├─ Components:
│  ├─ MyRequestsScreen
│  ├─ Request card shows:
│  │  ├─ Category: "COMPLIANCE"
│  │  ├─ Status badge: "ACCEPTED" (green)
│  │  ├─ Description: "We need help..."
│  │  ├─ City: "Mumbai"
│  │  ├─ Budget: "₹20k–₹50k"
│  │  └─ "View Chat" button (appears only when ACCEPTED)
│  │
│  ├─ ACTION: Tap "View Chat" button
│  └─ Navigate to ChatScreen

Step 2: Chat Screen
├─ Same as professional - now shows professional's message:
│  └─ Gray bubble (left): "Hi, thanks for reaching out! I can help with that..."
│
├─ ACTION: Type response
│  └─ "Perfect! Looking forward to working with you."
│
├─ ACTION: Tap "Send"
└─ Both users now see real-time conversation
```

### Flow 4: Admin Verification Approval

**Open a third browser tab for Admin:**

```
Step 1: Landing & Login
├─ ACTION: Tap "I already have an account"
├─ Email: "admin@vouch.com" (pre-seeded)
├─ Password: "AdminPass123"
├─ ACTION: Tap "Sign In"
└─ Expected: AdminDashboardScreen loads

Step 2: Admin Dashboard
├─ Components:
│  ├─ Title: "Pending Verifications"
│  ├─ Queue shows Riya's verification:
│  │  ├─ Name: "Riya Sharma"
│  │  ├─ Email: "lawyer@example.com"
│  │  ├─ "1 document(s) submitted"
│  │  ├─ "Approve" button (green)
│  │  └─ "Reject" button (red)
│  │
│  ├─ ACTION: Tap "Approve"
│  ├─ Expected: Confirmation dialog "Are you sure?"
│  ├─ ACTION: Tap "Approve" in dialog
│  ├─ WAIT: POST /admin/verifications/:id/approve
│  └─ RESULT: 
│     ├─ Riya's isVerified = true
│     ├─ Dashboard refetches
│     ├─ Riya disappears from queue (now approved)
│     └─ ✓ Verified badge now shows everywhere for Riya

CHECKPOINT: Admin approval complete ✅
```

---

## Part 4: Testing Checklist

### ✅ All Screens Navigation

- [ ] **Auth Stack**
  - [ ] Landing - view all features
  - [ ] Register - all 3 roles (STARTUP, LAWYER, CA)
  - [ ] Login - existing user
  - [ ] Onboarding - both role types

- [ ] **Startup App**
  - [ ] Directory - search by city, filter by type
  - [ ] Professional Detail - all profile fields, "Create Request" CTA
  - [ ] Create Request - all categories, form fields
  - [ ] My Requests - status badges, "View Chat"
  - [ ] Profile - display startup info, logout

- [ ] **Professional App**
  - [ ] Open Jobs - browse, "Accept Job" button works
  - [ ] My Accepted - see accepted requests only
  - [ ] Profile - all fields, "Upload Verification Docs"
  - [ ] Verification Upload - pick files, submit
  - [ ] Chat - real-time messaging

- [ ] **Admin App**
  - [ ] Dashboard - list pending verifications
  - [ ] Approve - sets verified badge
  - [ ] Reject - removes from queue

### ✅ All Data Flows

- [ ] Create Startup: register → fill profile → saved
- [ ] Create Professional: register → fill profile → upload docs → pending → approved
- [ ] Create Request: browse directory → view pro → create request → status=OPEN
- [ ] Accept Request: browse open → accept → chat auto-created → navigate
- [ ] Chat: load history → send message → receive real-time → both users see
- [ ] Close Request: startup can close, status→CLOSED

### ✅ All Validations

- [ ] Register: email format, password strength
- [ ] Profiles: required fields, max specializations (5)
- [ ] Verification: at least 1 doc, max 3
- [ ] Request: category enum, description min chars, budget format
- [ ] Chat: empty messages rejected, scroll to latest

---

## Part 5: Troubleshooting

### Backend Won't Start
```bash
# Check MongoDB connection string
echo $MONGODB_URI
# Should output valid Atlas URI

# Check port 5000 not in use
lsof -i :5000
# If in use: kill -9 <PID>

# Restart
npm run dev
```

### Frontend Won't Load
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear node_modules if needed
rm -rf node_modules
npm install
npm start
```

### Socket.IO Not Connecting
```bash
# Check backend Socket.IO server running
# Look for: "Socket.IO configured"

# Check frontend API_BASE_URL
# VouchFrontend/src/utils/constants.ts
// Should be: http://127.0.0.1:5000 (or 10.0.2.2:5000 for emulator)

# Socket server: http://127.0.0.1:5000 (same)
```

### File Upload Fails
```bash
# Check Cloudinary credentials in backend env
echo $CLOUDINARY_NAME
echo $CLOUDINARY_API_KEY
echo $CLOUDINARY_API_SECRET

# Check file size < 5MB
# Supported: PDF, JPG, PNG only
```

---

## Part 6: Commands Reference

```bash
# BACKEND
cd VouchBackend
npm install                    # Setup dependencies
npm run dev                    # Start dev server
npm run seed:admin            # Seed admin user (if needed)
npm run build                 # Build for production

# FRONTEND
cd VouchFrontend
npm install                    # Setup dependencies
npm start                      # Start Metro bundler
npm run android               # Run on Android emulator
npm run ios                   # Run on iOS simulator
npm run test                  # Run unit tests
npm run test:e2e              # Run E2E test suite
npm run test:watch            # Watch mode testing

# TESTING
npm run test:e2e              # Full stack test (11.5 seconds)
npm run test                  # Jest unit tests
npm run lint                  # Check code style
```

---

## Part 7: Demo Video Script

**If recording walkthrough video:**

```
Duration: ~5 minutes

[0:00-0:30] Startup Registration
  → Select "Startup" role
  → Fill profile fields
  → Save profile

[0:30-1:00] Professional Registration
  → Select "Lawyer"
  → Fill all fields including specializations
  → Save profile

[1:00-1:30] Verification Upload
  → Upload verification docs
  → Submit for review

[1:30-2:00] Admin Approval
  → Login as admin
  → Approve professional
  → Show verified badge appears

[2:00-3:00] Create & Accept Request
  → Startup: Browse directory, find pro, create request
  → Professional: Browse open jobs, accept request
  → Chat auto-creates

[3:00-4:00] Real-Time Chat
  → Both users send messages
  → Show real-time updates
  → Show Socket.IO working

[4:00-5:00] Dashboard Views
  → Startup: My Requests with status
  → Professional: My Accepted Jobs
  → Admin: Verification queue

[5:00+] Recap & Summary
```

---

## Summary

| Task | Command | Time |
|------|---------|------|
| Run E2E tests | `npm run test:e2e` | ~12 sec |
| Manual: Startup → Request | Navigation in app | ~5 min |
| Manual: Professional → Accept | Navigation in app | ~5 min |
| Manual: Chat → Messages | Real-time in app | ~2 min |
| Manual: Admin → Approve | Admin tab | ~2 min |
| **Full Manual Flow** | **All together** | **~15 min** |

