# VOUCH — Complete Code Explanation (Method by Method + End-to-End Flows)

---

## BACKEND — Method by Method

### 1. Entry Point: `server.ts`

```ts
httpServer = http.createServer(app)
```
Wraps Express in a raw Node.js HTTP server so Socket.IO can share the same port (5000).

```ts
io = new SocketServer(httpServer, { cors: { origin: allowedOrigins } })
```
Creates a Socket.IO server attached to the HTTP server. CORS origins come from `env.ALLOWED_ORIGINS`.

```ts
registerChatSocket(io)
```
Registers all socket event handlers before the HTTP server starts listening.

```ts
start() → connectDB() → httpServer.listen(env.PORT)
```
Async startup: first connects to MongoDB, then opens the port.

---

### 2. Middleware Pipeline: `app.ts`

Every HTTP request passes through these layers **in order**:

| Layer | What it does |
|---|---|
| `helmet()` | Sets 15 security headers (XSS, HSTS, Content-Type-Options, etc.) |
| `cors()` | Checks `Origin` header against whitelist. Rejects unknown origins with 403. |
| `compression()` | gzip-compresses responses > 1kb |
| `morgan()` | Logs every request in `combined` format, piped to Winston |
| `express.json({ limit: '1mb' })` | Parses JSON body. Rejects payloads > 1mb. |
| `express.urlencoded()` | Parses form-encoded body |
| `/api/v1` router | Routes to feature-specific routers |
| `errorHandler` | **Must be last** — catches any `next(err)` from controllers |

---

### 3. Authentication Layer

#### `authenticate.ts` middleware

```
req.headers.authorization → "Bearer <token>"
                           ↓
verifyAccessToken(token)  → decodes JWT with JWT_ACCESS_SECRET
                           ↓
req.user = { userId, role } → passed to controller
```

If no header or token is invalid → `sendError(res, 'Invalid or expired token', 401)` immediately.

#### `authorize(...roles)` middleware factory

Returns a middleware that checks `req.user.role` is in the allowed roles array.
Called like `authorize('STARTUP')` or `authorize('LAWYER', 'CA')`.

---

### 4. Auth Service: `auth.service.ts`

#### `registerUser(name, email, password, role)`

1. `User.findOne({ email })` — if exists → throw 409
2. `bcrypt.hash(password, 12)` — 12 salt rounds
3. `User.create({ name, email, passwordHash, role })`
4. Signs both tokens: `signAccessToken({ userId, role })` (15 min), `signRefreshToken({ userId, role })` (7 days)
5. Returns `{ accessToken, refreshToken, user: { id, name, email, role } }`

#### `loginUser(email, password)`

1. `User.findOne({ email })` — if not found → throw 401
2. Check `user.status === 'SUSPENDED'` → throw 403
3. `bcrypt.compare(password, user.passwordHash)` — if false → throw 401
4. Signs and returns both tokens

#### `refreshTokens(token)`

1. `verifyRefreshToken(token)` — if expired → throw 401
2. Look up user by `payload.userId` — if deleted → throw 401
3. Check for suspension → throw 403
4. Issues **new** access + refresh tokens (rotation: old refresh is consumed, new one issued)

#### `getMe(userId)`

`User.findById(userId).select('-passwordHash')` — strips password hash before returning.

---

### 5. Request Service: `request.service.ts`

#### `createRequest(startupUserId, data)`

The most complex validation:

```ts
if category is in LAWYER_BLOCK_CATS:
    blockSet = LAWYER_BLOCK_CATS, profType = 'lawyer'
else:
    blockSet = CA_BLOCK_CATS, profType = 'CA'

ServiceRequest.findOne({
  createdByStartupUserId: startupUserId,
  status: { $in: ['OPEN', 'ACCEPTED'] },
  category: { $in: blockSet }
})
```

If an active same-profession request exists → throw 409.
This is **per-profession blocking** — a startup can have one active lawyer request AND one active CA request simultaneously.

#### `getMyRequests(userId, role)`

