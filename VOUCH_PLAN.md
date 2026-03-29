# Vouch — Full Project Plan (Industrial Level)

> **Application:** Vouch — A verified directory + request system that connects Startups with verified Lawyers/CAs, with profiles, search, service requests, and real-time chat.

---

## 1. Product Summary

| Item | Detail |
|---|---|
| App Name | **Vouch** |
| Platform | Mobile only (React Native CLI) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| Auth | JWT (Access Token + Refresh Token) |
| Real-time | Socket.IO |
| Repos | Two separate repos: `VouchBackend` + `VouchMobile` |

---

## 2. Roles & Permissions

### Startup
- Create startup profile
- Search/browse professionals (directory)
- Create service requests
- Chat with professional after request is accepted
- Close service requests

### Professional (Lawyer / CA)
- Create professional profile
- Submit verification documents (1–3 files)
- Browse open requests (verified only)
- Accept requests (first come, first served)
- Chat with startup after request is accepted

### Admin
- Single admin account (seeded via script)
- Review verification documents (approve / reject with note)
- View reported users (optional, minimal)

---

## 3. Must-Have Features

### A) Authentication
- Email + password login
- Role selection at signup: `STARTUP | LAWYER | CA`
- JWT access token (15min) + refresh token (7d)

### B) Profiles

**Startup Profile Fields**
- `companyName`
- `industry`
- `city`
- `description`

**Professional Profile Fields**
- `fullName`
- `professionType`: `LAWYER | CA`
- `city`
- `experienceYears`
- `specializations[]` (max 5)
- `licenseNumber`
- `feeRange` (optional, e.g. "₹2k–₹10k")
- `isVerified` (boolean, default false)

### C) Verification (Manual)
- Professionals upload 1–3 files (pdf / jpg / png)
- Status: `PENDING | APPROVED | REJECTED`
- Admin reviews: list pending → open → approve/reject with note
- Only `APPROVED` professionals can accept requests
- Verified badge shown on profile and directory listing

### D) Search / Directory
Filters:
- `professionType` (Lawyer / CA)
- `city`
- `specialization` (dropdown)
- `verifiedOnly` toggle (default ON)

### E) Service Requests
Fields: `category (enum)`, `description`, `city`, `budgetRange`, `createdAt`

Status workflow:
```
OPEN → ACCEPTED → CLOSED
```

- Professional views open requests, accepts one (first-come-first-served)
- After accept: `assignedToProfessionalId` is set
- Startup can close at any time

### F) Chat (request-linked)
- Chat exists **only after request is accepted**
- 1 chat per accepted request
- Text-only messages
- Real-time via **Socket.IO**

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native CLI + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | Cloudinary (multer upload) |
| Real-time | Socket.IO |
| Validation | Zod |
| Logging | Winston + Morgan |
| State (mobile) | Redux Toolkit + React Query |
| Forms (mobile) | React Hook Form + Zod |
| Token Storage | react-native-keychain |
| Hosting — Backend | Render / Railway |
| Hosting — Mobile | APK (Android) + TestFlight (iOS) |

> ⚠️ **Decision locked:** Platform is **Mobile only (React Native CLI)**. No web frontend. All DB models live inside `VouchBackend/src/models/` — there is no separate database repo.

---

## 5. Database Models

### `users`
| Field | Type |
|---|---|
| `_id` | ObjectId |
| `role` | `STARTUP \| LAWYER \| CA \| ADMIN` |
| `name` | String |
| `email` | String (unique) |
| `passwordHash` | String |
| `status` | `ACTIVE \| SUSPENDED` |
| `createdAt` | Date |

### `startup_profiles`
| Field | Type |
|---|---|
| `userId` | ObjectId (unique ref: users) |
| `companyName` | String |
| `industry` | String |
| `city` | String |
| `description` | String |
| `createdAt` | Date |

### `professional_profiles`
| Field | Type |
|---|---|
| `userId` | ObjectId (unique ref: users) |
| `fullName` | String |
| `professionType` | `LAWYER \| CA` |
| `city` | String |
| `experienceYears` | Number |
| `specializations` | String[] (max 5) |
| `licenseNumber` | String |
| `feeRange` | String (optional) |
| `isVerified` | Boolean (default: false) |
| `createdAt` | Date |

### `verification_requests`
| Field | Type |
|---|---|
| `professionalUserId` | ObjectId ref: users |
| `docUrls` | String[] |
| `status` | `PENDING \| APPROVED \| REJECTED` |
| `adminNote` | String |
| `reviewedBy` | ObjectId ref: users (adminId) |
| `submittedAt` | Date |
| `reviewedAt` | Date |

