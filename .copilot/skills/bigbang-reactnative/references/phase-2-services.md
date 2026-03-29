# Phase 2 — Services: API Client, Auth, Storage & Logger

## Docs to Read

1. **`docs/services-and-api.md`** — Read the ENTIRE file. It contains the complete code for:
   - `api.ts` — Axios client with interceptors + ALL generic CRUD methods (getEntity, getSubEntity, getSubSubEntity, addEntity, addSubEntity, addSubSubEntity, updateEntity, updateSubEntity, updateSubSubEntity, deleteEntity, deleteSubEntity, deleteSubSubEntity) + upload with progress (uploadEntityFiles, updateEntityFiles)
   - `auth.ts` — Login, loginGoogle, loginFacebook, forgotPassword, logout, getMe
   - `storage.ts` — Token management with expo-secure-store (getToken, setToken, removeToken)
   - `logger.ts` — Logging replacement for console.log

---

## Execution Steps

### Step 2.1 — Create `src/services/api.ts`

Copy the COMPLETE code from `docs/services-and-api.md`:
- Axios client with `baseURL: process.env.EXPO_PUBLIC_API_URL`
- Request interceptor that injects Bearer token from `getToken()`
- Response interceptor that catches 401 and removes token
- `ApiError` type and `parseApiError()` function
- ALL generic CRUD methods: `getEntity`, `getEntityWithParams`, `getSubEntity`, `getSubSubEntity`, `addEntity`, `addSubEntity`, `addSubSubEntity`, `updateEntity`, `updateSubEntity`, `updateSubSubEntity`, `deleteEntity`, `deleteSubEntity`, `deleteSubSubEntity`
- Upload methods: `uploadEntityFiles`, `updateEntityFiles` (with `onUploadProgress`)

**CRITICAL:** Do NOT omit any method. Copy ALL of them from the doc.

### Step 2.2 — Create `src/services/auth.ts`

Copy the COMPLETE code from `docs/services-and-api.md` section `auth.ts`:
- `LoginPayload` type
- `AuthResponse` type
- `login()`, `loginGoogle()`, `loginFacebook()`, `forgotPassword()`, `logout()`, `getMe<T>()`
- Must import from `./api` and `./storage`
- `logout()` must call `removeToken()` in `finally` block

### Step 2.3 — Create `src/services/storage.ts`

Copy the exact code from `docs/services-and-api.md` section `storage.ts`:
- Uses `expo-secure-store` (NOT AsyncStorage)
- `getToken()`, `setToken()`, `removeToken()` functions
- Constant `TOKEN_KEY = 'auth-token'`

### Step 2.4 — Create `src/services/logger.ts`

Copy the code from `docs/services-and-api.md` section `logger.ts`:
- `isDev` check based on `process.env.NODE_ENV`
- `logger.info()`, `logger.warn()`, `logger.error()` methods
- `info` and `warn` only log in dev mode
- `error` always logs

---

## Recovery Key Files

If these files exist, this phase was likely already completed:
- `src/services/api.ts`
- `src/services/auth.ts`
- `src/services/storage.ts`
- `src/services/logger.ts`

---

## Verification Checklist

- [ ] `src/services/api.ts` exists and contains Axios client + interceptors + ALL CRUD methods (13 methods) + upload methods (2 methods)
- [ ] `src/services/auth.ts` exists with login, loginGoogle, loginFacebook, forgotPassword, logout, getMe
- [ ] `src/services/storage.ts` exists using `expo-secure-store` (NOT AsyncStorage)
- [ ] `src/services/logger.ts` exists with info, warn, error methods
- [ ] NONE of the service files import anything from React (no `useState`, `useEffect`, etc.)
- [ ] NONE of the service files contain `console.log` (only logger.ts uses console.info/warn/error wrapped)
- [ ] ALL functions have explicit return types (`Promise<T>`, `Promise<void>`, etc.)
- [ ] `api.ts` uses `process.env.EXPO_PUBLIC_API_URL` as baseURL (no hardcoded URLs)
- [ ] `auth.ts` imports from `./api` and `./storage` (relative within services is OK)