- **STARTUP**: fetches requests where `createdByStartupUserId = userId`, then enriches ACCEPTED ones with the professional's profile (name, type, city, feeRange)
- **LAWYER/CA**: fetches requests where `assignedProfessionalUserId = userId`, then uses `Promise.all` to enrich each with startup company name + person name

#### `getOpenRequests(city?, role?)`

Filters `status: 'OPEN'`. If role = `'LAWYER'`, adds `category: { $in: LAWYER_CATEGORIES }` so lawyers only see their category types. Same for CA. Enriches with startup info.

#### `acceptRequest(requestId, professionalUserId)`

```ts
ServiceRequest.findOneAndUpdate(
  { _id: requestId, status: 'OPEN' },   // atomic check-and-update
  { status: 'ACCEPTED', assignedProfessionalUserId, acceptedAt }
)
```

The `findOneAndUpdate` with `status: 'OPEN'` in the filter is **race-condition safe** — if two professionals click accept simultaneously, only one wins; the second gets `null` → throw 409.

Then creates a chat via **upsert**:

```ts
Chat.findOneAndUpdate(
  { requestId },
  { $setOnInsert: { startupUserId, professionalUserId } },
  { upsert: true }
)
```

`$setOnInsert` means chat fields are only set when creating, never on update — prevents overwriting on re-accept.

#### `closeRequest(requestId, startupUserId)`

Only works on `status: 'OPEN'`. A startup cancels a request before any professional accepts.
Uses `findOneAndUpdate` with both `_id` and `createdByStartupUserId` in the filter for ownership check.

#### `requestEndService(requestId, userId)`

Mutual end-of-service for ACCEPTED requests:

```ts
isStartup = request.createdByStartupUserId === userId
isProfessional = request.assignedProfessionalUserId === userId

if isStartup:       request.endRequestedByStartup = true
if isProfessional:  request.endRequestedByProfessional = true

if both flags true: request.status = 'CLOSED'
```

Both parties must call this endpoint. First call sets one flag. Second call sets the other flag + closes the request.

---

### 6. Verification Service: `verification.service.ts`

#### `submitVerification(userId, docUrls[])`

Checks for existing `PENDING` verification. If none, creates a new `VerificationRequest` with Cloudinary URLs.

#### `approveVerification(id, adminId)`

1. Finds the VerificationRequest by id
2. Sets `status = 'APPROVED'`, `reviewedBy`, `reviewedAt`
3. `ProfessionalProfile.findOneAndUpdate({ userId }, { isVerified: true })` — marks the professional as verified

#### `rejectVerification(id, adminId, adminNote)`

Same flow but `status = 'REJECTED'` and stores the `adminNote` for the professional to see.

---

### 7. Socket.IO: `chatSocket.ts`

#### Middleware (runs before `connection`)

```ts
socket.handshake.auth.token → verifyAccessToken(token)
socket.data.user = { userId, role }
```

Every socket connection is authenticated. No token = disconnect immediately.

#### `chat:join` event handler

1. `Chat.findById(chatId)` — verify chat exists
2. Check `userId` is in `[chat.startupUserId, chat.professionalUserId]`
3. `socket.join(chatId)` — joins the Socket.IO room
4. Emits `chat:joined` back to confirm

#### `message:send` event handler

1. Validates payload: `chatId` and `text` required, `text.length ≤ 2000`
2. Verifies chat existence and user is a participant
3. `Message.create({ chatId, senderId: userId, text })`
4. `io.to(chatId).emit('message:new', message)` — broadcasts to **all** sockets in the room (both participants)

---

### 8. Error Handler: `errorHandler.ts`

All controllers wrap logic in `try/catch { next(err) }`. The error handler is the single exit point for all errors:

```ts
err.statusCode ?? 500  →  sendError(res, err.message, status)
```

Custom errors have `.statusCode` attached via:
```ts
Object.assign(new Error('message'), { statusCode: 4xx })
```

---

### 9. Professional Service: `professional.service.ts`

#### `upsertProfessionalProfile(userId, data)`

