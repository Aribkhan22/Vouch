# VOUCH — Complete Project Documentation

> **Full Technical Reference | Backend API · Frontend Screens · cURL Examples · Architecture**
> Last updated: April 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Design — MongoDB Models](#4-database-design--mongodb-models)
5. [Backend — Entry Point & Middleware Pipeline](#5-backend--entry-point--middleware-pipeline)
6. [Backend — Complete API Reference with cURL](#6-backend--complete-api-reference-with-curl)
   - 6.1 [Auth Endpoints](#61-auth-endpoints)
   - 6.2 [Professional Profile Endpoints](#62-professional-profile-endpoints)
   - 6.3 [Startup Profile Endpoints](#63-startup-profile-endpoints)
   - 6.4 [Service Request Endpoints](#64-service-request-endpoints)
   - 6.5 [Chat Endpoints](#65-chat-endpoints)
   - 6.6 [Message Endpoints](#66-message-endpoints)
   - 6.7 [Verification Submission Endpoint](#67-verification-submission-endpoint)
   - 6.8 [Admin Endpoints](#68-admin-endpoints)
   - 6.9 [Health Check](#69-health-check)
7. [Backend — Core Components Deep Dive](#7-backend--core-components-deep-dive)
8. [Frontend — Project Structure](#8-frontend--project-structure)
9. [Frontend — Navigation Tree](#9-frontend--navigation-tree)
10. [Frontend — Screens Deep Dive](#10-frontend--screens-deep-dive)
11. [Frontend — State Management](#11-frontend--state-management)
12. [Frontend — API Layer & Token Lifecycle](#12-frontend--api-layer--token-lifecycle)
13. [Complete End-to-End User Flows](#13-complete-end-to-end-user-flows)
14. [Socket.IO — Client Integration Guide](#14-socketio--client-integration-guide)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Running the Project](#16-running-the-project)

---

## 1. Project Overview

**Vouch** is a mobile application that connects **startups** with **verified Lawyers and Chartered Accountants (CAs)**. It provides a trusted directory, structured service request management, real-time in-app chat, and an admin verification workflow — all in one platform.

### The Three User Roles

| Role | Core Capabilities |
|------|------------------|
| **STARTUP** | Browse professional directory, filter by city/type, raise service requests, chat with assigned professional, track request history, mutually close engagements |
| **LAWYER / CA** | View open job requests matching their profession, accept/reject with reason, real-time chat, manage active and completed jobs, submit verification documents |
| **ADMIN** | Review professional credential documents, approve or reject verification submissions with notes |

### Core Problems Solved

| Problem | Vouch Solution |
|---------|---------------|
| No trustworthy verified directory | Admin reviews and approves credential documents before a professional gets the ✓ verified badge |
| Mismatch in expectations | Service requests carry category, budget range, city, and description — professional decides before committing |
| Communication fragmented across WhatsApp/email | In-app real-time Socket.IO chat created automatically on request acceptance |
| No engagement lifecycle tracking | OPEN → ACCEPTED → CLOSED (with mutual confirmation) state machine, visible to both parties |
| Duplicate request spam | Per-type blocking: one active Lawyer request and one active CA request allowed simultaneously, not two of the same type |

---

## 2. Technology Stack

### Backend (`VouchBackend/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | JavaScript runtime environment |
| **TypeScript** | 5.x | Full static typing across the codebase |
| **Express.js** | 4.19 | HTTP framework — routing, middleware, controllers |
| **MongoDB** | 7.x (Atlas) | Primary NoSQL document database |
| **Mongoose** | 8.5 | Object Data Modelling (ODM) — schemas, validation, queries |
| **Socket.IO** | 4.7 | WebSocket server for real-time bidirectional chat |
| **JWT (jsonwebtoken)** | 9.0 | Stateless authentication with access + refresh token strategy |
| **bcryptjs** | 2.4 | Secure password hashing (12 rounds) |
| **Zod** | 3.23 | Runtime request body validation with descriptive error messages |
| **Cloudinary** | 2.5 | Cloud file storage for professional verification documents |
| **Multer** | 1.4 | Handles `multipart/form-data` file uploads before Cloudinary |
| **Helmet** | 7.1 | Sets security-critical HTTP response headers |
| **express-rate-limit** | 7.3 | Prevents brute-force on auth endpoints |
| **Winston** | 3.14 | Structured JSON logging |
| **Morgan** | 1.10 | HTTP access log (method, path, status, latency) |
| **ts-node-dev** | — | Dev server: hot-reloads on file changes |
| **compression** | 1.7 | Gzip compression for responses larger than 1 KB |

### Frontend (`VouchFrontend/`)

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Native** | 0.84.1 | Cross-platform mobile app (Android + iOS) |
| **TypeScript** | 5.x | Type-safe component props, API responses, navigation params |
| **React Navigation** | 7.x | Stack navigators + bottom tab navigators |
| **Redux Toolkit** | 2.11 | Global auth state (user object, tokens, loading flag) |
| **TanStack Query v5** | 5.95 | Server-state: caching, background refetch, loading/error states |
| **Axios** | 1.14 | HTTP client with interceptors for auto-token-refresh |
| **Socket.IO Client** | 4.8 | WebSocket connection to backend for real-time messages |
| **React Hook Form** | 7.72 | Performant form state management |
| **Zod** | 4.3 | Frontend-side schema validation via zodResolver |
| **react-native-keychain** | 10.0 | Secure token storage (iOS Keychain / Android Keystore) |
| **@react-native-documents/picker** | 12.0 | Native document/file picker for verification uploads |
| **react-native-safe-area-context** | 5.7 | Handle device notch and home indicator safe areas |

### Build & Infrastructure

| Tool | Purpose |
|------|---------|
| **Gradle 8.13** | Android build system |
| **JDK 17** | Required by Android compile SDK 36 |
| **Metro Bundler** | React Native JS bundler |
| **Docker** | Containerises the backend for deployment |

---

## 3. System Architecture

```
+-----------------------------------------------------------------------+
|                     MOBILE APP  (React Native)                        |
|                                                                       |
|  +----------------+  +-----------------+  +------------------------+  |
|  | Redux Toolkit  |  |  TanStack Query |  |   Socket.IO Client     |  |
|  | (auth state)   |  | (server state)  |  |   (real-time chat)     |  |
|  +----------------+  +-----------------+  +------------------------+  |
|          |                  |                        |                |
|          +------------------+------------------------+                |
|                             |                                        |
|                   Axios HTTP Client                                  |
|              (Bearer token auto-injected)                            |
|              (auto-refresh interceptor on 401)                       |
+-----------------------------+-----------------------------------------+
                              |
              +---------------+---------------+
              |  HTTP REST  (port 5000)       |
              |  WebSocket  (Socket.IO)       |
              +---------------+---------------+
                              |
+-----------------------------v-----------------------------------------+
|                  BACKEND  (Express.js + TypeScript)                   |
|                                                                       |
|   helmet -> cors -> compression -> morgan -> express.json()           |
|              |                                                        |
|   [route-specific] authRateLimiter -> validate(Zod) ->               |
|                    authenticate(JWT) -> authorize(role)               |
|              |                                                        |
|  +----------+ +----------+ +----------+ +----------+ +----------+    |
|  |  Auth    | | Request  | |   Chat   | |  Admin   | |  Verif.  |    |
|  | Service  | | Service  | |  Service | |  Service | |  Service |    |
|  +----------+ +----------+ +----------+ +----------+ +----------+    |
|                             |                                        |
|                     Mongoose ODM                                     |
+-----------------------------+-----------------------------------------+
                              |
           +------------------+------------------+
           |                                     |
+----------v-----------+            +------------v----------+
|   MongoDB (Atlas)    |            |     Cloudinary        |
|  7 collections:      |            |  (document files)     |
|  Users               |            |  Stores: PDF/images   |
|  StartupProfiles     |            |  Returns: secure URLs  |
|  ProfessionalProfiles|            +-----------------------+
|  ServiceRequests     |
|  Chats               |
|  Messages            |
|  VerificationRequests|
+----------------------+
```

### Request Lifecycle Through the Backend

Taking `GET /api/v1/requests/open` as a concrete example:

```
Step 1:  Mobile sends:
         GET http://10.0.2.2:5000/api/v1/requests/open
         Headers: { Authorization: "Bearer eyJ..." }

Step 2:  helmet()        sets X-Frame-Options, X-XSS-Protection, etc.
Step 3:  cors()          validates Origin header against ALLOWED_ORIGINS
Step 4:  morgan()        logs "GET /api/v1/requests/open - 200 - 43ms"
Step 5:  authenticate    verifies JWT signature, decodes payload,
                         attaches req.user = { userId: "...", role: "LAWYER" }
Step 6:  authorize('LAWYER','CA')
                         checks role; rejects STARTUP with 403
Step 7:  requestController.open() calls requestService.getOpenRequests()
Step 8:  MongoDB query: { status: "OPEN", category: { $in: LAWYER_CATEGORIES } }
Step 9:  Enriches results with startupCompanyName and startupPersonName
Step 10: sendSuccess(res, data) returns { success: true, data: [...] }
```

---

## 4. Database Design — MongoDB Models

### 4.1 User

Every person who registers gets exactly one `User` document regardless of role.

```
User {
  _id:          ObjectId   -- auto-generated primary key
  role:         enum       -- 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN'
  name:         String     -- display name, whitespace trimmed
  email:        String     -- unique, lowercased
  passwordHash: String     -- bcrypt hash, 12 rounds (NEVER plain text)
  status:       enum       -- 'ACTIVE' | 'SUSPENDED'  (default: ACTIVE)
  createdAt:    Date       -- auto-set by Mongoose timestamps
}
Index: { email: 1 } unique
```

### 4.2 StartupProfile

Created during onboarding for STARTUP users. One-to-one with User.

```
StartupProfile {
  _id:         ObjectId
  userId:      ObjectId  -> User  (unique index)
  companyName: String
  industry:    String    -- e.g., "FinTech", "SaaS"
  city:        String
  description: String
  createdAt:   Date
}
Index: { userId: 1 } unique
```

### 4.3 ProfessionalProfile

Created during onboarding for LAWYER / CA users. One-to-one with User.

```
ProfessionalProfile {
  _id:             ObjectId
  userId:          ObjectId  -> User  (unique index)
  fullName:        String
  professionType:  enum       -- 'LAWYER' | 'CA'
  city:            String
  experienceYears: Number     -- min 0, max 60
  specializations: [String]   -- max 5 items
  licenseNumber:   String     -- bar council / ICAI membership number
  feeRange:        String?    -- e.g., "3k-6k per hour" (optional)
  isVerified:      Boolean    -- default: false; set true by Admin approval only
  createdAt:       Date
}
Index: { city: 1, professionType: 1, isVerified: 1 }
```

### 4.4 ServiceRequest

The central entity. A startup creates it; a professional accepts or rejects it.

```
ServiceRequest {
  _id:                         ObjectId
  createdByStartupUserId:      ObjectId  -> User
  assignedProfessionalUserId:  ObjectId? -> User  (null until accepted)
  category:                    enum:
    LAWYER categories: CONTRACT_REVIEW | TRADEMARK | LITIGATION |
                       IP_PROTECTION | DUE_DILIGENCE
    CA categories:     COMPANY_INCORPORATION | TAX_FILING |
                       COMPLIANCE | OTHER
  description:                 String    -- min 20 chars
  city:                        String
  budgetRange:                 String    -- e.g., "5k-10k"
  status:                      enum      -- 'OPEN' | 'ACCEPTED' | 'CLOSED' | 'REJECTED'
  rejectionReason:             String?
  endRequestedByStartup:       Boolean   -- mutual close flag
  endRequestedByProfessional:  Boolean   -- mutual close flag
  createdAt:                   Date
  acceptedAt:                  Date?
  closedAt:                    Date?
  rejectedAt:                  Date?
}
Index: { status: 1, city: 1 }
Index: { createdByStartupUserId: 1 }
```

**Per-type blocking rule:**
- LAWYER categories: CONTRACT_REVIEW, TRADEMARK, LITIGATION, IP_PROTECTION, DUE_DILIGENCE
- CA categories: COMPANY_INCORPORATION, TAX_FILING, COMPLIANCE, OTHER
- Max 1 active (OPEN or ACCEPTED) Lawyer request at a time
- Max 1 active (OPEN or ACCEPTED) CA request at a time
- A startup CAN have one active Lawyer AND one active CA request simultaneously

### 4.5 Chat

Created automatically when a professional accepts a request. One-to-one with ServiceRequest.

```
Chat {
  _id:                  ObjectId
  requestId:            ObjectId  -> ServiceRequest  (unique)
  startupUserId:        ObjectId  -> User
  professionalUserId:   ObjectId  -> User
  createdAt:            Date
}
```

### 4.6 Message

Individual messages in a chat. Many-to-one with Chat.

```
Message {
  _id:       ObjectId
  chatId:    ObjectId  -> Chat
  senderId:  ObjectId  -> User
  text:      String    -- max 2000 characters
  createdAt: Date
}
Index: { chatId: 1, createdAt: 1 }  -- for paginated history queries
```

### 4.7 VerificationRequest

Submitted by professional; reviewed by Admin.

```
VerificationRequest {
  _id:                  ObjectId
  professionalUserId:   ObjectId  -> User
  docUrls:              [String]  -- 1 to 3 Cloudinary secure_url values
  status:               enum      -- 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote:            String?
  reviewedBy:           ObjectId? -> User  (the admin)
  submittedAt:          Date
  reviewedAt:           Date?
}
```

---

## 5. Backend — Entry Point & Middleware Pipeline

### How the Server Starts (`server.ts`)

```typescript
// 1. Load .env and validate all variables via Zod schema in config/env.ts
// 2. Create Express app  (src/app.ts)
// 3. Create http.Server wrapping Express
// 4. Attach Socket.IO to that server
// 5. registerChatSocket(io)  -- registers chat:join and message:send handlers
// 6. connectDB()             -- Mongoose connects to MongoDB Atlas
// 7. server.listen(PORT)
```

### Middleware Order in `src/app.ts`

```
Incoming HTTP Request
        |
        v
1. helmet()          -- X-Frame-Options, X-XSS-Protection, CSP, etc.
2. cors()            -- validates Origin against ALLOWED_ORIGINS env var
3. compression()     -- gzip for responses > 1 KB
4. morgan()          -- logs: GET /api/v1/... 200 45ms
5. express.json()    -- parses JSON body, rejects payloads > 1 MB
6. Route handlers    -- mounted at /api/v1
     /auth           -> auth.routes.ts
     /professionals  -> professional.routes.ts
     /startup        -> startup.routes.ts
     /requests       -> request.routes.ts
     /chats          -> chat.routes.ts
     /messages       -> message.routes.ts
     /admin          -> admin.routes.ts
7. errorHandler()    -- catches any next(err), returns { success:false, message }
```

### Route-Level Middleware (example)

```typescript
// request.routes.ts
router.post(
  '/',
  authenticate,         // 1. verify JWT, attach req.user
  authorize('STARTUP'), // 2. check role === 'STARTUP', else 403
  validate(schema),     // 3. Zod parse req.body, else 400 with field errors
  requestController.create,
);
```

---

## 6. Backend — Complete API Reference with cURL

### Base URL
```
Development (local):  http://localhost:5000/api/v1
Android Emulator:     http://10.0.2.2:5000/api/v1
Physical Device:      http://YOUR_PC_LAN_IP:5000/api/v1
```

### How to Use the cURL Examples
1. Replace `YOUR_ACCESS_TOKEN` with the `accessToken` from `/auth/login`
2. Replace `OBJECT_ID` placeholders with real MongoDB ObjectId strings
3. On Windows PowerShell use double quotes for `-d` values
4. Get your access token first by calling `/auth/login`

---

### 6.1 Auth Endpoints

Rate-limited to **10 requests per minute per IP** (protects against brute-force).

---

#### POST /auth/register — Register a New User

Creates a User document, hashes password (bcrypt 12 rounds), returns both tokens.

**Validation:**
- `name` min 2 chars
- `email` valid format, stored lowercase
- `password` min 8 chars, must have at least one letter AND one number
- `role` one of: STARTUP, LAWYER, CA (not ADMIN — seeded separately)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Rahul Sharma\",
    \"email\": \"rahul@mystartup.com\",
    \"password\": \"Pass1234\",
    \"role\": \"STARTUP\"
  }"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "665f1a2b3c4d5e6f7a8b9c0d",
      "name": "Rahul Sharma",
      "email": "rahul@mystartup.com",
      "role": "STARTUP"
    }
  }
}
```

**Error Responses:**
- `409` — "This email is already registered."
- `400` — Zod validation with field-level detail

---

#### POST /auth/login — Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"rahul@mystartup.com\", \"password\": \"Pass1234\"}"
```

**Code path:**
1. `User.findOne({ email })` — not found → 401
2. `user.status === 'SUSPENDED'` → 403
3. `bcrypt.compare(password, hash)` — mismatch → 401
4. Issue new access + refresh tokens

**Success Response (200):** Same structure as register.

**Error Responses:**
- `401` — "Email or username is incorrect"
- `401` — "Password is incorrect"
- `403` — "Account suspended"

---

#### POST /auth/refresh — Refresh Access Token

Every call issues a **completely new token pair** (token rotation).

```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"}"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tokens refreshed",
  "data": {
    "accessToken": "eyJ...(new)...",
    "refreshToken": "eyJ...(new)..."
  }
}
```

**Error Response:**
- `401` — "Your session has expired. Please log in again."

---

#### GET /auth/me — Get Current User

Returns authenticated user (without passwordHash). Used on app startup to validate a stored token.

```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "Rahul Sharma",
    "email": "rahul@mystartup.com",
    "role": "STARTUP",
    "status": "ACTIVE",
    "createdAt": "2026-04-20T10:00:00.000Z"
  }
}
```

---

### 6.2 Professional Profile Endpoints

All require `authenticate` middleware.

---

#### PUT /professional/profile — Create or Update Profile

**Auth:** LAWYER or CA only (403 for other roles)

Uses `findOneAndUpdate` with `upsert: true` — same endpoint for first-time creation and edits.

```bash
curl -X PUT http://localhost:5000/api/v1/professional/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"Advocate Sham Kumar\",
    \"professionType\": \"LAWYER\",
    \"city\": \"New Delhi\",
    \"experienceYears\": 8,
    \"specializations\": [\"Trademark\", \"IP Protection\", \"Contract Review\"],
    \"licenseNumber\": \"DL/BAR/2018/1234\",
    \"feeRange\": \"5k-10k per hour\"
  }"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665f...",
    "userId": "665f1a2b...",
    "fullName": "Advocate Sham Kumar",
    "professionType": "LAWYER",
    "city": "New Delhi",
    "experienceYears": 8,
    "specializations": ["Trademark", "IP Protection", "Contract Review"],
    "licenseNumber": "DL/BAR/2018/1234",
    "feeRange": "5k-10k per hour",
    "isVerified": false
  }
}
```

---

#### GET /professional/profile/:userId — Get a Professional Profile

```bash
curl -X GET http://localhost:5000/api/v1/professional/profile/665f1a2b3c4d5e6f7a8b9c0e \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### GET /professionals — Browse Directory

**Query parameters (all optional):**

| Param | Example | Effect |
|-------|---------|--------|
| `city` | `New Delhi` | Case-insensitive regex match |
| `type` | `LAWYER` or `CA` | Exact match on professionType |
| `verified` | `true` | Only isVerified=true profiles |
| `page` | `1` | Pagination page (default: 1) |
| `limit` | `20` | Results per page (default: 20) |

```bash
# All professionals
curl -X GET "http://localhost:5000/api/v1/professionals" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Verified Lawyers in Mumbai
curl -X GET "http://localhost:5000/api/v1/professionals?city=Mumbai&type=LAWYER&verified=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "665f...",
        "userId": "...",
        "fullName": "Advocate Sham Kumar",
        "professionType": "LAWYER",
        "city": "New Delhi",
        "experienceYears": 8,
        "specializations": ["Trademark"],
        "feeRange": "5k-10k",
        "isVerified": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### 6.3 Startup Profile Endpoints

---

#### PUT /startup/profile — Create or Update Startup Profile

**Auth:** STARTUP only

```bash
curl -X PUT http://localhost:5000/api/v1/startup/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"companyName\": \"TechVenture Pvt Ltd\",
    \"industry\": \"FinTech\",
    \"city\": \"Bangalore\",
    \"description\": \"B2B payment infrastructure startup serving 200+ SMBs\"
  }"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665f...",
    "userId": "665f1a2b...",
    "companyName": "TechVenture Pvt Ltd",
    "industry": "FinTech",
    "city": "Bangalore",
    "description": "B2B payment infrastructure startup..."
  }
}
```

---

#### GET /startup/profile/:userId — Get a Startup Profile

```bash
curl -X GET http://localhost:5000/api/v1/startup/profile/665f1a2b3c4d5e6f7a8b9c0d \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6.4 Service Request Endpoints

All require `authenticate`. Authorization varies per route.

---

#### POST /requests — Create a Service Request

**Auth:** STARTUP only

**Per-type blocking:** Before creating, checks for existing OPEN or ACCEPTED request in the same profession type category set.

```bash
# Create a Lawyer-type request (TRADEMARK)
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer STARTUP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category\": \"TRADEMARK\",
    \"description\": \"We need trademark registration for our brand name VouchPay across India and EU.\",
    \"city\": \"Bangalore\",
    \"budgetRange\": \"10k-20k\"
  }"

# Create a CA-type request -- can coexist with a Lawyer request
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer STARTUP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"category\": \"TAX_FILING\",
    \"description\": \"Annual GST returns and income tax filing for FY 2025-26. Company is a Pvt Ltd.\",
    \"city\": \"Bangalore\",
    \"budgetRange\": \"5k-8k\"
  }"
```

**Valid categories:**
- Lawyer: CONTRACT_REVIEW, TRADEMARK, LITIGATION, IP_PROTECTION, DUE_DILIGENCE
- CA: COMPANY_INCORPORATION, TAX_FILING, COMPLIANCE, OTHER

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "665f9a2b3c4d5e6f7a8b9c11",
    "createdByStartupUserId": "665f1a2b...",
    "category": "TRADEMARK",
    "description": "We need trademark registration...",
    "city": "Bangalore",
    "budgetRange": "10k-20k",
    "status": "OPEN",
    "endRequestedByStartup": false,
    "endRequestedByProfessional": false,
    "createdAt": "2026-04-20T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `409` — "You already have an active lawyer request. It must be completed before creating another."
- `400` — Validation errors (description too short, invalid category, etc.)

---

#### GET /requests/mine — Get My Requests (role-aware)

**Auth:** Any authenticated user

Returns different enriched data based on role:

```bash
# Startup: gets all their requests (ACCEPTED ones include professional details)
curl -X GET http://localhost:5000/api/v1/requests/mine \
  -H "Authorization: Bearer STARTUP_ACCESS_TOKEN"

# Professional: gets their accepted/closed jobs (enriched with startup company name)
curl -X GET http://localhost:5000/api/v1/requests/mine \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"
```

**Startup Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665f9a2b...",
      "category": "TRADEMARK",
      "status": "ACCEPTED",
      "city": "Bangalore",
      "budgetRange": "10k-20k",
      "assignedProfessional": {
        "fullName": "Advocate Sham Kumar",
        "professionType": "LAWYER",
        "city": "New Delhi",
        "feeRange": "5k-10k"
      },
      "endRequestedByStartup": false,
      "endRequestedByProfessional": false
    }
  ]
}
```

**Professional Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665f9a2b...",
      "category": "TRADEMARK",
      "status": "ACCEPTED",
      "startupCompanyName": "TechVenture Pvt Ltd",
      "startupPersonName": "Rahul Sharma",
      "city": "Bangalore",
      "budgetRange": "10k-20k",
      "description": "We need trademark registration..."
    }
  ]
}
```

---

#### GET /requests/open — Browse Open Job Board

**Auth:** LAWYER or CA only

Automatically filters categories by the caller's role. A CA only sees CA-type requests; a Lawyer only sees Lawyer-type requests.

```bash
# All open requests for this professional's type
curl -X GET "http://localhost:5000/api/v1/requests/open" \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"

# Filter by city
curl -X GET "http://localhost:5000/api/v1/requests/open?city=Bangalore" \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665f9a2b...",
      "category": "TRADEMARK",
      "description": "We need trademark registration for our brand...",
      "city": "Bangalore",
      "budgetRange": "10k-20k",
      "status": "OPEN",
      "startupCompanyName": "TechVenture Pvt Ltd",
      "startupPersonName": "Rahul Sharma"
    }
  ]
}
```

---

#### POST /requests/:id/accept — Accept a Request

**Auth:** LAWYER or CA only

**What happens:**
1. Verifies `status === 'OPEN'`
2. Sets `status = 'ACCEPTED'`, `assignedProfessionalUserId`, `acceptedAt`
3. Creates a `Chat` document (upsert — no duplicates)
4. Returns updated request

```bash
curl -X POST http://localhost:5000/api/v1/requests/665f9a2b3c4d5e6f7a8b9c11/accept \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Request accepted",
  "data": {
    "_id": "665f9a2b...",
    "status": "ACCEPTED",
    "assignedProfessionalUserId": "665f1a2c...",
    "acceptedAt": "2026-04-20T14:00:00.000Z"
  }
}
```

---

#### POST /requests/:id/reject — Reject a Request

**Auth:** LAWYER or CA only

```bash
curl -X POST http://localhost:5000/api/v1/requests/665f9a2b3c4d5e6f7a8b9c11/reject \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"reason\": \"This falls under corporate law, outside my practice area of IP law.\"}"
```

**What happens:**
- `status = 'REJECTED'`, `rejectionReason` stored, `rejectedAt = now`
- Per-type block is cleared for the startup (they can create a new same-type request)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665f9a2b...",
    "status": "REJECTED",
    "rejectionReason": "This falls under corporate law..."
  }
}
```

---

#### POST /requests/:id/close — Close a Request

**Auth:** STARTUP only

Direct close. Only valid for ACCEPTED requests. Use `/request-end` for the mutual cooperative close.

```bash
curl -X POST http://localhost:5000/api/v1/requests/665f9a2b3c4d5e6f7a8b9c11/close \
  -H "Authorization: Bearer STARTUP_ACCESS_TOKEN"
```

---

#### POST /requests/:id/request-end — Mutual End-Service Confirmation

**Auth:** STARTUP, LAWYER, or CA

Both parties must call this endpoint independently. Status only becomes CLOSED when **both** confirm.

**Logic:**
- Caller is STARTUP → `endRequestedByStartup = true`
- Caller is LAWYER/CA → `endRequestedByProfessional = true`
- Both flags true → `status = 'CLOSED'`, `closedAt = now`

```bash
# Step 1: Startup requests end (status stays ACCEPTED)
curl -X POST http://localhost:5000/api/v1/requests/665f9a2b3c4d5e6f7a8b9c11/request-end \
  -H "Authorization: Bearer STARTUP_ACCESS_TOKEN"

# Step 2: Professional confirms (this triggers CLOSED)
curl -X POST http://localhost:5000/api/v1/requests/665f9a2b3c4d5e6f7a8b9c11/request-end \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"
```

**Response when first party confirms (still ACCEPTED):**
```json
{
  "success": true,
  "message": "End-of-service requested. Waiting for the other party to confirm.",
  "data": {
    "status": "ACCEPTED",
    "endRequestedByStartup": true,
    "endRequestedByProfessional": false
  }
}
```

**Response when both confirm (CLOSED):**
```json
{
  "success": true,
  "message": "Service ended. Request is now closed.",
  "data": {
    "status": "CLOSED",
    "endRequestedByStartup": true,
    "endRequestedByProfessional": true,
    "closedAt": "2026-04-20T18:30:00.000Z"
  }
}
```

---

#### GET /requests/startup/:userId/profile — Get Startup Info

**Auth:** LAWYER or CA only

Used by StartupDetailScreen. Returns company profile + person info in one call.

```bash
curl -X GET http://localhost:5000/api/v1/requests/startup/665f1a2b3c4d5e6f7a8b9c0d/profile \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "companyName": "TechVenture Pvt Ltd",
    "industry": "FinTech",
    "city": "Bangalore",
    "description": "B2B payment infrastructure startup...",
    "personName": "Rahul Sharma",
    "email": "rahul@mystartup.com"
  }
}
```

---

### 6.5 Chat Endpoints

---

#### GET /chats/by-request/:requestId — Get Chat by Request ID

Fetches the Chat document for a given requestId. Asserts caller is a participant (403 otherwise).

```bash
curl -X GET http://localhost:5000/api/v1/chats/by-request/665f9a2b3c4d5e6f7a8b9c11 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665faa2b...",
    "requestId": "665f9a2b...",
    "startupUserId": "665f1a2b...",
    "professionalUserId": "665f1a2c...",
    "createdAt": "2026-04-20T14:00:00.000Z"
  }
}
```

---

#### GET /chats/:chatId — Get Enriched Chat Detail

Returns the chat with participant names already resolved (names, professional type). The ChatScreen uses this single endpoint to populate the header and message labels.

```bash
curl -X GET http://localhost:5000/api/v1/chats/665faa2b3c4d5e6f7a8b9c22 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "665faa2b...",
    "requestId": "665f9a2b...",
    "startupUserId": "665f1a2b...",
    "professionalUserId": "665f1a2c...",
    "startupName": "TechVenture Pvt Ltd",
    "startupPersonName": "Rahul Sharma",
    "professionalName": "Advocate Sham Kumar",
    "professionalType": "LAWYER"
  }
}
```

---

### 6.6 Message Endpoints

---

#### GET /messages/:chatId — Get Message History

Returns paginated messages sorted oldest-first (like WhatsApp).

```bash
curl -X GET "http://localhost:5000/api/v1/messages/665faa2b3c4d5e6f7a8b9c22?page=1&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "665fbb2b...",
      "chatId": "665faa2b...",
      "senderId": "665f1a2c...",
      "text": "Hello, I can help with your trademark registration.",
      "createdAt": "2026-04-20T14:05:00.000Z"
    },
    {
      "_id": "665fbb2c...",
      "chatId": "665faa2b...",
      "senderId": "665f1a2b...",
      "text": "Great! Can we start with the documentation checklist?",
      "createdAt": "2026-04-20T14:07:00.000Z"
    }
  ]
}
```

---

#### POST /messages/:chatId — Send a Message (HTTP fallback)

HTTP-based alternative to Socket.IO. Persists message but does NOT emit Socket.IO event. Use Socket.IO for real-time delivery; this is for testing/fallback only.

```bash
curl -X POST http://localhost:5000/api/v1/messages/665faa2b3c4d5e6f7a8b9c22 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Please share your brand name and logo files.\"}"
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "665fbb2d...",
    "chatId": "665faa2b...",
    "senderId": "665f1a2c...",
    "text": "Please share your brand name and logo files.",
    "createdAt": "2026-04-20T14:10:00.000Z"
  }
}
```

---

### 6.7 Verification Submission Endpoint

---

#### POST /professional/verification/submit — Submit Documents

**Auth:** LAWYER or CA only
**Content-Type:** multipart/form-data
**Field name for files:** `docs` (1 to 3 files, max 5 MB each)

Files go to Cloudinary via memory buffer (never written to disk). Cloudinary returns `secure_url` strings stored in the database.

```bash
# Single document
curl -X POST http://localhost:5000/api/v1/professional/verification/submit \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN" \
  -F "docs=@/path/to/bar_council_cert.pdf"

# Multiple documents
curl -X POST http://localhost:5000/api/v1/professional/verification/submit \
  -H "Authorization: Bearer PROFESSIONAL_ACCESS_TOKEN" \
  -F "docs=@/path/to/degree_certificate.pdf" \
  -F "docs=@/path/to/bar_council_id.pdf" \
  -F "docs=@/path/to/photo_id.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Verification documents submitted successfully",
  "data": {
    "_id": "665fcc2b...",
    "professionalUserId": "665f1a2c...",
    "docUrls": [
      "https://res.cloudinary.com/vouch/image/upload/v1234/docs/bar_council_cert.pdf",
      "https://res.cloudinary.com/vouch/image/upload/v1234/docs/bar_council_id.pdf"
    ],
    "status": "PENDING",
    "submittedAt": "2026-04-20T15:00:00.000Z"
  }
}
```

**Error Response:**
- `409` — "You already have a pending verification request"

---

### 6.8 Admin Endpoints

All require `authenticate` AND `authorize('ADMIN')`. Any other role → `403 Forbidden`.

---

#### GET /admin/verifications — List All Verification Requests

```bash
# All verifications
curl -X GET "http://localhost:5000/api/v1/admin/verifications" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"

# Filter by status
curl -X GET "http://localhost:5000/api/v1/admin/verifications?status=PENDING" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Success Response (200):**

Note: `professionalUserId` is **populated** — returns the full User object, not just the ID.

```json
{
  "success": true,
  "data": [
    {
      "_id": "665fcc2b...",
      "professionalUserId": {
        "_id": "665f1a2c...",
        "name": "Advocate Sham Kumar",
        "email": "sham@lawfirm.com",
        "role": "LAWYER"
      },
      "docUrls": ["https://res.cloudinary.com/vouch/..."],
      "status": "PENDING",
      "submittedAt": "2026-04-20T15:00:00.000Z"
    }
  ]
}
```

---

#### POST /admin/verifications/:id/approve — Approve

**What happens internally:**
1. Check `status === 'PENDING'`
2. Set `status = 'APPROVED'`, `reviewedBy = adminUserId`, `reviewedAt = now`
3. `ProfessionalProfile.findOneAndUpdate({ userId }, { isVerified: true })` → enables green ✓ badge

```bash
curl -X POST http://localhost:5000/api/v1/admin/verifications/665fcc2b3c4d5e6f7a8b9c33/approve \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification approved",
  "data": {
    "_id": "665fcc2b...",
    "status": "APPROVED",
    "reviewedAt": "2026-04-21T09:00:00.000Z"
  }
}
```

---

#### POST /admin/verifications/:id/reject — Reject

```bash
curl -X POST http://localhost:5000/api/v1/admin/verifications/665fcc2b3c4d5e6f7a8b9c33/reject \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"note\": \"The uploaded documents are blurry and unreadable. Please resubmit clear scans.\"}"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "_id": "665fcc2b...",
    "status": "REJECTED",
    "adminNote": "The uploaded documents are blurry...",
    "reviewedAt": "2026-04-21T09:15:00.000Z"
  }
}
```

---

### 6.9 Health Check

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{ "status": "ok", "timestamp": "2026-04-20T10:00:00.000Z" }
```

---

## 7. Backend — Core Components Deep Dive

### 7.1 Authentication & JWT

**Two tokens issued on every login/register/refresh:**

| Token | Secret | Expiry | Stored On Client |
|-------|--------|--------|-----------------|
| Access Token | `JWT_ACCESS_SECRET` | 15 minutes | Redux state + Keychain |
| Refresh Token | `JWT_REFRESH_SECRET` | 7 days | Keychain only |

**JWT Payload (both tokens):**
```typescript
{ userId: string, role: 'STARTUP' | 'LAWYER' | 'CA' | 'ADMIN' }
```

The payload is signed (HMAC-SHA256) and Base64-encoded. It's readable but cannot be tampered with without invalidating the signature.

**`authenticate` middleware:**
```typescript
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Must be exactly: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'No token provided', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = verifyAccessToken(token);  // throws if expired/invalid
    next();
  } catch {
    sendError(res, 'Invalid or expired token', 401);
  }
};
```

**`authorize` middleware:**
```typescript
export const authorize = (...roles: string[]) =>
  (req, res, next) => {
    if (!roles.includes(req.user!.role)) {
      return sendError(res, 'Access denied', 403);
    }
    next();
  };
```

---

### 7.2 Request Blocking Logic (Per-Type)

```typescript
// Exact code from request.service.ts
const LAWYER_BLOCK_CATS = ['CONTRACT_REVIEW','TRADEMARK','LITIGATION','IP_PROTECTION','DUE_DILIGENCE'];
const CA_BLOCK_CATS     = ['COMPANY_INCORPORATION','TAX_FILING','COMPLIANCE','OTHER'];

const isLawyerCat = LAWYER_BLOCK_CATS.includes(data.category);
const blockSet    = isLawyerCat ? LAWYER_BLOCK_CATS : CA_BLOCK_CATS;
const profType    = isLawyerCat ? 'lawyer' : 'CA';

const active = await ServiceRequest.findOne({
  createdByStartupUserId: startupUserId,
  status: { $in: ['OPEN', 'ACCEPTED'] },
  category: { $in: blockSet },   // only checks SAME type category set
});
if (active) throw new Error(`You already have an active ${profType} request...`); // 409
```

**Result:**
- TRADEMARK request → checks for active requests in LAWYER_BLOCK_CATS → blocks if found
- TAX_FILING request → checks for active requests in CA_BLOCK_CATS → blocks if found
- TAX_FILING while TRADEMARK is active → passes (different type sets)

---

### 7.3 Real-Time Chat — Socket.IO

**Authentication on connect:**
```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication token missing'));
  try {
    socket.data.user = verifyAccessToken(token);
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});
```

**`chat:join` event:**
```
Client: socket.emit('chat:join', chatId)
Server: finds Chat, checks participant membership, socket.join(chatId)
        emits back: socket.emit('chat:joined', { chatId })
```

**`message:send` event:**
```
Client: socket.emit('message:send', { chatId, text })
Server: validates payload (non-empty, <= 2000 chars)
        checks participant membership
        Message.create({ chatId, senderId, text })
        io.to(chatId).emit('message:new', savedMessage)
        -- both sender AND receiver get this event
```

---

### 7.4 File Upload — Cloudinary

Multer configured with `memoryStorage()` — no files written to disk:

```typescript
const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { files: 3, fileSize: 5 * 1024 * 1024 } });
```

Cloudinary stream upload from memory buffer:
```typescript
const stream = cloudinary.uploader.upload_stream(
  { folder: 'vouch/verification-docs', resource_type: 'auto' },
  (error, result) => resolve(result!.secure_url)
);
stream.end(buffer);
```

The `secure_url` (HTTPS link to Cloudinary CDN) is stored in `VerificationRequest.docUrls`.

---

### 7.5 Error Handling Strategy

Every service function throws with a custom status code:
```typescript
throw Object.assign(new Error('Human-readable message'), { statusCode: 409 });
```

The global `errorHandler`:
```typescript
export const errorHandler = (err, req, res, next) => {
  const status  = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
};
```

Standardised response format:
```typescript
// All successes:  { success: true,  message?: string, data: T }
// All errors:     { success: false, message: string }
sendSuccess(res, data, 'Optional message', 200);
sendError(res, 'Error description', 400);
```

---

### 7.6 Rate Limiting & Security Headers

**Auth Rate Limiter:**
```typescript
// 10 requests per 60 seconds per IP on /auth/login and /auth/register
const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests. Please wait.' },
});
```

**Helmet security headers on every response:**

| Header | Value | Protects Against |
|--------|-------|-----------------|
| X-Frame-Options | DENY | Clickjacking |
| X-XSS-Protection | 1; mode=block | Reflected XSS |
| X-Content-Type-Options | nosniff | MIME sniffing |
| Referrer-Policy | no-referrer | Referrer leakage |
| Content-Security-Policy | default-src 'self' | Script injection |

---

## 8. Frontend — Project Structure

```
VouchFrontend/
+-- App.tsx                     -- Root: QueryClient + Redux Provider + NavigationContainer
+-- index.js                    -- Entry point (registers App component)
|
+-- src/
    +-- api/                    -- HTTP call functions, one file per resource
    |   +-- client.ts           -- Axios instance + interceptors
    |   +-- authApi.ts          -- register, login, refreshToken, getMe
    |   +-- requestApi.ts       -- create, mine, open, accept, reject, close, requestEnd
    |   +-- professionalApi.ts  -- upsertProfile, getProfile, listDirectory
    |   +-- startupApi.ts       -- upsertProfile, getProfile
    |   +-- chatApi.ts          -- getChatByRequest, getChat
    |   +-- messageApi.ts       -- getMessages, sendMessage
    |   +-- verificationApi.ts  -- submitVerification
    |   +-- adminApi.ts         -- listVerifications, approve, reject
    |
    +-- components/             -- Reusable UI components
    |   +-- common/
    |   |   +-- AppButton.tsx   -- Primary / outline / ghost variants
    |   |   +-- AppInput.tsx    -- Text input: label, error, rightElement (eye icon)
    |   |   +-- AppLoader.tsx   -- Full-screen spinner
    |   |   +-- SafeScreen.tsx  -- SafeAreaView + scroll-safe background
    |   |   +-- EyeIcon.tsx     -- Password toggle (monkey emoji: hidden / visible)
    |   +-- professional/
    |       +-- ProfessionalCard.tsx  -- Directory listing card
    |
    +-- features/               -- Screens grouped by role
    |   +-- auth/screens/
    |   |   +-- LandingScreen.tsx
    |   |   +-- RegisterScreen.tsx
    |   |   +-- OnboardingScreen.tsx
    |   +-- startup/screens/
    |   |   +-- DirectoryScreen.tsx
    |   |   +-- ProfessionalDetailScreen.tsx
    |   |   +-- CreateRequestScreen.tsx
    |   |   +-- MyRequestsScreen.tsx
    |   |   +-- StartupProfileScreen.tsx
    |   +-- professional/screens/
    |   |   +-- OpenRequestsScreen.tsx
    |   |   +-- StartupDetailScreen.tsx
    |   |   +-- AcceptedRequestsScreen.tsx
    |   |   +-- VerificationUploadScreen.tsx
    |   |   +-- LawyerProfileScreen.tsx / CAProfileScreen.tsx
    |   +-- admin/screens/
    |   |   +-- AdminDashboardScreen.tsx
    |   +-- chat/screens/
    |       +-- ChatScreen.tsx
    |
    +-- hooks/
    |   +-- useAuth.ts          -- login, logout, completeAuth helpers
    |   +-- useSocket.ts        -- Socket.IO connect/disconnect lifecycle
    |
    +-- navigation/
    |   +-- RootNavigator.tsx   -- Reads auth state, picks navigator
    |   +-- AuthNavigator.tsx   -- Landing -> Register -> Onboarding
    |   +-- StartupNavigator.tsx
    |   +-- ProfessionalNavigator.tsx
    |   +-- AdminNavigator.tsx
    |   +-- types.ts            -- TypeScript screen param types
    |
    +-- store/
    |   +-- index.ts            -- configureStore()
    |   +-- authSlice.ts        -- setAuth, setTokens, setUser, logout reducer
    |   +-- hooks.ts            -- useAppDispatch, useAppSelector (typed)
    |
    +-- types/
    |   +-- index.ts            -- User, ServiceRequest, ProfessionalProfile, Chat, Message
    |
    +-- utils/
        +-- constants.ts        -- API_BASE_URL, SOCKET_URL, COLORS, CATEGORIES
        +-- tokenStorage.ts     -- Keychain wrapper: save/get/clear tokens
```

---

## 9. Frontend — Navigation Tree

```
RootNavigator
|   (reads Redux: isAuthenticated + role)
|
+-- [Not authenticated] ---> AuthNavigator (Stack)
|                              +-- LandingScreen      <- Default screen
|                              +-- RegisterScreen
|                              +-- OnboardingScreen
|
+-- [role === 'STARTUP'] ---> StartupNavigator (Stack)
|                              +-- StartupTabs (Bottom Tabs)
|                              |    +-- Directory   -> DirectoryScreen
|                              |    +-- MyRequests  -> MyRequestsScreen
|                              |    +-- Profile     -> StartupProfileScreen
|                              +-- ProfessionalDetail  (userId param)
|                              +-- CreateRequest
|                              +-- Chat               (chatId, requestId params)
|
+-- [role === 'LAWYER' or 'CA'] ---> ProfessionalNavigator (Stack)
|                                     +-- ProfessionalTabs (Bottom Tabs)
|                                     |    +-- OpenRequests -> OpenRequestsScreen
|                                     |    +-- MyJobs       -> AcceptedRequestsScreen
|                                     |    +-- Profile      -> LawyerProfileScreen
|                                     +-- StartupDetail   (requestId, startupUserId)
|                                     +-- VerificationUpload
|                                     +-- Chat
|
+-- [role === 'ADMIN'] ---> AdminNavigator
                             +-- AdminTabs (Bottom Tabs)
                                  +-- Verifications -> AdminDashboardScreen
```

**Bootstrap sequence (RootNavigator useEffect):**
```typescript
const bootstrap = async () => {
  dispatch(setLoading(true));
  try {
    const accessToken  = await getAccessToken();   // Keychain
    const refreshToken = await getRefreshToken();
    if (!accessToken) return;                       // no tokens -> auth screen

    const { data } = await authApi.getMe();         // GET /auth/me
    dispatch(setAuth({ user: data.data, accessToken, refreshToken, isAuthenticated: true }));
  } catch {
    await clearTokens();                            // bad token -> force auth
  } finally {
    dispatch(setLoading(false));
  }
};
```

---

## 10. Frontend — Screens Deep Dive

### 10.1 Auth Screens

#### LandingScreen

Entry point. Shows Vouch brand, tagline, feature bullets. Two CTAs: "Get Started" (Register) and "Sign In" (Login form on same screen).

Password field uses `AppInput` with `secureTextEntry` and `rightElement={<EyeIcon visible={showPassword} />}`.

**Critical fix — wrong password error:** The Axios 401 interceptor previously intercepted login failures and tried to refresh tokens, hiding the real error. Fix: interceptor now checks `isAuthEndpoint`:

```typescript
const isAuthEndpoint =
  originalRequest.url?.includes('/auth/login') ||
  originalRequest.url?.includes('/auth/register');

if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
  // do the refresh...
}
// For auth endpoints, 401 falls through to the catch block in the screen
// which shows "Password is incorrect" correctly
```

---

#### RegisterScreen

Form: name, email, password (with toggle), role picker (STARTUP / LAWYER / CA cards).

**On success:** Does NOT dispatch `setAuth` yet. Navigates to `OnboardingScreen` passing `{ role, user, accessToken, refreshToken }` as params. Tokens are needed for the authenticated profile creation call during onboarding.

---

#### OnboardingScreen

Two forms in one screen (conditional on `route.params.role`):

- STARTUP: companyName, industry, city, description → `PUT /startup/profile`
- LAWYER/CA: fullName, city, experienceYears, specializations, licenseNumber, feeRange → `PUT /professional/profile`

After profile saved:
```typescript
dispatch(setAuth({ user, accessToken, refreshToken, isAuthenticated: true }));
await saveTokens(accessToken, refreshToken);
// RootNavigator detects isAuthenticated → navigates to role-appropriate app
```

---

### 10.2 Startup Screens

#### DirectoryScreen

- City input (debounced 500ms)
- Type filter: All / Lawyer / CA
- `useQuery(['directory', city, type])` — re-fetches when filters change
- Each `ProfessionalCard`: avatar, name, ✓ Verified badge, type, city, specializations, fee
- Tap → ProfessionalDetailScreen

#### ProfessionalDetailScreen

- `useQuery(['professional', userId])` → GET /professional/profile/:userId
- Shows full profile
- "Create Service Request" button → CreateRequestScreen

#### CreateRequestScreen

**Active request guard:** Queries `/requests/mine` on mount. Three banner states:
1. Both Lawyer and CA active → "⚠️ All Services Requested"
2. Lawyer active + selected Lawyer category → "⚠️ Active Lawyer Request Exists — consider CA service"
3. CA active + selected CA category → "⚠️ Active CA Request Exists — consider Lawyer service"

Form: category picker (grouped), description (min 20 chars), city, budget range.

After submit: `queryClient.invalidateQueries({ queryKey: ['myRequests'] })` → navigate back.

#### MyRequestsScreen

SectionList: "⚖️ Lawyer Requests" + "📊 CA Requests"

`+New` button → `StartupTabs` → `Directory` tab (not CreateRequest directly).

Per-status card content:
- OPEN: orange badge, request details
- ACCEPTED: blue badge, assigned professional info, "💬 Open Chat" + "Request End Service" buttons, mutual confirmation banners
- CLOSED: grey badge + green "✅ Service completed" box
- REJECTED: red badge + red box with rejection reason

---

### 10.3 Professional Screens

#### OpenRequestsScreen

- `GET /requests/open` (backend role-filters)
- Each card: category, company name, person name, description, city, budget
- Tap card → StartupDetailScreen
- Quick Reject button → Modal for reason → `POST /requests/:id/reject`
- Pull to refresh

#### StartupDetailScreen

Two parallel queries loaded simultaneously:
1. cached `['openRequests']` data — for request details
2. `['startupProfile', createdByStartupUserId]` → `GET /requests/startup/:userId/profile`

Two action buttons at bottom:
- ✓ Accept Job (green) → POST accept → navigate to ChatScreen
- ✗ Reject (red outline) → Modal → POST reject → goBack()

#### AcceptedRequestsScreen

SectionList: "Active Jobs" (ACCEPTED) + "History" (CLOSED/REJECTED)

Active jobs: ACCEPTED badge, company/person names, description, chat button, end-service button, mutual pending banners.

History: CLOSED → green "✅ Service completed"; REJECTED → red badge.

#### VerificationUploadScreen

1. "Pick Documents" → native file picker, up to 3 files
2. Each file listed with remove button
3. "Submit for Review" → builds FormData → `POST /professional/verification/submit`
4. Success → Alert → navigate back to Profile

---

### 10.4 Admin Screens

#### AdminDashboardScreen

- `GET /admin/verifications?status=PENDING`
- Per-card: professional name/email, document count, tappable URL chips, Approve/Reject buttons
- Approve: `Alert.alert` confirm → `useMutation` → `POST approve` → `invalidateQueries`
- Reject: `TextInput` modal → `POST reject` → `invalidateQueries`

---

### 10.5 Shared — Chat Screen

Used by both startup and professional.

**Three data sources:**
1. `useQuery(['chatInfo', chatId])` → `GET /chats/:chatId` — participant names for header
2. `useQuery(['messages', chatId])` → `GET /messages/:chatId` — history on load
3. `useSocket(chatId, onNewMessage)` — Socket.IO for live delivery

**Message rendering:**
```typescript
const isMine = message.senderId === currentUserId;
// isMine  → right-aligned blue bubble
// !isMine → left-aligned grey bubble
```

**Sender label:**
- Startup sender: Company name (bold) + person name (small)
- Professional sender: Full name (bold) + type ("LAWYER" / "CA")

**Send flow:**
1. `socket.emit('message:send', { chatId, text })`
2. Server saves + broadcasts `message:new`
3. `onNewMessage` appends to `localMessages` + `FlatList.scrollToEnd()`

**TanStack Query v5 note:** Uses `useEffect` watching `messagesData` to seed `localMessages` (v5 removed `onSuccess` callback from useQuery).

---

## 11. Frontend — State Management

### Redux — Auth State Only

```typescript
interface AuthState {
  user:            User | null;
  accessToken:     string | null;
  refreshToken:    string | null;
  isLoading:       boolean;       // true during app bootstrap
  isAuthenticated: boolean;
}
```

| Action | When Dispatched |
|--------|----------------|
| `setAuth` | Login, Register+Onboarding complete, Bootstrap success |
| `setTokens` | After /auth/refresh (Axios interceptor) |
| `setUser` | After profile update |
| `logout` | Logout button; also when refresh token fails |
| `setLoading` | Bootstrap start/end |

### TanStack Query — All Server Data

| Query Key | Endpoint | Used By |
|-----------|----------|---------|
| `['directory', city, type]` | GET /professionals | DirectoryScreen |
| `['professional', userId]` | GET /professional/profile/:id | ProfessionalDetailScreen |
| `['myRequests']` | GET /requests/mine | MyRequestsScreen |
| `['openRequests']` | GET /requests/open | OpenRequestsScreen |
| `['myJobs']` | GET /requests/mine | AcceptedRequestsScreen |
| `['startupProfile', userId]` | GET /requests/startup/:id/profile | StartupDetailScreen |
| `['chatInfo', chatId]` | GET /chats/:chatId | ChatScreen |
| `['messages', chatId]` | GET /messages/:chatId | ChatScreen |
| `['verifications']` | GET /admin/verifications | AdminDashboardScreen |

---

## 12. Frontend — API Layer & Token Lifecycle

### Axios Configuration (`src/api/client.ts`)

```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,   // 'http://10.0.2.2:5000/api/v1'
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});
```

### Request Interceptor — Auto-attach Token

```typescript
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();  // from Keychain
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Response Interceptor — Auto-Refresh on 401

```typescript
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Skip auth endpoints -- their 401s are real failures (bad password etc.)
    const isAuthEndpoint =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getRefreshToken();
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        await saveTokens(data.data.accessToken, data.data.refreshToken);
        store.dispatch(setTokens(data.data));

        // Replay original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        store.dispatch(logout());
        await clearTokens();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
```

### Secure Token Storage

```typescript
// src/utils/tokenStorage.ts  (wraps react-native-keychain)
saveTokens(access, refresh)  // username=access, password=refresh
getAccessToken()             // reads username field
getRefreshToken()            // reads password field
clearTokens()                // deletes on logout

// Platform security:
// iOS:     Hardware-backed iOS Keychain
// Android: Android Keystore / EncryptedSharedPreferences (API 23+)
```

---

## 13. Complete End-to-End User Flows

### Flow A: Startup registers, hires a Lawyer, chats, closes

```
1. Open app -> LandingScreen (no tokens)
2. "Get Started" -> RegisterScreen
3. Fill: name/email/password, role=STARTUP
4. POST /auth/register -> { accessToken, refreshToken, user }
5. Navigate to OnboardingScreen (tokens as params, NOT in Redux yet)
6. Fill company profile -> PUT /startup/profile
7. completeAuth() -> dispatch(setAuth) + saveTokens()
8. RootNavigator: isAuthenticated + STARTUP -> StartupNavigator

9. DirectoryScreen: filter city=Bangalore, type=LAWYER
   GET /professionals?city=Bangalore&type=LAWYER
10. Tap "Advocate Sham" -> ProfessionalDetailScreen
    GET /professional/profile/:userId

11. "Create Service Request" -> CreateRequestScreen
    GET /requests/mine -> no active Lawyer request -> form enabled
12. Fill: category=TRADEMARK, description, city, budget
13. POST /requests -> ServiceRequest(OPEN)
14. Navigate back -> MyRequestsScreen shows OPEN request

15. [Advocate Sham's device] OpenRequestsScreen
    GET /requests/open -> sees TRADEMARK request
16. Taps request -> StartupDetailScreen
    GET /requests/startup/:userId/profile
17. Taps "Accept Job"
    POST /requests/:id/accept -> ACCEPTED + Chat created

18. [Rahul's device] MyRequestsScreen: status = ACCEPTED
    Taps "Open Chat" -> GET /chats/by-request/:requestId -> chatId
    Navigate to ChatScreen

19. [Both devices] Socket.IO chat:
    socket.emit('chat:join', chatId)
    socket.emit('message:send', { chatId, text })
    io.to(chatId).emit('message:new', ...) -> both receive

20. Work done. Rahul taps "Request End Service"
    POST /requests/:id/request-end -> endRequestedByStartup = true

21. Sham sees "Startup has requested end-of-service" banner
    Confirms -> POST /requests/:id/request-end
    Both flags true -> status = CLOSED

22. MyRequestsScreen: green "Service completed" banner
```

### Flow B: Professional gets verified

```
1. CA Priya logs in -> ProfessionalNavigator
2. Profile tab -> "Get Verified" -> VerificationUploadScreen
3. Picks 2 documents (ICAI cert, PAN card)
4. POST /professional/verification/submit (multipart)
   -> Cloudinary upload -> VerificationRequest(PENDING)

5. [Admin] AdminDashboardScreen
   GET /admin/verifications?status=PENDING -> Priya's card
6. Opens documents (Linking.openURL), verifies
7. Taps "Approve" -> Alert confirm
   POST /admin/verifications/:id/approve
   -> VerificationRequest.status = APPROVED
   -> ProfessionalProfile.isVerified = true

8. Priya's directory card now shows Verified badge
9. Startups filtering verified=true now see her
```

---

## 14. Socket.IO — Client Integration Guide

### Connection Setup

```typescript
// src/hooks/useSocket.ts
const socket = io(SOCKET_URL, {
  auth: { token: accessToken },   // JWT in handshake -- rejected if invalid
  transports: ['websocket'],       // skip polling upgrade
});

socket.on('connect', () => {
  socket.emit('chat:join', chatId);       // subscribe to room
});

socket.on('chat:joined', ({ chatId }) => {
  console.log('Joined:', chatId);
});

socket.on('message:new', (message) => {
  setMessages(prev => [...prev, message]);
  flatListRef.current?.scrollToEnd({ animated: true });
});

socket.on('error', ({ message }) => {
  console.warn('Socket error:', message);
});

// Cleanup on screen unmount:
socket.disconnect();
```

### Sending a Message

```typescript
socket.emit('message:send', {
  chatId: '665faa2b...',
  text: 'Hello, when can we start?'
});
// Server saves to DB + broadcasts 'message:new' to all room members
```

---

## 15. Environment Variables Reference

**File:** `VouchBackend/.env`

| Variable | Required | Example Value | Purpose |
|----------|----------|--------------|---------|
| `PORT` | No | `5000` | HTTP server port |
| `NODE_ENV` | No | `development` | Logging level and error verbosity |
| `MONGODB_URI` | YES | `mongodb+srv://user:pass@cluster.mongodb.net/vouch` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | YES | `(32+ random chars)` | Signs access tokens |
| `JWT_REFRESH_SECRET` | YES | `(32+ different chars)` | Signs refresh tokens |
| `JWT_ACCESS_EXPIRES` | No | `15m` | Access token lifespan |
| `JWT_REFRESH_EXPIRES` | No | `7d` | Refresh token lifespan |
| `CLOUDINARY_CLOUD_NAME` | YES | `mycloud` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | YES | `123456789012345` | Cloudinary key |
| `CLOUDINARY_API_SECRET` | YES | `abcDEFghiJKL...` | Cloudinary secret |
| `ADMIN_SEED_EMAIL` | YES | `admin@vouch.com` | Admin account email |
| `ADMIN_SEED_PASSWORD` | YES | `Admin@1234` | Admin account password |
| `ALLOWED_ORIGINS` | No | `""` (empty = all) | CORS whitelist |

**Frontend:** No .env file. Single configurable value:

```typescript
// VouchFrontend/src/utils/constants.ts
const DEV_HOST = '10.0.2.2';           // Android emulator -> host localhost
// const DEV_HOST = '192.168.1.x';     // Physical device -> PC LAN IP
// const DEV_HOST = 'localhost';        // iOS simulator
export const API_BASE_URL = `http://${DEV_HOST}:5000/api/v1`;
export const SOCKET_URL   = `http://${DEV_HOST}:5000`;
```

---

## 16. Running the Project

### Start Backend

```bash
cd VouchBackend
npm install                  # first time only
npm run seed:admin           # first time only -- creates admin account
npm run dev                  # development server with hot-reload
```

Verify: `curl http://localhost:5000/health` -> `{ "status": "ok" }`

### Start Frontend on Android Emulator

**Terminal 1 — Launch emulator:**
```bash
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_9_Pro_XL
```

**Terminal 2 — Metro bundler:**
```bash
cd VouchFrontend
npx react-native start
```

**Terminal 3 — Build & install:**
```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:5000 tcp:5000
cd VouchFrontend
npx react-native run-android
```

### Run on Two Emulators Simultaneously

```bash
# Launch both
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_7_Pro      # emulator-5554
$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe -avd Pixel_9_Pro_XL   # emulator-5556

# Port forwarding for both
adb -s emulator-5554 reverse tcp:8081 tcp:8081
adb -s emulator-5554 reverse tcp:5000 tcp:5000
adb -s emulator-5556 reverse tcp:8081 tcp:8081
adb -s emulator-5556 reverse tcp:5000 tcp:5000

# Metro (once, serves both)
cd VouchFrontend && npx react-native start

# Install on each
npx react-native run-android --device emulator-5554
npx react-native run-android --device emulator-5556
```

### Run on Physical Android Device

1. Enable Developer Mode (tap Build Number 7 times) + USB Debugging
2. Connect via USB, tap "Allow" on phone
3. Find PC LAN IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
4. Edit `VouchFrontend/src/utils/constants.ts`: `const DEV_HOST = '192.168.x.x'`
5. Open firewall:
   ```powershell
   New-NetFirewallRule -DisplayName "Vouch Backend" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow
   ```
6. `cd VouchFrontend && npx react-native start`
7. `npx react-native run-android`

### Backend npm Scripts

```bash
npm run dev         # development server (ts-node-dev, hot-reload)
npm run build       # compile TypeScript -> dist/
npm run start       # run compiled dist/server.js (production)
npm run seed:admin  # create/update admin account
npm run test        # Jest + Supertest integration tests
```

### Frontend npm Scripts

```bash
npx react-native start             # Metro bundler
npx react-native run-android       # build + install on connected device/emulator
npx react-native run-android --device emulator-5554   # specific device
npx react-native run-ios           # iOS (macOS only)
npm run test                       # Jest unit tests
npm run lint                       # ESLint
```

### Docker (Backend)

```bash
cd VouchBackend
docker build -t vouch-backend .
docker run -p 5000:5000 --env-file .env vouch-backend
```

---

*End of Project Documentation*
*Project: Vouch — BCA Major Project, Jamia Hamdard | April 2026*
