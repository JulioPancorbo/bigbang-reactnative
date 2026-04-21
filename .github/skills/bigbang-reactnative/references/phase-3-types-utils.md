# Phase 3 — Types & Utils: Models, Validators, Formatters, Constants

## Docs to Read

1. **[docs/core/templates-snippets.md](docs/core/templates-snippets.md)** — Read the section `types/models.ts` for the base model types.
2. **[docs/core/structure-guide.md](docs/core/structure-guide.md)** — Read the sections:
   - `src/types/` — rules and example for models.ts
   - `src/utils/` — rules, structure, and code examples for constants, validators, formatters, helpers
3. **[docs/core/conventions.md](docs/core/conventions.md)** — Read the section "Reglas de TypeScript" for type conventions (use `type` not `interface`, PascalCase, etc.)

---

## Execution Steps

### Step 3.1 — Create `src/types/models.ts`

Copy the types from [docs/core/templates-snippets.md](docs/core/templates-snippets.md) section `types/models.ts`:
- `User`, `Product`, `Order`, `OrderItem` types
- All using `type` keyword (NOT `interface`)

### Step 3.2 — Create `src/types/api.ts`

Create with API response types. At minimum, re-export `ApiError` from services for convenience:
```typescript
// src/types/api.ts
export type { ApiError } from '@/services/api'

// Generic paginated response (common in Laravel APIs)
export type PaginatedResponse<T> = {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
```

### Step 3.3 — Create `src/types/index.ts`

```typescript
export * from './models'
export * from './api'
```

### Step 3.4 — Create `src/utils/constants.ts`

Copy from [docs/core/structure-guide.md](docs/core/structure-guide.md) section `src/utils/`:
- `API_BASE_URL` from `process.env.EXPO_PUBLIC_API_URL`
- `API_TIMEOUT = 10000`
- `MAX_RETRY_ATTEMPTS = 3`

### Step 3.5 — Create `src/utils/validators.ts`

Copy from [docs/core/structure-guide.md](docs/core/structure-guide.md) / [docs/core/conventions.md](docs/core/conventions.md):
- `isValidEmail(email: string): boolean` — regex validation
- `isValidPassword(password: string): boolean` — minimum 8 characters

### Step 3.6 — Create `src/utils/formatters.ts`

Copy from [docs/core/structure-guide.md](docs/core/structure-guide.md):
- `formatCurrency(amount: number, currency?: string): string` — using Intl.NumberFormat
- `formatDate(date: Date): string` — using toLocaleDateString

### Step 3.7 — Create `src/utils/helpers.ts`

Create as a placeholder file with a comment:
```typescript
// src/utils/helpers.ts
// Add shared helper functions here as the project grows.
```

---

## Recovery Key Files

If these files exist, this phase was likely already completed:
- `src/types/models.ts`
- `src/utils/validators.ts`

---

## Verification Checklist

- [ ] `src/types/models.ts` exists with User, Product, Order, OrderItem types
- [ ] `src/types/api.ts` exists with PaginatedResponse type
- [ ] `src/types/index.ts` re-exports all types from models and api
- [ ] `src/utils/constants.ts` exists with API_BASE_URL, API_TIMEOUT, MAX_RETRY_ATTEMPTS
- [ ] `src/utils/validators.ts` exists with isValidEmail, isValidPassword
- [ ] `src/utils/formatters.ts` exists with formatCurrency, formatDate
- [ ] `src/utils/helpers.ts` exists
- [ ] ALL types use `type` keyword (not `interface`)
- [ ] ALL type names are PascalCase
- [ ] ALL constants are UPPER_SNAKE_CASE
- [ ] ALL functions have explicit return types
- [ ] NO `any` type used anywhere
- [ ] NO React imports in any of these files