```ts
ProfessionalProfile.findOneAndUpdate(
  { userId },
  { ...data, userId },
  { new: true, upsert: true, runValidators: true }
)
```

Creates the profile if it doesn't exist, updates it if it does — single atomic operation.

#### `getProfessionalProfile(userId)`

`ProfessionalProfile.findOne({ userId })` — throws 404 if not found.

#### `listProfessionals(filters)`

Builds a dynamic Mongoose query from optional filters (`city` as regex, `professionType`, `specialization`, `isVerified`).
Uses `Promise.all([find(...), countDocuments(...)]) ` to get paginated results + total count in parallel.

---

## FRONTEND — Method by Method

### 1. App Bootstrap: `RootNavigator.tsx` → `bootstrap()`

Called once on app mount via `useEffect`:

```ts
tokenStorage.getAccessToken()   // reads from react-native-keychain
tokenStorage.getRefreshToken()
  if none: dispatch(setLoading(false)) → show Auth screens
  if exists: authApi.me() → validates token with server
    success: dispatch(setAuth({ user, accessToken, refreshToken }))
    failure: tokenStorage.clearTokens() → show Auth screens
```

Navigation tree based on auth state:

```
isAuthenticated = false  →  AuthNavigator (Landing/Login/Register/Onboarding)
user.role = 'STARTUP'    →  StartupNavigator (tabs + CreateRequest/ProfDetail/Chat)
user.role = 'ADMIN'      →  AdminNavigator
else (LAWYER/CA)         →  ProfessionalNavigator
```

---

### 2. Token Storage: `tokenStorage.ts`

Uses `react-native-keychain` — OS-level secure storage (Android Keystore / iOS Keychain):

| Method | Action |
|---|---|
| `saveTokens(access, refresh)` | Two separate keychain entries (different `service` keys) |
| `getAccessToken()` | Returns `result.password` (keychain stores token as "password" field) |
| `getRefreshToken()` | Same, different service key |
| `clearTokens()` | `resetGenericPassword` on both entries — called on logout |

---

### 3. Axios Client: `client.ts`

#### Request Interceptor

```ts
apiClient.interceptors.request.use(async config => {
  token = await tokenStorage.getAccessToken()
  config.headers.Authorization = `Bearer ${token}`
  return config
})
```

Runs before **every** outgoing request. Attaches the current access token.

#### Response Interceptor (Auto-Refresh)

```
on 401 response:
  if isAuthEndpoint (/auth/login or /auth/register): skip — let 401 bubble to UI
  if isRefreshing: queue this request in failedQueue
  else:
    isRefreshing = true
    POST /auth/refresh with refreshToken
    save new tokens to keychain + dispatch setTokens to Redux
    processQueue(null, newToken) — replay all queued requests
    retry originalRequest with new token
    on failure: processQueue(error) + dispatch logout()
```

The `failedQueue` pattern prevents multiple simultaneous expiry handling.
If 5 requests fire at once and all get 401, only the first triggers a refresh — the other 4 wait in the queue and are replayed when the new token arrives.

---

### 4. Redux Auth: `authSlice.ts`

| Action | What changes in state |
|---|---|
| `setAuth({ user, accessToken, refreshToken })` | Sets all fields, `isAuthenticated = true`, `isLoading = false` |
| `setTokens({ accessToken, refreshToken })` | Updates tokens only (after refresh) — user object unchanged |
| `setUser(user)` | Updates user profile data without touching tokens |
| `logout()` | Clears everything, `isAuthenticated = false` |
| `setLoading(bool)` | Controls the splash spinner during bootstrap |

---

### 5. `useAuth` Hook: `useAuth.ts`

#### `login(payload)`

1. `authApi.login(payload)` → POST `/auth/login`
2. `tokenStorage.saveTokens(accessToken, refreshToken)` — persists to keychain
3. `dispatch(setAuth(...))` — updates Redux → `RootNavigator` re-renders → navigates to role-specific app

#### `register(payload)`

1. `authApi.register(payload)` → POST `/auth/register`
2. `tokenStorage.saveTokens(...)` — saves tokens
3. **Does NOT dispatch `setAuth`** — waits for `completeAuth()` to be called after onboarding profile setup

