# Vouch — API Reference

> **Base URL:** `http://localhost:5000/api/v1`  
> **Content-Type:** `application/json` for all requests unless uploading files  
> **Auth header:** `Authorization: Bearer <accessToken>`

---

## Quick Start — Get Tokens

Run these two requests first. Copy the `accessToken` values into subsequent requests.

---

## 1. Authentication

### POST `/auth/register`
Create a new account.

**Access:** Public

**Body:**
```json
{
  "name": "TechCo Inc",
  "email": "startup@test.com",
  "password": "Test@1234",
  "role": "STARTUP"
}
```
> `role` must be one of: `STARTUP` | `LAWYER` | `CA`  
> `password` min 8 chars, must contain at least one letter and one number

**Success `201`:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": {
      "id": "...",
      "name": "TechCo Inc",
      "email": "startup@test.com",
      "role": "STARTUP"
    }
  }
}
```

---

### POST `/auth/login`
Login and receive tokens.

**Access:** Public

**Body:**
```json
{
  "email": "startup@test.com",
  "password": "Test@1234"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>",
    "user": { "id": "...", "name": "TechCo Inc", "email": "startup@test.com", "role": "STARTUP" }
  }
}
```

---

### POST `/auth/refresh`
Silently get a new access token using a refresh token (valid 7 days).

**Access:** Public

**Body:**
```json
{
  "refreshToken": "<refreshToken from login>"
}
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "accessToken": "<new_jwt>",
    "refreshToken": "<new_jwt>"
  }
}
```

---

### GET `/auth/me`
Get the currently authenticated user's data.

**Access:** Authenticated (any role)

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "TechCo Inc",
    "email": "startup@test.com",
    "role": "STARTUP",
    "status": "ACTIVE",
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 2. Startup Profile

### PUT `/startup/profile`
Create or update the startup profile (upsert).

**Access:** `STARTUP` role only

**Headers:**
```
Authorization: Bearer <startupToken>
```

**Body:**
```json
{
  "companyName": "TechCo",
  "industry": "SaaS",
  "city": "Mumbai",
  "description": "We build SaaS tools for Indian SMEs. Looking for legal help."
}
```
> `description` min 10 chars, max 500  
> `companyName` / `industry` / `city` min 2 chars

**Success `200`:**
```json
{
  "success": true,
  "message": "Profile saved",
  "data": {
    "_id": "...",
    "userId": "...",
    "companyName": "TechCo",
    "industry": "SaaS",
    "city": "Mumbai",
    "description": "We build SaaS tools..."
  }
}
```

---

### GET `/startup/profile/:userId`
Get a startup's profile by user ID.

**Access:** Authenticated (any role)

**Headers:**
```
Authorization: Bearer <anyToken>
```

**Example:**
```
GET /api/v1/startup/profile/69c7efa52445bd89d45b51d9
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "69c7efa52445bd89d45b51d9",
    "companyName": "TechCo",
    "industry": "SaaS",
    "city": "Mumbai",
    "description": "..."
  }
}
```

---

## 3. Professional Profile

### PUT `/professional/profile`
Create or update a professional's profile (upsert).

**Access:** `LAWYER` or `CA` role only

**Headers:**
```
Authorization: Bearer <professionalToken>
```

**Body:**
```json
{
  "fullName": "Riya Sharma",
  "professionType": "LAWYER",
  "city": "Delhi",
  "experienceYears": 6,
  "specializations": ["TRADEMARK", "IP_PROTECTION", "CONTRACT_REVIEW"],
  "licenseNumber": "DL/LAW/2018/001",
  "feeRange": "₹5k–₹20k"
}
```
> `professionType`: `LAWYER` | `CA`  
> `specializations`: array, min 1 item, max 5 items  
> `feeRange` is optional  
> `experienceYears`: integer 0–60

**Success `200`:**
```json
{
  "success": true,
  "message": "Profile saved",
  "data": {
    "_id": "...",
    "userId": "...",
    "fullName": "Riya Sharma",
    "professionType": "LAWYER",
    "city": "Delhi",
    "experienceYears": 6,
    "specializations": ["TRADEMARK", "IP_PROTECTION", "CONTRACT_REVIEW"],
    "licenseNumber": "DL/LAW/2018/001",
    "feeRange": "₹5k–₹20k",
    "isVerified": false
  }
}
```

---

### GET `/professional/profile/:userId`
Get a professional's profile by user ID.

**Access:** Authenticated (any role)

**Example:**
```
GET /api/v1/professional/profile/69c7f02f2445bd89d45b51e5
```

---

### GET `/professionals`
Browse/search the verified professional directory.

**Access:** Authenticated (any role)

**Query Parameters:**
| Param | Type | Description | Example |
|---|---|---|---|
| `city` | string | Filter by city | `Delhi` |
| `type` | string | `LAWYER` or `CA` | `LAWYER` |
| `specialization` | string | Filter by one specialization | `TRADEMARK` |
| `verified` | boolean string | Default `true`. Pass `false` to include unverified | `true` |
| `page` | number | Page number (default `1`) | `1` |
| `limit` | number | Results per page, max 50 (default `20`) | `10` |

**Example:**
```
GET /api/v1/professionals?city=Delhi&type=LAWYER&verified=true&page=1&limit=10
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "...",
        "userId": "...",
        "fullName": "Riya Sharma",
        "professionType": "LAWYER",
        "city": "Delhi",
        "experienceYears": 6,
        "specializations": ["TRADEMARK"],
        "isVerified": true,
        "feeRange": "₹5k–₹20k"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

