# VOUCH — PRESENTATION (PPT) OUTLINE
## BCA Final Semester Dissertation Presentation
### Font: Times New Roman | Body: 20/22pt | Headings: 28pt | No animations

---

## SLIDE 1 — TITLE SLIDE

**[Heading 28pt — centered]**
VOUCH

**[Body 22pt — centered]**
A Mobile Application for Connecting Startups with
Verified Lawyers and Chartered Accountants

---

*Student Name:* [Your Name]
*Enrollment No.:* [Enrollment Number]
*Course:* Bachelor of Computer Application (BCA)
*Supervisor:* [Supervisor Name]
*Department:* Computer Science & Engineering
*Jamia Hamdard, New Delhi | 2026*

---

## SLIDE 2 — OBJECTIVE

**[Heading]** Objective

**[Body]**
1. Provide a trusted, verified directory of Lawyers and CAs for startup founders
2. Enable startups to raise categorized service requests with budget, city, and type
3. Automate professional verification through admin-controlled document review
4. Facilitate real-time in-app communication tied to each service engagement
5. Enforce structured service lifecycle: OPEN → ACCEPTED → CLOSED
6. Implement secure JWT-based authentication with access/refresh token rotation

---

## SLIDE 3 — INTRODUCTION

**[Heading]** Introduction

**[Body]**
- Startups in India regularly need legal (trademark, contracts, litigation) and financial (tax, compliance, incorporation) services
- Current methods: unverified directories, personal referrals, scattered communication
- **Vouch** is a mobile platform (React Native + Node.js) with three user roles:
  - **Startup** — browse professionals, raise requests, chat, track history
  - **Lawyer / CA** — view jobs, accept/reject, chat, manage work
  - **Admin** — review and approve professional credential documents

---

## SLIDE 4 — PROBLEM STATEMENT

**[Heading]** Problem Statement

**[Body]**

| Problem | Impact |
|---|---|
| No verified professional directory | Startups contact unqualified professionals |
| Mismatched expectations | Wasted time on budget, city, service mismatch |
| Fragmented communication | WhatsApp/email with no formal record |
| No lifecycle tracking | No visibility on request status |
| No credential verification | Unverified professionals listed publicly |

**Proposed Solution:** Vouch — verified directory + structured requests + in-app chat + admin verification workflow

---

## SLIDE 5 — SYSTEM ARCHITECTURE

**[Heading]** System Architecture

**[Body]**

```
Mobile App (React Native)
    │
    ├── Redux (auth state)
    ├── TanStack Query (server state)
    └── Axios + Socket.IO Client
         │
         ▼ HTTP REST + WebSocket
Express.js Backend (Node.js + TypeScript)
    │
    ├── Helmet → CORS → Rate Limiter → JWT Auth → Routes
    ├── Services: Auth | Request | Chat | Admin
    │
    ▼
MongoDB (7 Collections)     Cloudinary (document files)
```

**Three-Tier Architecture:** Presentation → Application → Data

---

## SLIDE 6 — TECHNOLOGY STACK

**[Heading]** Technology Stack

**[Body]**

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native 0.84, TypeScript |
| State Management | Redux Toolkit, TanStack Query |
| Backend | Node.js 20, Express.js, TypeScript |
| Database | MongoDB 7 + Mongoose ODM |
| Real-time Chat | Socket.IO 4.7 |
| Authentication | JWT (access 15min + refresh 7d), bcrypt |
| File Storage | Cloudinary |
| Form Validation | React Hook Form + Zod |
| Security | Helmet, express-rate-limit, Keychain storage |

---

## SLIDE 7 — CONTEXT DIAGRAM (Level 0 DFD)

**[Heading]** Level 0 — Context Diagram

**[Body — insert diagram image here]**

*Key data flows:*
- **Startup → System:** Registration, service requests, messages, end-service
- **Professional → System:** Profile, accept/reject decisions, documents, messages
- **Admin → System:** Approve/reject verification
- **Cloudinary ↔ System:** File upload / URL storage

---

## SLIDE 8 — LEVEL 1 DFD

**[Heading]** Level 1 — Data Flow Diagram

**[Body — insert diagram image here]**

*Five main processes:*
1. Authenticate & Manage Profiles
2. Manage Professional Directory
3. Manage Service Requests
4. Manage Chat & Messaging
5. Manage Verification (Admin)

*Seven data stores:* USERS, STARTUP_PROFILES, PROFESSIONAL_PROFILES, SERVICE_REQUESTS, CHATS, MESSAGES, VERIFICATION_REQUESTS

