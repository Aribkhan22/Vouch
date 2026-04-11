# Vouch — Complete Project Documentation

> **For College Submission | Examiner Reference Guide**
> Full technical explanation of the Vouch platform: architecture, backend API, frontend screens, data flow, and run commands.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design — MongoDB Models](#4-database-design--mongodb-models)
5. [Backend — API Reference](#5-backend--api-reference)
   - 5.1 [All Endpoints at a Glance](#51-all-endpoints-at-a-glance)
   - 5.2 [Auth Endpoints — Technical Deep Dive](#52-auth-endpoints--technical-deep-dive)
   - 5.3 [Professional Profile Endpoints](#53-professional-profile-endpoints)
   - 5.4 [Startup Profile Endpoints](#54-startup-profile-endpoints)
   - 5.5 [Service Request Endpoints](#55-service-request-endpoints)
   - 5.6 [Chat & Messaging Endpoints](#56-chat--messaging-endpoints)
   - 5.7 [Admin — Verification Endpoints](#57-admin--verification-endpoints)
   - 5.8 [Verification Submission Endpoint](#58-verification-submission-endpoint)
6. [Backend — Core Components](#6-backend--core-components)
   - 6.1 [Middleware Pipeline](#61-middleware-pipeline)
   - 6.2 [JWT Authentication](#62-jwt-authentication)
   - 6.3 [Real-Time Chat — Socket.IO](#63-real-time-chat--socketio)
   - 6.4 [File Upload — Cloudinary](#64-file-upload--cloudinary)
   - 6.5 [Error Handling Strategy](#65-error-handling-strategy)
7. [Frontend — App Structure & Navigation](#7-frontend--app-structure--navigation)
8. [Frontend — Screens Deep Dive](#8-frontend--screens-deep-dive)
   - 8.1 [Auth Flow Screens](#81-auth-flow-screens)
   - 8.2 [Startup Screens](#82-startup-screens)
   - 8.3 [Professional Screens](#83-professional-screens)
   - 8.4 [Admin Screens](#84-admin-screens)
   - 8.5 [Shared — Chat Screen](#85-shared--chat-screen)
9. [Frontend — State Management](#9-frontend--state-management)
10. [Frontend — API Layer & Token Lifecycle](#10-frontend--api-layer--token-lifecycle)
11. [Complete User Flows](#11-complete-user-flows)
12. [Commands to Run the Project](#12-commands-to-run-the-project)

---

## 1. Project Overview

**Vouch** is a mobile application that connects **startups** with **verified Lawyers and Chartered Accountants (CAs)**. Instead of cold-calling or using unverified directories, a startup can browse a vetted directory, raise a service request, and communicate directly with the professional — all inside the app.

### The Three User Roles

| Role | What they do |
|------|-------------|
| **STARTUP** | Browse the professional directory, create service requests (legal / CA help), chat with an accepted professional |
| **LAWYER / CA** | View open job requests, accept or reject them with a reason, chat with the startup, upload verification documents |
| **ADMIN** | Review professional verification document submissions, approve or reject with a note |

### Core Problem Being Solved

- Startups struggle to find trustworthy lawyers/CAs → Vouch verifies them via document review
- Professionals waste time on bad-fit clients → Service requests carry budget, city, and category info
- Communication is scattered across WhatsApp/email → Vouch provides an in-app real-time chat tied to the work request

---

## 2. Technology Stack

### Backend (`VouchBackend/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime |
| **TypeScript** | 5.x | Static typing across the codebase |
| **Express.js** | 4.19 | HTTP framework, routing, middleware |
| **MongoDB** | 7.x (Atlas or local) | Primary database (NoSQL document store) |
| **Mongoose** | 8.5 | MongoDB ODM — schemas, models, queries |
| **Socket.IO** | 4.7 | WebSocket layer for real-time chat |
| **JSON Web Tokens (JWT)** | 9.0 | Stateless authentication (access + refresh tokens) |
| **bcryptjs** | 2.4 | Password hashing (bcrypt, 12 rounds) |
| **Zod** | 3.23 | Runtime schema validation of request bodies |
| **Cloudinary** | 2.5 | Cloud storage for verification documents |
| **Multer** | 1.4 | Multipart form handling (file upload) |
| **Helmet** | 7.1 | HTTP security headers |
| **express-rate-limit** | 7.3 | Auth endpoint rate limiting |
| **Winston** | 3.14 | Structured logging |
| **Morgan** | 1.10 | HTTP request logging |
| **ts-node-dev** | — | Hot-reload TypeScript dev server |

### Frontend (`VouchFrontend/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Native** | 0.84.1 | Cross-platform mobile framework |
| **TypeScript** | 5.x | Full type-safety across components |
| **React Navigation** | 7.x | Stack + bottom-tab navigation |
| **Redux Toolkit** | 2.11 | Global auth state (user, tokens) |
| **TanStack Query (React Query)** | 5.95 | Server-state caching, loading, refetching |
| **Axios** | 1.14 | HTTP client with request/response interceptors |
| **Socket.IO Client** | 4.8 | Real-time chat WebSocket connection |
| **React Hook Form** | 7.72 | Form state management |
| **Zod** | 4.3 | Frontend-side form schema validation |
| **react-native-keychain** | 10.0 | Secure token storage (iOS Keychain / Android Keystore) |
| **@react-native-documents/picker** | 12.0 | Document/file picker for verification upload |
| **react-native-image-picker** | 8.2 | Image selection |
| **react-native-safe-area-context** | 5.7 | Handle notch/status-bar-safe layout |

### Build & Infrastructure

| Tool | Purpose |
|------|---------|
| **Gradle 8.13** | Android build system |
| **JDK 17** | Required by Android compile SDK 36 |
| **Android SDK 36** | compileSdkVersion (targets Android 14+) |
| **Metro** | React Native JavaScript bundler |
| **Docker** | Backend containerisation |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native)           │
│                                                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Redux   │  │  TanStack │  │  Socket.IO Client │  │
│  │  (auth)  │  │   Query   │  │   (real-time)     │  │
│  └──────────┘  └───────────┘  └──────────────────┘  │
│         │            │                │              │
│         └────────────┴────────────────┘              │
│                      │                               │
│              Axios HTTP Client                       │
│              (auto-refresh interceptor)              │
└──────────────────────┬──────────────────────────────┘
                       │  HTTP REST  /  WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│           BACKEND  (Express + TypeScript)            │
│                                                      │
│  Helmet → CORS → Rate Limit → JWT Auth → Routes      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │  Auth    │ │ Request  │ │   Chat   │ │ Admin  │  │
│  │ Service  │ │ Service  │ │ Service  │ │Service │  │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘  │
│         │            │                │              │
│         └────────────┴────────────────┘              │
│                      │                               │
│               Mongoose ODM                           │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐      ┌──────────────┐
              │   MongoDB      │      │  Cloudinary  │
              │  (6 collections)│      │ (doc files)  │
              └────────────────┘      └──────────────┘
```

**Request path for a protected route:**
1. Mobile sends `GET /api/v1/requests/open` with `Authorization: Bearer <token>`
2. `authenticate` middleware verifies JWT; attaches `req.user = { userId, role }`
3. `authorize('LAWYER', 'CA')` checks role — rejects STARTUP with 403
4. Controller calls `requestService.getOpenRequests()` which queries MongoDB and enriches with startup info
5. `sendSuccess(res, data)` wraps result in `{ success: true, data }` and responds

---

## 4. Database Design — MongoDB Models

### 4.1 `User` Collection

Every person who registers gets a `User` document regardless of role.

```
User {
  _id:          ObjectId  (auto)
  role:         'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN'
  name:         String  (trimmed)
  email:        String  (unique, lowercase)
  passwordHash: String  (bcrypt, 12 rounds)
  status:       'ACTIVE' | 'SUSPENDED'
  createdAt:    Date
}
```

### 4.2 `ProfessionalProfile` Collection

A Lawyer or CA fills this in during onboarding. One-to-one with `User`.

```
ProfessionalProfile {
  _id:             ObjectId
  userId:          ObjectId → User (unique)
  fullName:        String
  professionType:  'LAWYER' | 'CA'
  city:            String
  experienceYears: Number (0–60)
  specializations: [String] (max 5)
  licenseNumber:   String
  feeRange:        String?   e.g., "3k–6k"
  isVerified:      Boolean   (default false; set true by admin)
  createdAt:       Date
}
Index: { city, professionType, isVerified } — for directory filtering
```

### 4.3 `StartupProfile` Collection

A Startup fills this in during onboarding. One-to-one with `User`.

```
StartupProfile {
  _id:         ObjectId
  userId:      ObjectId → User (unique)
  companyName: String
  industry:    String
  city:        String
  description: String
  createdAt:   Date
}
```

### 4.4 `ServiceRequest` Collection

A Startup raises a request. A professional then accepts or rejects it.

```
ServiceRequest {
  _id:                        ObjectId
  createdByStartupUserId:     ObjectId → User
  category:                   Enum (CONTRACT_REVIEW | COMPANY_INCORPORATION | TRADEMARK
                                    | TAX_FILING | COMPLIANCE | LITIGATION
                                    | IP_PROTECTION | DUE_DILIGENCE | OTHER)
  description:                String
  city:                       String
  budgetRange:                String  e.g., "₹5k–10k"
  status:                     'OPEN' | 'ACCEPTED' | 'CLOSED' | 'REJECTED'
  assignedProfessionalUserId: ObjectId → User?
  rejectionReason:            String?
  createdAt:                  Date
  acceptedAt:                 Date?
  closedAt:                   Date?
  rejectedAt:                 Date?
}
Index: { status, city } — for open request filtering
```

**Business rules enforced at service layer:**
- A startup can only have ONE active (OPEN or ACCEPTED) request at a time
- Only LAWYER/CA can accept/reject; only STARTUP can close
- Category routing: LAWYER categories vs CA categories — each professional only sees relevant jobs

### 4.5 `Chat` Collection

Created automatically when a professional accepts a request.

```
Chat {
  _id:                  ObjectId
  requestId:            ObjectId → ServiceRequest (unique)
  startupUserId:        ObjectId → User
  professionalUserId:   ObjectId → User
  createdAt:            Date
}
```

### 4.6 `Message` Collection

Individual messages within a chat.

```
Message {
  _id:       ObjectId
  chatId:    ObjectId → Chat
  senderId:  ObjectId → User
  text:      String (max 2000 chars)
  createdAt: Date
}
Index: { chatId, createdAt } — for paginated message fetch in order
```

### 4.7 `VerificationRequest` Collection

A professional uploads documents; admin reviews them.

```
VerificationRequest {
  _id:                  ObjectId
  professionalUserId:   ObjectId → User
  docUrls:              [String]  (1–3 Cloudinary URLs)
  status:               'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote:            String?
  reviewedBy:           ObjectId → User?
  submittedAt:          Date
  reviewedAt:           Date?
}
```

---

## 5. Backend — API Reference

### 5.1 All Endpoints at a Glance

```
BASE URL: http://localhost:5000/api/v1

AUTH ──────────────────────────────────────────────────────
POST   /auth/register                    Public
POST   /auth/login                       Public
POST   /auth/refresh                     Public
GET    /auth/me                          Authenticated

PROFESSIONAL PROFILE ─────────────────────────────────────
PUT    /professional/profile             LAWYER | CA
GET    /professional/profile/:userId     Authenticated
GET    /professionals                    Authenticated  (directory)

STARTUP PROFILE ──────────────────────────────────────────
PUT    /startup/profile                  STARTUP
GET    /startup/profile/:userId          Authenticated

SERVICE REQUESTS ─────────────────────────────────────────
POST   /requests                         STARTUP
GET    /requests/mine                    Authenticated
GET    /requests/open                    LAWYER | CA
POST   /requests/:id/accept              LAWYER | CA
POST   /requests/:id/reject              LAWYER | CA
POST   /requests/:id/close               STARTUP
GET    /requests/startup/:userId/profile LAWYER | CA

CHAT ─────────────────────────────────────────────────────
GET    /chats/by-request/:requestId      Authenticated
GET    /chats/:chatId                    Authenticated

MESSAGES ─────────────────────────────────────────────────
GET    /messages/:chatId                 Authenticated
POST   /messages/:chatId                 Authenticated

VERIFICATION SUBMISSION ──────────────────────────────────
POST   /professional/verification/submit LAWYER | CA  (multipart)

ADMIN ────────────────────────────────────────────────────
GET    /admin/verifications              ADMIN
POST   /admin/verifications/:id/approve  ADMIN
POST   /admin/verifications/:id/reject   ADMIN

HEALTH ───────────────────────────────────────────────────
GET    /health                           Public
```

---

### 5.2 Auth Endpoints — Technical Deep Dive

#### `POST /auth/register`

**Purpose:** Register a new user (STARTUP, LAWYER, or CA). ADMIN accounts are seeded via script.

**Rate-limited:** 10 requests/minute per IP.

**Request body (validated by Zod `registerSchema`):**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@startup.com",
  "password": "Pass1234",
  "role": "STARTUP"
}
```

**How it works (code path):**
1. `authRateLimiter` middleware checks the IP
2. `validate(registerSchema)` middleware runs Zod validation — rejects immediately if email format is wrong or password is weak
3. `authController.register` calls `authService.registerUser()`
4. Service checks `User.findOne({ email })` — throws 409 if email taken
5. `bcrypt.hash(password, 12)` — 12 rounds makes brute-force expensive
6. Creates `User` document, generates access token (15 min) + refresh token (7 days)
7. Returns both tokens + user object

**Response:**
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "name": "Rahul Sharma", "email": "rahul@startup.com", "role": "STARTUP" }
  }
}
```

> **Note:** After registration the mobile app navigates to the **Onboarding screen** where the user fills in their profile (company details for STARTUP, or professional details for LAWYER/CA). The `setAuth` Redux action is only dispatched *after* onboarding completes — this ensures the user has a profile before entering the main app.

---

#### `POST /auth/login`

**Request body:**
```json
{ "email": "rahul@startup.com", "password": "Pass1234" }
```

**How it works:**
1. Finds user by email
2. Checks `user.status !== 'SUSPENDED'` — suspended accounts get 403
3. `bcrypt.compare(password, user.passwordHash)` — timing-safe comparison
4. Issues new access + refresh tokens

---

#### `POST /auth/refresh`

**Purpose:** Get a new access token using a valid refresh token (without logging in again).

**Request body:**
```json
{ "refreshToken": "eyJ..." }
```

**How it works:**
- Verifies the refresh token signature using `JWT_REFRESH_SECRET`
- Checks the user still exists and is not suspended
- Issues a brand-new access + refresh token pair (token rotation)

**Frontend integration:** The Axios client intercepts any `401` response, calls this endpoint automatically, updates stored tokens in Keychain, and replays the failed request. The user never sees a login screen unless the refresh token itself expires (7 days of inactivity).

---

#### `GET /auth/me`

Returns the currently authenticated user's document (without `passwordHash`). Used on app start to validate a stored token and restore session.

---

### 5.3 Professional Profile Endpoints

#### `PUT /professional/profile`

**Auth:** LAWYER or CA only

**Purpose:** Create or update the professional's profile. Uses `findOneAndUpdate` with `upsert: true` so the same endpoint handles first-time creation and subsequent edits.

**Request body (validated by `professionalProfileSchema`):**
```json
{
  "fullName": "Advocate Sham",
  "professionType": "CA",
  "city": "Kolkata",
  "experienceYears": 3,
  "specializations": ["ANALYSIS", "TAX_FILING"],
  "licenseNumber": "KL/123/456",
  "feeRange": "6k"
}
```

**Specializations** are capped at 5 by the Mongoose validator.

---

#### `GET /professional/profile/:userId`

**Auth:** Any authenticated user

Returns a single professional's full profile — name, type, city, experience, specializations, license, fee, isVerified status.

**Used by:** `ProfessionalDetailScreen` on the Startup side when tapping a directory card.

---

#### `GET /professionals`

**Auth:** Any authenticated user

**Purpose:** Directory listing with optional filters.

**Query params:**
```
?city=Kolkata&type=LAWYER&verified=true&page=1&limit=20
```

**How it works:**
- Builds a MongoDB query from the optional filters
- If `type` is provided it is added to the `$match` stage
- Returns paginated results `{ results: [...], total: N }`

---

### 5.4 Startup Profile Endpoints

#### `PUT /startup/profile`

**Auth:** STARTUP only

**Request body:**
```json
{
  "companyName": "TechVenture Pvt Ltd",
  "industry": "FinTech",
  "city": "Bangalore",
  "description": "B2B payment infrastructure startup"
}
```

Upserts using `StartupProfile.findOneAndUpdate({ userId }, data, { upsert: true })`.

---

#### `GET /startup/profile/:userId`

Returns a startup's profile. Currently used by the admin / future reporting features.

---

### 5.5 Service Request Endpoints

This is the core business flow.

#### `POST /requests` — Create a Service Request

**Auth:** STARTUP only

**Validation (`createRequestSchema`):**
```json
{
  "category": "TRADEMARK",
  "description": "Need trademark registration for our brand name...",
  "city": "Bangalore",
  "budgetRange": "₹5k–10k"
}
```

**Key business logic in `requestService.createRequest()`:**
```typescript
// Block if startup already has an active request
const active = await ServiceRequest.findOne({
  createdByStartupUserId: startupUserId,
  status: { $in: ['OPEN', 'ACCEPTED'] },
});
if (active) {
  throw Object.assign(
    new Error('You already have an active request...'),
    { statusCode: 409 },
  );
}
```

This prevents a startup from flooding the platform with multiple simultaneous requests.

---

#### `GET /requests/mine` — My Requests

**Auth:** Any authenticated user

**Returns different data depending on role:**

- **STARTUP:** All their own requests. For `ACCEPTED` requests, enriches with `assignedProfessional: { fullName, professionType, city, feeRange }`.
- **LAWYER/CA:** Their accepted/closed jobs. Each request is enriched with `startupCompanyName` and `startupPersonName` pulled from `StartupProfile` and `User` collections using parallel `Promise.all()` lookups.

---

#### `GET /requests/open` — Open Job Board

**Auth:** LAWYER or CA only

**Query params:** `?city=Bangalore`

**Key logic — Category routing:**
```typescript
if (role === 'LAWYER') query.category = { $in: LAWYER_CATEGORIES };
else if (role === 'CA')  query.category = { $in: CA_CATEGORIES };
```

A CA sees only `COMPANY_INCORPORATION`, `TAX_FILING`, `COMPLIANCE`, and `OTHER`. A Lawyer sees `CONTRACT_REVIEW`, `TRADEMARK`, `LITIGATION`, `IP_PROTECTION`, `DUE_DILIGENCE`, `OTHER`. This prevents a CA from accidentally accepting a litigation case.

Response also enriches each result with `startupCompanyName` and `startupPersonName`.

---

#### `POST /requests/:id/accept`

**Auth:** LAWYER or CA only

**What happens:**
1. Finds the request, checks status is `OPEN`
2. Sets `status = 'ACCEPTED'`, `assignedProfessionalUserId = req.user.userId`, `acceptedAt = now`
3. Creates a `Chat` document linking the startup and professional to this request
4. Returns the updated request

The Chat is created here automatically — the moment of accept is the moment the chat channel opens.

---

#### `POST /requests/:id/reject`

**Auth:** LAWYER or CA only

**Request body:**
```json
{ "reason": "Outside my area of specialization" }
```

**What happens:**
1. Validates reason is not empty
2. Sets `status = 'REJECTED'`, `rejectionReason`, `rejectedAt = now`
3. The startup can now see the rejection reason in `MyRequestsScreen`
4. Status returns to a terminal state — a new request can now be created

---

#### `POST /requests/:id/close`

**Auth:** STARTUP only

Marks the request as `CLOSED`. Only valid when status is `ACCEPTED`. Sets `closedAt = now`.

---

#### `GET /requests/startup/:userId/profile`

**Auth:** LAWYER or CA only

**Purpose:** When a professional taps an open job card and navigates to `StartupDetailScreen`, the screen needs to show the startup's company name, industry, city, description, and the person's name/email. This endpoint fetches all of that.

**Response:**
```json
{
  "companyName": "TechVenture Pvt Ltd",
  "industry": "FinTech",
  "city": "Bangalore",
  "description": "...",
  "personName": "Rahul Sharma",
  "email": "rahul@startup.com"
}
```

---

### 5.6 Chat & Messaging Endpoints

#### `GET /chats/by-request/:requestId`

**Auth:** Authenticated participant only

Looks up the Chat document by `requestId`. The `assertParticipant` guard in the service checks that the caller is either the `startupUserId` or `professionalUserId`, otherwise throws 403.

Used by the mobile app immediately after a request is accepted to get the `chatId`.

---

#### `GET /chats/:chatId`

**Auth:** Authenticated participant only

Returns an **enriched** chat object:
```json
{
  "_id": "...",
  "requestId": "...",
  "startupUserId": "...",
  "professionalUserId": "...",
  "startupName": "TechVenture Pvt Ltd",
  "startupPersonName": "Rahul Sharma",
  "professionalName": "Advocate Sham",
  "professionalType": "CA"
}
```

This one endpoint gives the `ChatScreen` everything it needs to render participant names and the header title without multiple separate API calls.

---

#### `GET /messages/:chatId?page=1&limit=50`

Returns paginated message history sorted by `createdAt` ascending (oldest first, newest at bottom — like WhatsApp).

---

#### `POST /messages/:chatId`

**Request body:** `{ "text": "Hello, I can help with your trademark." }`

HTTP-based alternative to Socket.IO for sending messages. Both result in a `Message` document being saved.

---

### 5.7 Admin — Verification Endpoints

All admin endpoints require `authenticate` + `authorize('ADMIN')`.

#### `GET /admin/verifications?status=PENDING`

Lists verification requests. Populates `professionalUserId` with `name` and `email` from the `User` collection so documents like `{ professionalUserId: { name: "Sham", email: "..." }, docUrls: [...] }` are returned.

---

#### `POST /admin/verifications/:id/approve`

What happens in `verificationService.approveVerification()`:
1. Checks status is `PENDING`
2. Sets status to `APPROVED`, records `reviewedBy`, `reviewedAt`
3. **Crucially:** Runs `ProfessionalProfile.findOneAndUpdate({ userId }, { isVerified: true })` — this is what enables the green ✓ verified badge on the directory card

---

#### `POST /admin/verifications/:id/reject`

**Request body:** `{ "note": "Documents are blurred and unreadable" }`

Sets status to `REJECTED` and stores `adminNote`. The professional can see this and resubmit.

---

### 5.8 Verification Submission Endpoint

#### `POST /professional/verification/submit`

**Auth:** LAWYER or CA only  
**Content-Type:** `multipart/form-data`

**How it works:**
1. `uploadDocs` middleware (Multer + Cloudinary): receives up to 3 files under field name `docs`
2. Cloudinary uploads each file, returns secure URLs
3. `verificationService.submitVerification()` checks no PENDING request exists already (409 if it does)
4. Creates `VerificationRequest` document with the Cloudinary URLs

---

## 6. Backend — Core Components

### 6.1 Middleware Pipeline

Every incoming request passes through this chain in order:

```
Request
  │
  ├─ helmet()           ← Sets X-Frame-Options, X-XSS-Protection, etc.
  ├─ cors()             ← Checks origin against ALLOWED_ORIGINS env var
  ├─ compression()      ← Gzip compress responses > 1kb
  ├─ morgan()           ← Logs "GET /api/v1/requests/open 200 45ms"
  ├─ express.json()     ← Parses JSON body (1MB limit)
  │
  ├─ [route specific middleware]
  │    ├─ authRateLimiter  ← Only on /auth/register and /auth/login
  │    ├─ validate(schema) ← Zod parsing — rejects badly formed requests
  │    ├─ authenticate     ← JWT verification
  │    └─ authorize(roles) ← Role check
  │
  └─ Controller → Service → Mongoose → MongoDB
       │
       └─ errorHandler(err, req, res, next)  ← Catches any thrown error
```

### 6.2 JWT Authentication

Two tokens are issued:

| Token | Secret | Expiry | Stored |
|-------|--------|--------|--------|
| Access Token | `JWT_ACCESS_SECRET` | 15 minutes | Redux state + Keychain |
| Refresh Token | `JWT_REFRESH_SECRET` | 7 days | Keychain (secure) |

**Token payload:**
```typescript
{ userId: string, role: 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN' }
```

The `authenticate` middleware decodes the access token and attaches `req.user` so any controller can access the caller's identity.

### 6.3 Real-Time Chat — Socket.IO

The `chatSocket.ts` module registers two events on the Socket.IO server:

**`chat:join`**
- Client sends the `chatId` they want to subscribe to
- Server verifies the chat exists and the user is a participant
- Server calls `socket.join(chatId)` — adds them to a Socket.IO room

**`message:send`**
- Client sends `{ chatId, text }`
- Server validates length (≤ 2000 chars), confirms participant status
- Saves `Message` to MongoDB
- Broadcasts `message:new` to everyone in the room (including sender confirmed echo)

```
Startup sends message:
  socket.emit('message:send', { chatId, text: "Hello" })
           ↓
  Server saves Message to DB
           ↓
  io.to(chatId).emit('message:new', savedMessage)
           ↓
  Both Startup and Professional receive 'message:new'
```

**Authentication:** Socket.IO middleware verifies the JWT from `socket.handshake.auth.token` before allowing any connection.

### 6.4 File Upload — Cloudinary

Multer receives files in memory (`storage: multer.memoryStorage()`), then a custom Cloudinary upload stream uploads each buffer. The returned `secure_url` is stored in the `VerificationRequest.docUrls` array.

Documents are stored in Cloudinary, not in the database — the DB only stores the URL references.

### 6.5 Error Handling Strategy

Every service function uses `throw Object.assign(new Error('message'), { statusCode: 4xx })` to signal errors. The global `errorHandler` middleware reads `err.statusCode` and formats consistent JSON:

```json
{ "success": false, "message": "Email already in use" }
```

This means controllers are clean — they only have a `try/catch` that calls `next(err)`.

---

## 7. Frontend — App Structure & Navigation

### Directory Layout

```
VouchFrontend/src/
  api/           ← One file per backend resource (authApi, requestApi, chatApi…)
  components/    ← Reusable UI: AppButton, AppInput, SafeScreen, ProfessionalCard…
  features/      ← Screen groups by role
    auth/screens/
    startup/screens/
    professional/screens/
    admin/screens/
    chat/screens/
  hooks/         ← useAuth, useSocket (custom React hooks)
  navigation/    ← Navigator files + type definitions
  store/         ← Redux store, authSlice, hooks
  types/         ← Shared TypeScript interfaces
  utils/         ← constants.ts (colors, API URL), tokenStorage.ts
```

### Navigation Tree

```
RootNavigator
  │
  ├─ Auth (not logged in)
  │    └─ AuthNavigator (Stack)
  │         ├─ Landing
  │         ├─ Login
  │         ├─ Register
  │         └─ Onboarding
  │
  ├─ StartupApp (role === 'STARTUP')
  │    └─ StartupNavigator (Stack)
  │         ├─ StartupTabs (Bottom Tabs)
  │         │    ├─ Directory tab → DirectoryScreen
  │         │    ├─ MyRequests tab → MyRequestsScreen
  │         │    └─ Profile tab → StartupProfileScreen
  │         ├─ ProfessionalDetail
  │         ├─ CreateRequest
  │         └─ Chat
  │
  ├─ ProfessionalApp (role === 'LAWYER' || 'CA')
  │    └─ ProfessionalNavigator (Stack)
  │         ├─ ProfessionalTabs (Bottom Tabs)
  │         │    ├─ OpenRequests tab → OpenRequestsScreen
  │         │    ├─ MyAccepted tab → AcceptedRequestsScreen
  │         │    └─ Profile tab → LawyerProfileScreen / CAProfileScreen
  │         ├─ VerificationUpload
  │         ├─ StartupDetail
  │         └─ Chat
  │
  └─ AdminApp (role === 'ADMIN')
       └─ AdminNavigator
            └─ AdminTabs (Bottom Tabs)
                 ├─ Verifications tab → AdminDashboardScreen
                 ├─ Professionals tab → AdminProfessionalsScreen
                 └─ AdminProfile tab → AdminProfileScreen
```

**How `RootNavigator` decides which navigator to show:**
```typescript
// RootNavigator.tsx
if (!isAuthenticated)       → AuthNavigator
else if role === 'STARTUP'  → StartupNavigator
else if role === 'ADMIN'    → AdminNavigator
else                        → ProfessionalNavigator (LAWYER or CA)
```

On app start, a `useEffect` bootstrap reads tokens from Keychain, calls `GET /auth/me`, and dispatches `setAuth`. While loading, a spinner is shown.

---

## 8. Frontend — Screens Deep Dive

### 8.1 Auth Flow Screens

#### `LandingScreen`

**File:** `src/features/auth/screens/LandingScreen.tsx`

The first screen a new user sees. Shows the Vouch logo, tagline, and three feature bullets. Two buttons: "Get Started" (→ Register) and "I already have an account" (→ Login).

No API calls. Pure navigation entry point.

---

#### `LoginScreen`

**File:** `src/features/auth/screens/LoginScreen.tsx`

**Form fields:** email, password  
**Validation:** Zod schema via `react-hook-form` `zodResolver`  
**On submit:** calls `useAuth().login(data)` → `authApi.login()` → dispatches `setAuth` → Redux state change → `RootNavigator` re-renders and shows the role-appropriate navigator automatically.

Error handling: catches Axios errors and shows the backend message (e.g., "Invalid credentials").

---

#### `RegisterScreen`

**File:** `src/features/auth/screens/RegisterScreen.tsx`

**Form fields:** name, email, password, role (STARTUP / LAWYER / CA)  

Role is selected by tapping one of three role cards at the top. The selected card gets a blue border and filled background.

**Password rules (enforced by Zod):**
- Min 8 characters
- Must contain at least one letter AND one number

**On success:** Does NOT log in yet. Navigates to `Onboarding` passing `{ role, user, accessToken, refreshToken }` as route params — the tokens are needed to make authenticated API calls during onboarding.

---

#### `OnboardingScreen`

**File:** `src/features/auth/screens/OnboardingScreen.tsx`

Shows either the Startup profile form or the Professional profile form depending on the `role` route param.

**Startup fields:** companyName, industry, city, description  
**Professional fields:** fullName, city, experienceYears, specializations (comma-separated), licenseNumber, feeRange

On submit: calls the appropriate profile API (`startupApi.upsertProfile` or `professionalApi.upsertProfile`), then calls `useAuth().completeAuth(user, accessToken, refreshToken)` which dispatches `setAuth` — this is the point the app actually "logs in" and navigates away from Auth.

---

### 8.2 Startup Screens

#### `DirectoryScreen`

**File:** `src/features/startup/screens/DirectoryScreen.tsx`  
**Tab:** "Directory" (first tab)

**What it shows:** A searchable, filterable list of professionals.

**Features:**
- City text input with 500ms debounce (waits for user to stop typing before firing query)
- Three filter buttons: All / Lawyer / CA
- `useQuery(['directory', city, type])` — TanStack Query caches results and re-fetches when filters change

**Each card (`ProfessionalCard` component) shows:**
- Avatar (first letter of name in a coloured circle)
- Full name, profession type, city
- ✓ Verified badge if `isVerified === true`
- Fee range and first 2 specializations

**Tapping a card** navigates to `ProfessionalDetail` with the professional's `userId`.

---

#### `ProfessionalDetailScreen`

**File:** `src/features/startup/screens/ProfessionalDetailScreen.tsx`

**What it shows:** Full professional profile.

**Data:** `useQuery(['professional', userId])` → `GET /professional/profile/:userId`

Displays:
- Avatar, name, type · city
- ✓ Verified / ✗ Not Verified badge
- Details section: years experience, fee, license number
- Specializations as chips/tags
- "Create Service Request" button → `CreateRequest` screen

This is the screen shown in the screenshot in the user's attachment.

---

#### `CreateRequestScreen`

**File:** `src/features/startup/screens/CreateRequestScreen.tsx`

**Purpose:** Fill in and submit a service request for a specific professional category.

**Active request guard:** On mount, queries `GET /requests/mine`. If a request with status `OPEN` or `ACCEPTED` exists, the entire form is hidden and replaced with a warning card:

```
⚠️ Active Request Exists
You already have an active open/accepted request.
You can create a new one once it is rejected or closed.
[← Go Back]
```

**Form fields:**
- Category picker (LAWYER categories and CA categories shown in two labelled groups)
- Description (min 20 characters)
- City
- Budget Range

On success: navigates back; the `myRequests` cache is automatically invalidated.

---

#### `MyRequestsScreen`

**File:** `src/features/startup/screens/MyRequestsScreen.tsx`

**Tab:** "My Requests"

**What it shows:** All the startup's requests, split into sections: "Lawyer Requests" and "CA Requests".

**Status colour coding:**

| Status | Colour |
|--------|--------|
| OPEN | Green `#059669` |
| ACCEPTED | Blue `#2563EB` |
| CLOSED | Grey `#6B7280` |
| REJECTED | Red `#DC2626` |

For **ACCEPTED** requests: shows the assigned professional's name, type, and city.  
For **REJECTED** requests: shows a red "Rejection reason" box with the professional's stated reason.  
For **ACCEPTED** requests: "💬 Open Chat" button that fetches the chatId and navigates to `ChatScreen`.  
For **ACCEPTED** requests: "Close Request" button to mark work as done.

---

#### `StartupProfileScreen`

**File:** `src/features/startup/screens/StartupProfileScreen.tsx`  
**Tab:** "Profile"

Shows the startup's own profile (company name, industry, city, description). Has a logout button.

---

### 8.3 Professional Screens

#### `OpenRequestsScreen`

**File:** `src/features/professional/screens/OpenRequestsScreen.tsx`  
**Tab:** "Open Jobs"

**What it shows:** All open service requests matching the professional's category (backend already filters by role).

**Each card shows:**
- Service category label (e.g., "Trademark", "Tax Filing")
- OPEN badge
- 🏢 Startup company name
- 👤 Startup person name
- Description (2 lines)
- 📍 City | 💰 Budget Range

**Tapping a card** navigates to **`StartupDetailScreen`** (does NOT immediately accept — gives the professional time to review the startup profile first).

**Reject from list:** There is also a reject button per card that opens an inline Modal asking for a reason. On confirm, calls `POST /requests/:id/reject`.

**Pull to refresh** supported via `onRefresh={refetch}`.

---

#### `StartupDetailScreen`

**File:** `src/features/professional/screens/StartupDetailScreen.tsx`

**The decision screen.** A professional reaches this after tapping an open job card.

**Two parallel queries:**
1. `['openRequests']` — to find the specific request by `requestId`
2. `['startupProfile', createdByStartupUserId]` — calls `GET /requests/startup/:userId/profile` to fetch company info

**What it displays:**
- Company name (large, bold)
- Person name and email
- Industry and city chips
- Company description
- Request details: category, city, budget, description

**Two action buttons at the bottom:**
- **✓ Accept Job** (green) → calls `POST /requests/:id/accept` → navigates to `ChatScreen`
- **✗ Reject** (red outline) → opens a Modal requesting typed reason → calls `POST /requests/:id/reject` → goes back to the open jobs list

---

#### `AcceptedRequestsScreen`

**File:** `src/features/professional/screens/AcceptedRequestsScreen.tsx`  
**Tab:** "My Accepted Jobs"

Shows all jobs with status `ACCEPTED` that belong to this professional.

Each card shows:
- Category
- ACCEPTED badge
- 🏢 Startup company name
- 👤 Startup person name
- Description
- City | Budget
- 💬 Open Chat button

---

#### `VerificationUploadScreen`

**File:** `src/features/professional/screens/VerificationUploadScreen.tsx`

Accessible from the professional's profile tab via a "Get Verified" button.

**Flow:**
1. User taps "Pick Documents" → `@react-native-documents/picker` opens the native file picker
2. Can pick up to 3 files (PDF or images)
3. Selected files listed with individual "Remove" buttons
4. "Submit for Review" → sends `FormData` to `POST /professional/verification/submit`
5. On success: Alert → back to Profile

---

#### `LawyerProfileScreen` / `CAProfileScreen`

Display the professional's own profile with all fields. Have a "Get Verified" button that navigates to `VerificationUploadScreen`, and a logout button.

---

### 8.4 Admin Screens

#### `AdminDashboardScreen`

**File:** `src/features/admin/screens/AdminDashboardScreen.tsx`  
**Tab:** "Verifications"

**What it shows:** All `PENDING` verification requests from professionals.

Each card shows:
- Professional's name and email (populated from User collection)
- Number of documents submitted ("📎 2 document(s) submitted")
- Individual document chips — tap each chip to open the URL in browser (`Linking.openURL`)
- "Preview All" button — opens a modal with inline image previews (if Cloudinary image URL) or a link to open PDF
- **Approve** button (green) → Alert confirm → `POST /admin/verifications/:id/approve`
- **Reject** button (red) → Opens a reject modal where admin types a note → `POST /admin/verifications/:id/reject`

**Tech detail:** The admin dashboard uses TanStack Query's `useMutation` for approve/reject. On `onSuccess`, it calls `queryClient.invalidateQueries({ queryKey: ['verifications'] })` to remove the approved/rejected item from the list automatically.

---

### 8.5 Shared — Chat Screen

**File:** `src/features/chat/screens/ChatScreen.tsx`

Used by both startups and professionals once a request is accepted.

**Data sources:**
1. `useQuery(['chatInfo', chatId])` → `GET /chats/:chatId` — participant names and types  
2. `useQuery(['messages', chatId])` → `GET /messages/:chatId` — message history  
3. `useSocket(chatId, onNewMessage)` — Socket.IO connection for real-time

**Message display (WhatsApp-style):**
- Sent messages (mine): right-aligned, blue bubble
- Received messages: left-aligned, grey bubble
- Each message shows sender info:
  - **Startup sender:** Company name (bold) + person name below (small)
  - **Professional sender:** Full professional name (bold) + type e.g., "CA" or "LAWYER" below

**Header:**
- Shows the "other" person's name as the title
- Shows a sub-title below (e.g., person name for professional seeing a startup, or job type for startup seeing professional)

**Send flow:**
1. User types in text input, taps "Send"
2. `sendMessage(text)` emitted via Socket.IO
3. Server saves to DB, broadcasts `message:new` to the room
4. `onNewMessage` callback appends to `localMessages` state → FlatList scrolls to end

**TanStack Query v5 note:** `useEffect` watches `messagesData` changes to sync into `localMessages` — the library dropped the `onSuccess` callback in v5.

---

## 9. Frontend — State Management

### Redux Store (`src/store/`)

Only **authentication state** lives in Redux — because it needs to persist across the entire app and drive navigation decisions.

```typescript
AuthState {
  user:            User | null
  accessToken:     string | null
  refreshToken:    string | null
  isLoading:       boolean   // true during app bootstrap
  isAuthenticated: boolean
}
```

**Actions:**

| Action | When |
|--------|------|
| `setAuth` | After login, after onboarding completes, after bootstrap |
| `setTokens` | After token refresh (keeps user, just updates tokens) |
| `setUser` | After profile update |
| `logout` | User taps logout |
| `setLoading` | During bootstrap check |

### TanStack Query

All server data (directory listings, requests, messages, verifications) is managed by TanStack Query. Benefits used:

- **Caching:** The directory doesn't re-fetch if you navigate away and come back within the stale time
- **Background refetching:** Screen focuses → data refreshes automatically
- **Invalidation:** After accepting a request, `qc.invalidateQueries({ queryKey: ['openRequests'] })` removes stale data so the list re-fetches
- **Loading states:** `isLoading` flag drives `<AppLoader />` spinners

---

## 10. Frontend — API Layer & Token Lifecycle

### `src/api/client.ts` — Axios Configuration

The `apiClient` is a configured Axios instance with:
- `baseURL: API_BASE_URL` (`http://10.0.2.2:5000/api/v1` for emulator)
- 15-second timeout

**Request interceptor:** Reads the access token from Keychain and appends `Authorization: Bearer <token>` to every request.

**Response interceptor (auto-refresh):**
```
On 401 response:
  1. Pause — read refresh token from Keychain
  2. POST /auth/refresh
  3. Save new tokens to Keychain
  4. Update Redux state (setTokens)
  5. Replay the original failed request with new token

If refresh also fails:
  → Store.dispatch(logout()) → User sent to Login screen
```

This is implemented with a queue (`failedQueue`) so if multiple requests 401 simultaneously, they all wait for one refresh attempt and are then replayed — preventing duplicate refresh calls.

### Token Storage

`src/utils/tokenStorage.ts` wraps `react-native-keychain`:
- `saveTokens(access, refresh)` → stores both under service key `"vouch_tokens"`
- `getAccessToken()` / `getRefreshToken()` → reads from Keychain
- `clearTokens()` → deletes on logout

iOS: stored in iOS Keychain (hardware-backed on A9+ devices)  
Android: stored in Android Keystore / EncryptedSharedPreferences

---

## 11. Complete User Flows

### Flow A: Startup registers and gets a lawyer

```
1. Open app → LandingScreen
2. Tap "Get Started" → RegisterScreen
3. Fill name/email/password, select "Startup" role → submit
4. Backend: creates User, returns tokens
5. App: navigates to OnboardingScreen → fill company details
6. Backend: creates StartupProfile
7. App: completeAuth() → dispatched to Redux → RootNavigator shows StartupApp

8. DirectoryScreen loads → Browse lawyers/CAs
9. Tap a lawyer card → ProfessionalDetailScreen
10. Tap "Create Service Request"
11. CreateRequestScreen → fill category/description/city/budget → submit
12. Backend: checks no active request → creates ServiceRequest(OPEN)
13. App: navigates back → MyRequestsScreen shows new OPEN request

14. Professional sees it in OpenRequestsScreen
15. Taps card → StartupDetailScreen shows full startup info
16. Taps "✓ Accept Job"
17. Backend: ServiceRequest → ACCEPTED, Chat document created
18. App: navigates to ChatScreen

19. Startup sees MyRequestsScreen: status changed to ACCEPTED
20. Taps "💬 Open Chat" → same ChatScreen

21. Both sides exchange real-time messages via Socket.IO

22. Startup taps "Close Request" → ServiceRequest → CLOSED
```

### Flow B: Professional gets verified

```
1. Professional logs in → ProfessionalApp
2. Profile tab → taps "Get Verified"
3. VerificationUploadScreen → picks 1–3 PDFs/images
4. Submits → files uploaded to Cloudinary → VerificationRequest(PENDING) created

5. Admin logs in → AdminDashboardScreen
6. Sees the professional's pending card
7. Opens documents (taps chips or "Preview All")
8. Taps "Approve" → confirms alert
9. Backend: VerificationRequest → APPROVED, ProfessionalProfile.isVerified = true

10. Professional's directory card now shows ✓ Verified badge
```

### Flow C: Professional rejects a job with reason

```
1. Professional sees open request in OpenRequestsScreen
2. Taps card → StartupDetailScreen
3. Taps "✗ Reject" → modal appears asking for reason
4. Types reason: "This falls under corporate law, not my specialization"
5. Confirms → ServiceRequest → REJECTED, rejectionReason stored

6. Startup's MyRequestsScreen shows the request in red (REJECTED status)
7. Red box below the card shows the rejection reason
8. Startup can now create a new request (the active-request block is cleared)
```

---

## 12. Commands to Run the Project

### Prerequisites

| Software | Minimum Version | Download |
|----------|----------------|---------|
| Node.js | 20.x | https://nodejs.org |
| JDK | 17 | https://adoptium.net |
| Android Studio + SDK | — | https://developer.android.com/studio |
| MongoDB | 7.x | https://www.mongodb.com/try/download/community |

For Android emulator: create a device in **Android Studio → Device Manager** (API 34+).

---

### Step 1 — Clone & Install

```bash
# Clone the repo
git clone <repo-url>
cd CodeBase

# Install backend dependencies
cd VouchBackend
npm install

# Install frontend dependencies
cd ../VouchFrontend
npm install
```

---

### Step 2 — Configure Backend Environment

The backend reads from `VouchBackend/.env`. A working `.env` is already committed to this project. If you need to reconfigure:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vouch

JWT_ACCESS_SECRET=<min 32 character random string>
JWT_REFRESH_SECRET=<min 32 character random string>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

CLOUDINARY_CLOUD_NAME=<your cloudinary cloud>
CLOUDINARY_API_KEY=<your key>
CLOUDINARY_API_SECRET=<your secret>

ADMIN_SEED_EMAIL=admin@vouch.app
ADMIN_SEED_PASSWORD=Admin@1234
ALLOWED_ORIGINS=
```

---

### Step 3 — Seed the Admin Account

The app has no admin registration endpoint (by design — admin is seeded):

```bash
cd VouchBackend
npx ts-node src/scripts/seedAdmin.ts
```

Admin credentials:
- Email: `admin@vouch.app`
- Password: `Admin@1234`

---

### Step 4 — Start the Backend

```bash
cd VouchBackend
npm run dev
```

Output:
```
[INFO] Server running on port 5000
[INFO] MongoDB connected
```

Verify it is running: `http://localhost:5000/health` should return `{ "status": "ok" }`.

---

### Step 5 — Start Metro (React Native bundler)

Open a **new terminal**:

```bash
cd VouchFrontend
npx react-native start
```

---

### Step 6 — Build & Run on Android Emulator

Open a **new terminal** (keep Metro running):

```bash
cd VouchFrontend
npx react-native run-android
```

This will:
1. Compile the JavaScript bundle via Metro
2. Run Gradle to build the APK
3. Install the APK on the running emulator
4. Launch the app

**First build takes 3–5 minutes** (Gradle downloads dependencies). Subsequent builds are faster.

---

### Alternative: Build APK without running emulator

```bash
cd VouchFrontend
build.bat
```

Or manually:

```bash
cd VouchFrontend/android
.\gradlew assembleDebug
```

APK location: `VouchFrontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

### Emulator-specific Configuration

The app is configured to reach the backend at `10.0.2.2:5000` which is the Android emulator's alias for `localhost` on the host machine.

File: `VouchFrontend/src/utils/constants.ts`

```typescript
const DEV_HOST = '10.0.2.2'; // Android emulator → host machine
// const DEV_HOST = '192.168.1.11'; // Physical device → your LAN IP
```

If testing on a physical device, replace with your machine's local IP (`ipconfig` on Windows → look for your Wi-Fi adapter's IPv4 address).

---

### Docker (Backend only)

The backend has a `Dockerfile` for containerised deployment:

```bash
cd VouchBackend
docker build -t vouch-backend .
docker run -p 5000:5000 --env-file .env vouch-backend
```

---

### Running Backend Tests

```bash
cd VouchBackend
npm test
```

Uses Jest + Supertest for HTTP integration tests.

---

### Quick Reference — All Commands

```bash
# ─── Backend ───────────────────────────────────────────────
cd VouchBackend

npm install                        # Install dependencies
npm run dev                        # Start dev server (ts-node-dev hot reload)
npm run build                      # Compile TypeScript to dist/
npm start                          # Run compiled production server
npx ts-node src/scripts/seedAdmin.ts  # Seed admin user

# ─── Frontend ──────────────────────────────────────────────
cd VouchFrontend

npm install                        # Install dependencies
npx react-native start             # Start Metro bundler
npx react-native run-android       # Build + run on emulator

# Android-only build commands
cd android
.\gradlew assembleDebug            # Build debug APK
.\gradlew clean                    # Clean build cache
.\gradlew app:installDebug         # Install APK on connected emulator
```

---

*Documentation covers backend version at `VouchBackend/server.ts` and frontend at React Native 0.84.1 with TanStack Query v5. All endpoint responses follow the `{ success: boolean, message?: string, data: T }` envelope format.*