## 4. Verification (Document Submission)

### POST `/professional/verification/submit`
Submit verification documents (1–3 files). Triggers PENDING review by admin.

**Access:** `LAWYER` or `CA` role only

**Headers:**
```
Authorization: Bearer <professionalToken>
Content-Type: multipart/form-data
```

**Form Fields:**
| Field | Type | Description |
|---|---|---|
| `docs` | file (multiple) | 1–3 files. Accepted: `jpg`, `jpeg`, `png`, `pdf` |

**Postman steps:**
1. Set method to `POST`
2. URL: `http://localhost:5000/api/v1/professional/verification/submit`
3. Headers: `Authorization: Bearer <token>`
4. Body → **form-data** → key `docs`, type **File**, select 1–3 files

**Success `201`:**
```json
{
  "success": true,
  "message": "Documents submitted",
  "data": {
    "_id": "...",
    "professionalUserId": "...",
    "docUrls": [
      "https://res.cloudinary.com/dq0vsaghc/image/upload/v.../vouch/verification/..."
    ],
    "status": "PENDING",
    "submittedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 5. Admin — Verification Review

> Seed the admin account first:
> ```
> cd VouchBackend
> npx ts-node src/scripts/seedAdmin.ts
> ```
> Default credentials: `admin@vouch.app` / `Admin@1234`

### GET `/admin/verifications`
List verification requests, optionally filtered by status.

**Access:** `ADMIN` role only

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Query Parameters:**
| Param | Values | Default |
|---|---|---|
| `status` | `PENDING` \| `APPROVED` \| `REJECTED` | all |

**Example:**
```
GET /api/v1/admin/verifications?status=PENDING
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69c7fa90cc56b3d93d1e52cb",
      "professionalUserId": "...",
      "docUrls": ["https://..."],
      "status": "PENDING",
      "adminNote": null,
      "submittedAt": "2026-03-28T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/admin/verifications/:id/approve`
Approve a pending verification. Sets `isVerified: true` on the professional profile.

**Access:** `ADMIN` role only

**Headers:**
```
Authorization: Bearer <adminToken>
```

**Body:** *(empty)*