#### `completeAuth(user, accessToken, refreshToken)`

Called from `OnboardingScreen` after the user fills in their profile.
Dispatches `setAuth` to trigger navigation.

#### `logout()`

1. `tokenStorage.clearTokens()` — wipes keychain
2. `dispatch(logoutAction())` — clears Redux → `RootNavigator` shows Auth screens

---

### 6. `LoginScreen.tsx`

1. Form built with `react-hook-form` + `zodResolver`. Schema: `email` (valid email), `password` (non-empty)
2. `handleSubmit(onSubmit)` — Zod validates before calling `onSubmit`
3. `onSubmit`: calls `useAuth().login(data)`. On success, navigation happens automatically (Redux state change triggers `RootNavigator` re-render). On error, sets `apiError` state → `<ErrorMessage>` renders the server message.

---

### 7. `CreateRequestScreen.tsx`

1. Fetches `myRequests` via TanStack Query `queryKey: ['myRequests']`
2. Client-side blocking check mirrors server logic — shows a warning card if active same-profession request exists, but does **not** prevent submission (server is the source of truth)
3. Category picker: user selects from `SERVICE_CATEGORIES`
4. `onSubmit`: `requestApi.create(data)` → POST `/api/v1/requests`. On success → `navigation.goBack()`

---

### 8. `OpenRequestsScreen.tsx` (Professional)

1. Fetches open requests: `queryKey: ['openRequests']` → GET `/requests/open`
2. **Accept**: `requestApi.accept(item._id)` → POST `/requests/:id/accept`
   - On success: invalidates `['openRequests']` and `['myJobs']` queries
   - Immediately calls `chatApi.getByRequest(item._id)` to get the chat ID
   - Navigates to `ChatScreen` with `{ chatId, requestId }`
3. **Reject**: Opens a modal for reason input → `requestApi.reject(requestId, reason)` → POST `/requests/:id/reject`

---

### 9. `ChatScreen.tsx`

1. Fetches chat info (participant names): `queryKey: ['chatInfo', chatId]`
2. Fetches message history (last 50): `queryKey: ['messages', chatId]`
3. Syncs initial messages into `localMessages` state via `useEffect` watching `messagesData`
4. Connects to Socket.IO via `useSocket(chatId, onNewMessage)`
5. New incoming messages via `'message:new'` event → appended to `localMessages`
6. **Send**: `sendMessage(text)` → `socket.emit('message:send', { chatId, text })`
7. Auto-scrolls `FlatList` to end on new message

---

### 10. `useSocket` Hook: `useSocket.ts`

```ts
useEffect(() => {
  socket = io(SOCKET_URL, { auth: { token: accessToken }, transports: ['websocket'] })

  socket.on('connect', () => socket.emit('chat:join', chatId))
  socket.on('message:new', msg => onNewMessage(msg))

  return () => socket.disconnect()  // cleanup on unmount
}, [chatId, accessToken])
```

`sendMessage(text)` emits `'message:send'` using a `useCallback` so the reference is stable across renders.

---

## COMPLETE END-TO-END FLOWS

### Flow A: Startup Creates Request → Professional Accepts → Real-Time Chat