---

## SLIDE 9 — LEVEL 2 DFD (Service Requests)

**[Heading]** Level 2 — Service Request Process

**[Body — insert diagram image here]**

*Sub-processes:*
- 3.1 Create Request (per-type blocking enforced)
- 3.2 View My Requests
- 3.3 View Open Requests (by profession type)
- 3.4 Accept / Reject Request (auto-creates Chat)
- 3.5 Cancel Request (OPEN only)
- 3.6 Mutual End-Service Confirmation

---

## SLIDE 10 — ENTITY RELATIONSHIP DIAGRAM

**[Heading]** Entity Relationship Diagram

**[Body — insert ER diagram image here]**

*Entities:* USER, STARTUP_PROFILE, PROFESSIONAL_PROFILE, SERVICE_REQUEST, CHAT, MESSAGE, VERIFICATION_REQUEST

*Key relationships:*
- User → 1:1 → StartupProfile or ProfessionalProfile
- ServiceRequest → 1:1 → Chat
- Chat → 1:N → Message

---

## SLIDE 11 — KEY FEATURES

**[Heading]** Key Features

**[Body]**

1. **Verified Directory** — Admin approves professional credentials before listing
2. **Per-Type Request Blocking** — 1 active Lawyer + 1 active CA request allowed simultaneously; not two of same type
3. **Mutual End-of-Service** — Both startup and professional must confirm before status becomes CLOSED
4. **Real-Time Chat** — Socket.IO chat auto-created on request acceptance; persisted in DB
5. **JWT Token Rotation** — Access (15 min) + Refresh (7 days); auto-refresh interceptor in Axios
6. **Role-Based Access Control** — Middleware enforced on every protected API route

---

## SLIDE 12 — SNAPSHOTS

**[Heading]** Application Snapshots

**[Body — 4–6 screenshots arranged as a grid]**

Suggested layout (2×3 grid):
- Landing / Sign In Screen
- Create Account Screen
- Professional Directory
- My Requests Screen (Startup)
- My Jobs Screen (Professional — Active + History)
- Chat Screen

---

## SLIDE 13 — CONCLUSION

**[Heading]** Conclusion

**[Body]**
- Vouch provides an end-to-end solution for startup-to-professional service discovery and management
- Combines verified directory, structured service requests, in-app real-time chat, and admin verification in one platform
- Built with industry-standard technologies: React Native, Node.js, MongoDB, Socket.IO, JWT
- Three-role architecture cleanly separates concerns for Startup, Professional, and Admin users
- Structured and architected to support production deployment and future scaling

---

## SLIDE 14 — LIMITATIONS

**[Heading]** Limitations

**[Body]**
1. No integrated payment gateway
2. Manual admin credential verification (no API-based automation)
3. No push notifications when app is in background
4. Text-only chat (no document or image sharing)
5. No rating / review system after service completion
6. Primarily tested on Android; full iOS testing pending

---

## SLIDE 15 — FUTURE SCOPE

**[Heading]** Future Scope

**[Body]**
1. **Payment Gateway** — Razorpay / Stripe integration with invoice generation
2. **Automated Verification** — Bar Council / ICAI API integration for credential check
3. **Push Notifications** — Firebase Cloud Messaging (FCM) for real-time alerts
4. **Rich Chat** — Document and image sharing within conversations
5. **Ratings & Reviews** — Post-service 5-star rating system
6. **AI Matching** — Smart professional suggestions based on request category and budget
7. **Video Consultation** — WebRTC-based in-app video/audio calls

---

## SLIDE 16 — BIBLIOGRAPHY

**[Heading]** Bibliography

**[Body — 20pt]**
1. Pressman, R. S. & Maxim, B. R. (2014). *Software Engineering: A Practitioner's Approach* (8th ed.). McGraw-Hill.
2. Sommerville, I. (2016). *Software Engineering* (10th ed.). Pearson.
3. MongoDB Docs — mongodb.com/docs/manual
4. Node.js Docs — nodejs.org/en/docs
5. React Native Docs — reactnative.dev/docs
6. Socket.IO Docs — socket.io/docs/v4
7. JWT Introduction — jwt.io/introduction
8. OWASP Top Ten — owasp.org/www-project-top-ten
9. TanStack Query Docs — tanstack.com/query
10. Redux Toolkit Docs — redux-toolkit.js.org

---

*End of Presentation*
*Total Slides: 16*