**Example:**
```
POST /api/v1/admin/verifications/69c7fa90cc56b3d93d1e52cb/approve
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Verification approved",
  "data": {
    "_id": "...",
    "status": "APPROVED",
    "reviewedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### POST `/admin/verifications/:id/reject`
Reject a verification with an optional note.

**Access:** `ADMIN` role only

**Body:**
```json
{
  "adminNote": "License number could not be verified. Please resubmit with a clearer copy."
}
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Verification rejected",
  "data": {
    "_id": "...",
    "status": "REJECTED",
    "adminNote": "License number could not be verified.",
    "reviewedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 6. Service Requests

### POST `/requests`
Create a new service request.

**Access:** `STARTUP` role only

**Headers:**
```
Authorization: Bearer <startupToken>
```

**Body:**
```json
{
  "category": "TRADEMARK",
  "description": "We need help filing a trademark for our brand name 'Vouch' in the SaaS industry. Urgently required before product launch.",
  "city": "Mumbai",
  "budgetRange": "₹10k–₹30k"
}
```

> `category` must be one of:  
> `CONTRACT_REVIEW` | `COMPANY_INCORPORATION` | `TRADEMARK` | `TAX_FILING` | `COMPLIANCE` | `LITIGATION` | `IP_PROTECTION` | `DUE_DILIGENCE` | `OTHER`  
> `description` min 20 chars, max 1000

**Success `201`:**
```json
{
  "success": true,
  "message": "Request created",
  "data": {
    "_id": "...",
    "createdByStartupUserId": "...",
    "category": "TRADEMARK",
    "description": "...",
    "city": "Mumbai",
    "budgetRange": "₹10k–₹30k",
    "status": "OPEN",
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

### GET `/requests/mine`
Get all requests associated with the current user (sent if STARTUP, accepted if PROFESSIONAL).

**Access:** Authenticated (any role)

**Headers:**
```
Authorization: Bearer <anyToken>
```

**Success `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "category": "TRADEMARK",
      "status": "OPEN",
      "city": "Mumbai",
      "createdAt": "..."
    }
  ]
}
```

---

### GET `/requests/open`
Browse all OPEN service requests (for verified professionals to pick from).

**Access:** `LAWYER` or `CA` role only, must be `isVerified: true`

**Headers:**
```
Authorization: Bearer <professionalToken>
```

**Optional query params:** `city`, `category`, `page`, `limit`

**Example:**
```
GET /api/v1/requests/open?city=Mumbai&category=TRADEMARK
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "...",
        "category": "TRADEMARK",
        "description": "...",
        "city": "Mumbai",
        "budgetRange": "₹10k–₹30k",
        "status": "OPEN"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

---

### POST `/requests/:id/accept`
Accept an open service request (first-come-first-served). Auto-creates a chat between the two parties.

**Access:** `LAWYER` or `CA`, must be `isVerified: true`

**Headers:**
```
Authorization: Bearer <professionalToken>
```

**Body:** *(empty)*

**Example:**
```
POST /api/v1/requests/69c7fc0ecc56b3d93d1e52e9/accept
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Request accepted",
  "data": {
    "_id": "...",
    "status": "ACCEPTED",
    "assignedProfessionalUserId": "...",
    "acceptedAt": "2026-03-28T00:00:00.000Z",
    "chat": {
      "_id": "69c7fc17cc56b3d93d1e52ee"
    }
  }
}
```

---

### POST `/requests/:id/close`
Close an accepted (or open) service request.

**Access:** `STARTUP` role only (must own the request)

**Headers:**
```
Authorization: Bearer <startupToken>
```

**Body:** *(empty)*

**Example:**
```
POST /api/v1/requests/69c7fc0ecc56b3d93d1e52e9/close
```