```
1. App starts
   RootNavigator.bootstrap()
   → keychain empty → setLoading(false)
   → renders AuthNavigator → LandingScreen

2. Startup registers
   RegisterScreen.onSubmit()
   → POST /auth/register
   → bcrypt.hash (12 rounds) → User.create → signTokens
   → tokenStorage.saveTokens()
   → OnboardingScreen (profile setup)
   → completeAuth() → setAuth() → renders StartupNavigator

3. Startup creates request
   CreateRequestScreen.onSubmit()
   → POST /api/v1/requests
   → authenticate middleware: verifyAccessToken(Bearer ...)
   → authorize('STARTUP')
   → validate middleware (Zod schema)
   → request.controller.create() → request.service.createRequest()
   → check LAWYER_BLOCK_CATS / CA_BLOCK_CATS for active request
   → ServiceRequest.create()
   → 201 { data: request }

4. Professional browses open requests
   OpenRequestsScreen mounts
   → TanStack Query: GET /api/v1/requests/open
   → authenticate → authorize('LAWYER','CA')
   → getOpenRequests(city?, role='LAWYER')
   → filters by LAWYER_CATEGORIES, enriches with startup info
   → renders FlatList of request cards

5. Professional accepts
   handleAccept(item)
   → POST /api/v1/requests/:id/accept
   → acceptRequest(requestId, professionalUserId)
   → findOneAndUpdate({ _id, status:'OPEN' }) — atomic race-safe
   → status='ACCEPTED', assignedProfessionalUserId set
   → Chat.findOneAndUpdate upsert (creates chat)
   → frontend: invalidate ['openRequests'], ['myJobs']
   → chatApi.getByRequest(item._id) → GET /chats/by-request/:requestId
   → navigate('Chat', { chatId, requestId })

6. Real-time chat
   ChatScreen mounts
   → useSocket: io.connect with accessToken
   → server io.use middleware: verifyAccessToken(token) → socket.data.user
   → socket.on('connect'): socket.emit('chat:join', chatId)
   → server: Chat.findById → verify participant → socket.join(chatId)
   → server: socket.emit('chat:joined')

   User sends message:
   → sendMessage(text) → socket.emit('message:send', { chatId, text })
   → server: validate → Chat.findById → participant check
   → Message.create({ chatId, senderId, text })
   → io.to(chatId).emit('message:new', message) — both users receive
   → onNewMessage(msg) → setLocalMessages(prev => [...prev, msg])
   → FlatList scrollToEnd

7. End of service (mutual confirmation)
   Startup: POST /requests/:id/request-end
   → requestEndService(id, startupUserId)
   → endRequestedByStartup = true, save
   → returns { status: 'ACCEPTED', endRequestedByStartup: true }

   Professional: POST /requests/:id/request-end
   → endRequestedByProfessional = true
   → both flags true → status = 'CLOSED', closedAt = new Date()
   → returns { status: 'CLOSED' }
```

---

### Flow B: Token Expiry During Active Session

```
1. Access token (15 min) expires
2. apiClient makes a request → server returns 401
3. Response interceptor fires:
   isAuthEndpoint? No → proceed with refresh
   isRefreshing? No → set isRefreshing = true
   → tokenStorage.getRefreshToken()
   → POST /auth/refresh { refreshToken }
   → server: verifyRefreshToken → new payload → signAccessToken + signRefreshToken
   → tokenStorage.saveTokens(newAccess, newRefresh)
   → dispatch(setTokens({ accessToken, refreshToken }))
   → retry originalRequest with new token
   → processQueue(null, newToken) — any other queued requests also retry
4. User sees nothing — the request succeeded transparently
```

---

### Flow C: Professional Verification

```
1. Professional goes to VerificationUploadScreen
   → picks document files (image picker)
   → POST /professional/verification/submit (multipart/form-data)
   → uploadMiddleware (multer memoryStorage — never writes to disk)
   → uploadToCloudinary(buffer, mimetype) → streams file to Cloudinary
   → Cloudinary returns secure_url
   → submitVerification(userId, [url1, url2])
   → check for existing PENDING verification (throws 409 if found)
   → VerificationRequest.create({ professionalUserId, docUrls })

2. Admin reviews
   → GET /admin/verifications
   → listVerifications() → populate('professionalUserId', 'name email')

   Approve:
   → POST /admin/verifications/:id/approve
   → req.status = 'APPROVED', reviewedBy, reviewedAt → save
   → ProfessionalProfile.findOneAndUpdate({ isVerified: true })

   Reject:
   → POST /admin/verifications/:id/reject
   → req.status = 'REJECTED', adminNote stored

3. Professional now appears in directory with verified badge
   → listProfessionals() includes isVerified = true in results
```

---

*Project: Vouch — BCA Major Project, Jamia Hamdard | April 2026*