### `service_requests`
| Field | Type |
|---|---|
| `createdByStartupUserId` | ObjectId ref: users |
| `category` | Enum |
| `description` | String |
| `city` | String |
| `budgetRange` | String |
| `status` | `OPEN \| ACCEPTED \| CLOSED` |
| `assignedProfessionalUserId` | ObjectId (nullable) |
| `createdAt` | Date |
| `acceptedAt` | Date |
| `closedAt` | Date |

### `chats`
| Field | Type |
|---|---|
| `requestId` | ObjectId (unique ref: service_requests) |
| `startupUserId` | ObjectId ref: users |
| `professionalUserId` | ObjectId ref: users |
| `createdAt` | Date |

### `messages`
| Field | Type |
|---|---|
| `chatId` | ObjectId ref: chats |
| `senderId` | ObjectId ref: users |
| `text` | String |
| `createdAt` | Date |

### Index Strategy
| Collection | Index |
|---|---|
| `professional_profiles` | Compound: `{ city, professionType, isVerified }` |
| `service_requests` | `{ status, city }` |
| `messages` | `{ chatId, createdAt }` (for pagination) |

---

## 6. API Endpoints

All routes are prefixed: `/api/v1`

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/me` | Authenticated |

### Profiles
| Method | Route | Access |
|---|---|---|
| PUT | `/startup/profile` | STARTUP |
| GET | `/startup/profile/:userId` | Authenticated |
| PUT | `/professional/profile` | LAWYER / CA |
| GET | `/professional/profile/:userId` | Authenticated |
| GET | `/professionals?city=&type=&specialization=&verified=true` | Authenticated |

### Verification
| Method | Route | Access |
|---|---|---|
| POST | `/professional/verification/submit` | LAWYER / CA |
| GET | `/admin/verifications?status=PENDING` | ADMIN |
| POST | `/admin/verifications/:id/approve` | ADMIN |
| POST | `/admin/verifications/:id/reject` | ADMIN |

### Service Requests
| Method | Route | Access |
|---|---|---|
| POST | `/requests` | STARTUP |
| GET | `/requests/mine` | STARTUP / PROFESSIONAL |
| GET | `/requests/open` | Verified PROFESSIONAL only |
| POST | `/requests/:id/accept` | Verified PROFESSIONAL only |
| POST | `/requests/:id/close` | STARTUP |

### Chat
| Method | Route | Access |
|---|---|---|
| GET | `/chats/by-request/:requestId` | Participants only |
| GET | `/messages/:chatId` | Participants only |
| POST | `/messages/:chatId` | Participants only |

### Socket.IO Event
| Event | Direction | Description |
|---|---|---|
| `message:new` | Server → Clients | Emits new message to chat room |

---

## 7. Repository Structure

### REPO 1: `VouchBackend`

**Architecture:** Controller → Service → Model (strict layer separation)

```
vouch-backend/
├── src/
│   ├── config/
│   │   ├── db.ts                  # Mongoose connection
│   │   ├── cloudinary.ts          # Cloudinary SDK config
│   │   └── env.ts                 # Zod-validated env vars
│   │
│   ├── models/                    # All Mongoose models live here (no separate DB folder)
│   │   ├── User.ts
│   │   ├── StartupProfile.ts
│   │   ├── ProfessionalProfile.ts
│   │   ├── VerificationRequest.ts
│   │   ├── ServiceRequest.ts
│   │   ├── Chat.ts
│   │   └── Message.ts
│   │
│   ├── controllers/               # HTTP in/out only — no business logic
│   │   ├── auth.controller.ts
│   │   ├── startup.controller.ts
│   │   ├── professional.controller.ts
│   │   ├── verification.controller.ts
│   │   ├── request.controller.ts
│   │   ├── chat.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/                  # All business logic lives here
│   │   ├── auth.service.ts
│   │   ├── startup.service.ts
│   │   ├── professional.service.ts
│   │   ├── verification.service.ts
│   │   ├── request.service.ts
│   │   ├── chat.service.ts
│   │   └── admin.service.ts
│   │
│   ├── routes/
│   │   ├── index.ts               # Mounts all routes under /api/v1
│   │   ├── auth.routes.ts
│   │   ├── startup.routes.ts
│   │   ├── professional.routes.ts
│   │   ├── verification.routes.ts
│   │   ├── request.routes.ts
│   │   ├── chat.routes.ts
│   │   └── admin.routes.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts        # JWT decode → attaches req.user
│   │   ├── authorize.ts           # Role guard factory: authorize('ADMIN')
│   │   ├── validate.ts            # Zod schema validator middleware
│   │   ├── uploadMiddleware.ts    # multer + Cloudinary stream
│   │   ├── rateLimiter.ts         # express-rate-limit (auth: 10/min)
│   │   └── errorHandler.ts        # Global error handler (last middleware)
│   │
│   ├── validators/                # Zod schemas reused in middleware
│   │   ├── auth.schema.ts
│   │   ├── profile.schema.ts
│   │   ├── request.schema.ts
│   │   └── message.schema.ts
│   │
│   ├── socket/
│   │   └── chatSocket.ts          # Socket.IO: join room, message:send, message:new
│   │
│   ├── utils/
│   │   ├── jwt.ts                 # signToken / verifyToken
│   │   ├── logger.ts              # Winston (file + console)
│   │   ├── apiResponse.ts         # { success, data, message } standard shape
│   │   └── constants.ts           # ROLES, REQUEST_STATUS, VERIFY_STATUS enums
│   │
│   ├── types/
│   │   └── express.d.ts           # Augments Express Request with req.user
│   │
│   └── app.ts                     # helmet, cors, morgan, routes mounted
│
├── server.ts                      # http.createServer + socket.io attach
├── src/scripts/
│   └── seedAdmin.ts               # One-time script: creates admin from .env vars
├── .env
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
├── Dockerfile
└── .dockerignore
```

**Key Packages**

| Category | Package |
|---|---|
| Core | express, mongoose, zod |
| Auth | jsonwebtoken, bcryptjs |
| Upload | multer, cloudinary |
| Real-time | socket.io |
| Security | helmet, cors, express-rate-limit, compression |
| Logging | winston, morgan |
| Dev | typescript, ts-node-dev, dotenv |

---

### REPO 2: `VouchMobile`

**Architecture:** Feature-based folder structure. Each domain owns its screens + Redux slice.

```
vouch-mobile/
├── android/
├── ios/
├── src/
│   ├── api/
│   │   ├── client.ts              # axios instance + interceptors (JWT attach + refresh)
│   │   ├── auth.api.ts
│   │   ├── startup.api.ts
│   │   ├── professional.api.ts
│   │   ├── request.api.ts
│   │   ├── chat.api.ts
│   │   └── admin.api.ts           # Fetch verifications, approve/reject
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── LandingScreen.tsx        # Vouch brand/welcome, first screen
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── OnboardingScreen.tsx     # Role-based profile form post-register
│   │   │   └── authSlice.ts
│   │   │
│   │   ├── startup/
│   │   │   ├── screens/
│   │   │   │   ├── StartupProfileForm.tsx
│   │   │   │   ├── DirectoryScreen.tsx      # Search + filters
│   │   │   │   ├── ProfessionalProfile.tsx  # View + "Create Request" CTA
│   │   │   │   ├── CreateRequestScreen.tsx
│   │   │   │   └── MyRequestsScreen.tsx
│   │   │   └── startupSlice.ts
│   │   │
│   │   ├── professional/
│   │   │   ├── screens/
│   │   │   │   ├── ProfessionalProfileForm.tsx
│   │   │   │   ├── VerificationUpload.tsx   # Doc picker, 1–3 files
│   │   │   │   ├── OpenRequestsScreen.tsx
│   │   │   │   └── AcceptedRequestsScreen.tsx
│   │   │   └── professionalSlice.ts
│   │   │
│   │   ├── chat/
│   │   │   ├── screens/
│   │   │   │   └── ChatScreen.tsx           # Socket.IO room per requestId
│   │   │   └── chatSlice.ts
│   │   │
│   │   └── admin/
│   │       └── screens/
│   │           └── AdminDashboard.tsx       # Verification queue
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx          # Token present → App, absent → Auth
│   │   ├── AuthNavigator.tsx          # Landing → Login / Register stack
│   │   ├── StartupNavigator.tsx       # Bottom tab navigator
│   │   ├── ProfessionalNavigator.tsx  # Bottom tab navigator
│   │   └── AdminNavigator.tsx         # Admin stack
│   │
│   ├── store/
│   │   ├── index.ts                   # Redux Toolkit configureStore
│   │   └── rootReducer.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppButton.tsx
│   │   │   ├── AppInput.tsx
│   │   │   ├── AppLoader.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── SafeScreen.tsx
│   │   ├── professional/
│   │   │   ├── ProfessionalCard.tsx
│   │   │   └── VerifiedBadge.tsx
│   │   └── request/
│   │       └── RequestCard.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSocket.ts              # socket.io-client connection lifecycle manager
│   │   └── useRefreshToken.ts
│   │
│   ├── utils/
│   │   ├── tokenStorage.ts           # react-native-keychain for secure JWT storage
│   │   ├── constants.ts              # API_BASE_URL, SOCKET_URL
│   │   └── helpers.ts
│   │
│   └── types/
│       └── index.ts                  # Shared TS interfaces: User, Profile, Request, Message
│
├── App.tsx                            # QueryClientProvider + Redux Provider + RootNavigator
├── .env
├── .gitignore
├── tsconfig.json
├── babel.config.js
└── package.json
```

**Key Packages**

| Category | Package |
|---|---|
| Navigation | @react-navigation/native, stack, bottom-tabs |
| State | @reduxjs/toolkit, react-redux |
| Server state | @tanstack/react-query |
| HTTP | axios |
| Real-time | socket.io-client |
| Forms | react-hook-form, zod |
| Token storage | react-native-keychain |
| File picker | react-native-document-picker, react-native-image-picker |
| Storage | @react-native-async-storage/async-storage |

---

## 8. Environment Variables

### `vouch-backend/.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
ALLOWED_ORIGINS=
```

### `vouch-mobile/.env`
```env
API_BASE_URL=http://localhost:5000/api/v1
SOCKET_URL=http://localhost:5000
```

---

## 9. Security Layers

| Layer | Implementation |
|---|---|
| HTTP Headers | `helmet` |
| CORS | `cors` — whitelist mobile origin only |
| Rate Limiting | `express-rate-limit` — auth routes: 10 req/min |
| Authentication | JWT `authenticate` middleware on all protected routes |
| Authorization | `authorize(role)` factory middleware |
| Input Validation | Zod schemas on every request body |
| File Upload | multer: pdf/jpg/png only, max 5MB |
| Password Hashing | `bcryptjs` with 12 salt rounds |

---

## 10. Git Branching Strategy

```
main          ← Production (auto-deploys to Render)
develop       ← Integration branch
feature/auth
feature/profiles
feature/verification
feature/requests
feature/chat
```

- PRs: `feature/*` → `develop`
- Releases: `develop` → `main`

---

## 11. 3-Month Development Timeline

### Month 1 — Core Base

| # | Task | Repo |
|---|---|---|
| 1 | Project scaffold, DB connection, User model, JWT auth (`/api/v1/auth/*`) | Backend |
| 2 | StartupProfile + ProfessionalProfile models + CRUD routes | Backend |
| 3 | GET `/professionals` directory with filters | Backend |
| 4 | RN CLI setup, navigation skeleton, auth screens, token storage | Mobile |
| 5 | Startup + Professional profile forms wired to API | Mobile |
| 6 | Directory screen with all 4 filters | Mobile |

### Month 2 — Trust + Workflow

| # | Task | Repo |
|---|---|---|
| 7 | VerificationRequest model + Cloudinary upload + admin review routes | Backend |
| 8 | ServiceRequest model + OPEN/ACCEPT/CLOSE workflow | Backend |
| 9 | Verification upload screen (document picker + Cloudinary) | Mobile |
| 10 | Admin dashboard — verification queue + approve/reject | Mobile |
| 11 | Create request + My requests + Open requests screens | Mobile |

### Month 3 — Communication + Polish

| # | Task | Repo |
|---|---|---|
| 12 | Chat + Message models + REST endpoints + `chatSocket.ts` | Backend |
| 13 | ChatScreen with `socket.io-client` + `useSocket` hook | Mobile |
| 14 | UI polish: VerifiedBadge, loading/empty/error states | Mobile |
| 15 | Deployment: Backend → Render, APK test on Android, TestFlight iOS | Both |
| 16 | Jest + Supertest: backend API test cases (auth, requests, verification) | Backend |
| 17 | ER diagram, app screenshots, API doc summary for project report | Both |

---

## 12. Scope Boundaries

### Included (Must-Have)
- Email + password auth with JWT
- Startup and Professional profiles
- Professional verification (upload + admin approval)
- Professional directory with filters
- Service requests (OPEN → ACCEPTED → CLOSED)
- Real-time chat via Socket.IO (post-acceptance only)

### Excluded (Future Work)
- OTP / phone auth
- Payments, escrow, invoices
- Ratings and reviews
- Social media feed (posts/likes/comments)
- Stories, following system, groups
- Video calls
- KYC automation / fraud scoring
- Appointment scheduling
- Multi-admin roles
- Heavy moderation tools

---

## 13. Alignment with Problem Statement

| Requirement | Status |
|---|---|
| All 3 roles (Startup, Professional, Admin) | ✅ Covered |
| All must-have features (A–F) | ✅ Covered |
| All 20 API endpoints from Section 6 | ✅ Covered |
| All 8 UI pages from Section 7 | ✅ Covered |
| All DB models from Section 5 | ✅ Covered |
| All security requirements from Section 8 | ✅ Covered (+ enhanced) |
| 3-month timeline from Section 9 | ✅ Aligned |
| MERN + Cloudinary + JWT tech stack | ✅ Aligned (web replaced with RN per decision) |
| Socket.IO for real-time chat | ✅ Included from day 1 |
| Admin seed script | ✅ `seedAdmin.ts` included |
| Report diagrams + test cases (Month 3) | ✅ Steps 16 & 17 added |