**Success `200`:**
```json
{
  "success": true,
  "message": "Request closed",
  "data": {
    "_id": "...",
    "status": "CLOSED",
    "closedAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 7. Chat

### GET `/chats/by-request/:requestId`
Get the chat linked to a service request. Only accessible by the two participants.

**Access:** Chat participants only

**Headers:**
```
Authorization: Bearer <startupToken or professionalToken>
```

**Example:**
```
GET /api/v1/chats/by-request/69c7fc0ecc56b3d93d1e52e9
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "_id": "69c7fc17cc56b3d93d1e52ee",
    "requestId": "69c7fc0ecc56b3d93d1e52e9",
    "startupUserId": "...",
    "professionalUserId": "...",
    "createdAt": "2026-03-28T00:00:00.000Z"
  }
}
```

---

## 8. Messages

### GET `/messages/:chatId`
Fetch message history for a chat (paginated, newest last).

**Access:** Chat participants only

**Headers:**
```
Authorization: Bearer <startupToken or professionalToken>
```

**Query Parameters:**
| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number |
| `limit` | `30` | Messages per page (max 50) |

**Example:**
```
GET /api/v1/messages/69c7fc17cc56b3d93d1e52ee?page=1&limit=30
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "...",
        "chatId": "69c7fc17cc56b3d93d1e52ee",
        "senderId": "...",
        "text": "Hi Riya, need help filing trademark for our brand.",
        "createdAt": "2026-03-28T16:13:25.155Z"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 30
  }
}
```

---

### POST `/messages/:chatId`
Send a message in a chat.

**Access:** Chat participants only

**Headers:**
```
Authorization: Bearer <startupToken or professionalToken>
```

**Body:**
```json
{
  "text": "Hi Riya, need help filing trademark for our brand Vouch."
}
```
> `text` min 1 char, max 2000

**Example:**
```
POST /api/v1/messages/69c7fc17cc56b3d93d1e52ee
```

**Success `201`:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "...",
    "chatId": "69c7fc17cc56b3d93d1e52ee",
    "senderId": "...",
    "text": "Hi Riya, need help filing trademark for our brand Vouch.",
    "createdAt": "2026-03-28T16:13:33.670Z"
  }
}
```

---

## 9. Socket.IO — Real-Time Chat

**Connection URL:** `http://localhost:5000`

**Auth (pass JWT on connect):**
```js
const socket = io("http://localhost:5000", {
  auth: { token: "<accessToken>" }
});
```

### Events

#### `chat:join` — Client → Server
Join a chat room to start receiving messages.
```js
socket.emit("chat:join", "<chatId>");
```

#### `message:send` — Client → Server
Send a real-time message to the chat room.
```js
socket.emit("message:send", {
  chatId: "69c7fc17cc56b3d93d1e52ee",
  text: "Hello from socket!"
});
```

#### `message:new` — Server → Client
Received by all connected members of the chat room when a new message arrives.
```js
socket.on("message:new", (msg) => {
  console.log(msg);
  // { _id, chatId, senderId, text, createdAt }
});
```

---

## 10. Error Responses

All errors follow this shape:

```json
{
  "success": false,
  "message": "<error description>"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / missing fields |
| `401` | Missing or expired token |
| `403` | Forbidden (wrong role or not a participant) |
| `404` | Resource not found |
| `409` | Conflict (e.g. email already in use) |
| `422` | Validation error (Zod) — includes per-field errors |
| `429` | Rate limit exceeded (auth endpoints: 10 req/min) |
| `500` | Internal server error |

**Validation error `422` example:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    { "field": "body.email", "message": "Invalid email" },
    { "field": "body.password", "message": "Password must contain letters and numbers" }
  ]
}
```

---

## 11. Test Data (Live DB)

> These IDs are from the local MongoDB instance seeded during development.

| Entity | ID |
|---|---|
| Startup user (`startup@test.com`) | `69c7efa52445bd89d45b51d9` |
| Lawyer user (`riya@lawyer.com`) | `69c7f02f2445bd89d45b51e5` |
| Admin user (`admin@vouch.app`) | seeded via script |
| Accepted service request | `69c7fc0ecc56b3d93d1e52e9` |
| Chat (linked to request above) | `69c7fc17cc56b3d93d1e52ee` |
| Verification request | `69c7fa90cc56b3d93d1e52cb` (APPROVED) |

**Passwords (reset to known values):**
| User | Password |
|---|---|
| `startup@test.com` | `Test@1234` |
| `riya@lawyer.com` | `Test@1234` |
| `admin@vouch.app` | `Admin@1234` |

---

## 12. Postman Collection Quick Setup

1. Create an **Environment** with variables:
   - `baseUrl` = `http://localhost:5000/api/v1`
   - `startupToken` = *(fill after login)*
   - `professionalToken` = *(fill after login)*
   - `adminToken` = *(fill after login)*

2. Use `{{baseUrl}}/auth/login` and set the token variables using a **Test script**:
   ```js
   const res = pm.response.json();
   pm.environment.set("startupToken", res.data.accessToken);
   ```

3. For all protected endpoints, set the **Authorization** tab to:
   - Type: `Bearer Token`
   - Token: `{{startupToken}}` (or the relevant role's variable)
