# Phase 7 — Verification: Full Checklist, TypeScript Check, Anti-Patterns & Test Example

## Docs to Read

1. **`docs/structure-guide.md`** — Read the section "Checklist de Validación Completo" for the full validation checklist (~30 items across all categories).

2. **`docs/testing-ci.md`** — Read the sections:
   - "Instalación" — dev dependencies for testing
   - `jest.config.js` — exact configuration
   - "Estructura de tests" — folder structure
   - "Unit test — Zustand store" — example test for authStore
   - "Mock de service" — mock structure

---

## Execution Steps

### Step 7.1 — Run TypeScript Check

```bash
npx tsc --noEmit
```

If there are errors:
1. Read each error carefully
2. Identify which file and line has the issue
3. Determine which phase created that file
4. Re-read the relevant doc section
5. Fix the error
6. Re-run `npx tsc --noEmit`
7. Repeat until 0 errors

### Step 7.2 — Run Full Validation Checklist

Go through the COMPLETE checklist from `docs/structure-guide.md` section "Checklist de Validación Completo". Check EVERY item:

**Structure General:**
- [ ] Folders in kebab-case
- [ ] Component files in PascalCase
- [ ] Function/hook files in camelCase
- [ ] All files have `.ts` or `.tsx` extension
- [ ] `index.ts` exists in each main folder
- [ ] No empty folders

**TypeScript:**
- [ ] No `any` type anywhere
- [ ] Functions have explicit return types
- [ ] Props typed with `type` (not `interface`)
- [ ] Global types in `src/types/`
- [ ] Imports with absolute paths (`@/`)

**Components:**
- [ ] Props typed
- [ ] No business logic
- [ ] No API calls
- [ ] Styles via `className` (Nativewind)
- [ ] No `.styles.ts` files
- [ ] No `StyleSheet.create()`

**Screens:**
- [ ] One screen per folder
- [ ] Uses hooks for logic
- [ ] Does NOT use Axios directly
- [ ] Imports components from `@/components`
- [ ] Navigation types imported from `@/navigation`

**Navigation:**
- [ ] `navigation-types.ts` is the ONLY place routes are defined
- [ ] All imports use `@/navigation`
- [ ] Typed hooks in `navigation/hooks.ts`
- [ ] `RootNavigator.tsx` clean, no business logic
- [ ] No duplicate route types
- [ ] Path alias configured in `tsconfig.json`

**Services:**
- [ ] No React dependencies
- [ ] No hooks
- [ ] Pure functions with explicit return types
- [ ] Complete error handling
- [ ] No `console.log` (uses logger)

**Hooks:**
- [ ] Names start with `use`
- [ ] Reusable, independent of components
- [ ] Bridge between Screens and Services
- [ ] No UI logic
- [ ] Groups logic by entity

**Imports:**
- [ ] Uses `@/` path alias
- [ ] No relative imports (`../`)
- [ ] No circular imports
- [ ] Order: React → libraries → `@/` aliases → local

**Nativewind & Styles:**
- [ ] All styles use `className`
- [ ] No `.styles.ts` files
- [ ] No `StyleSheet.create()`
- [ ] `tailwind.config.js` in project root
- [ ] Custom colors defined

**Error Handling:**
- [ ] `ErrorBoundary` wraps app in `App.tsx`
- [ ] `<Toast />` rendered as last child in `App.tsx`
- [ ] `useToast` hook centralizes notifications
- [ ] API errors handled in hooks (`onError`), not screens

### Step 7.3 — Run Anti-Pattern Scan

Search for forbidden patterns in the `src/` directory. Run the verification script (cross-platform, Node.js only):

```bash
# From the skill directory:
node ./scripts/verify-structure.js "{TARGET_PROJECT_PATH}"
```

Or manually check with grep/Select-String:
- `console.log` in src/ (excluding logger.ts) → must be 0
- `StyleSheet.create` in src/ → must be 0
- `: any` (not `: any[]`) in src/ → must be 0
- `from '\.\./\.\./` in src/ → must be 0 (deep relative imports)
- `Alert.alert` in src/ → must be 0
- `AsyncStorage` in src/ → must be 0 (must use expo-secure-store)

### Step 7.4 — Install Test Dependencies

Read `docs/testing-ci.md` section "Instalación" and run:
```bash
pnpm add -D jest @testing-library/react-native @testing-library/jest-native @types/jest jest-expo
```

### Step 7.5 — Create `jest.config.js`

Copy the exact config from `docs/testing-ci.md`:
- `preset: 'jest-expo'`
- `moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }`
- `transformIgnorePatterns` for React Native modules
- `collectCoverageFrom` excluding screens and pure components

### Step 7.6 — Create Test Structure

```
tests/
├── __mocks__/
│   └── @/services/
│       └── api.ts          ← mock for api service
├── unit/
│   └── store/
│       └── authStore.test.ts  ← example test
└── integration/
    └── hooks/
        (empty, ready for future tests)
```

### Step 7.7 — Create Example Test: `tests/unit/store/authStore.test.ts`

Copy from `docs/testing-ci.md` section "Unit test — Zustand store":
- Tests: starts unauthenticated, sets token and user on login, clears on logout
- Uses `useAuthStore.getState()` and `useAuthStore.setState()`
- Resets store in `beforeEach`

### Step 7.8 — Create Mock: `tests/__mocks__/@/services/api.ts`

Copy from `docs/testing-ci.md` section "Mock de service":
- `getProducts`, `getUser`, `parseApiError` as `jest.fn()`

---

## Recovery Key Files

If these files exist, Phase 7 was likely already completed:
- `jest.config.js`
- `tests/unit/store/authStore.test.ts`

---

## Verification Checklist

- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] Anti-pattern scan passes (0 violations)
- [ ] `jest.config.js` exists with correct moduleNameMapper for @/ alias
- [ ] `tests/__mocks__/` directory exists
- [ ] `tests/unit/store/authStore.test.ts` exists
- [ ] Test structure ready: `tests/unit/`, `tests/integration/`, `tests/__mocks__/`
- [ ] ALL items in the full validation checklist pass

---

## If Errors Are Found

1. **TypeScript errors**: Read the error message, identify the file, check which phase created it, re-read the doc, fix.
2. **Anti-pattern violations**: Search for the pattern, replace with the correct approach:
   - `console.log` → `logger.info/warn/error`
   - `StyleSheet.create` → `className="..."` with Nativewind
   - `: any` → proper type or `unknown`
   - `../` imports → `@/` alias
   - `Alert.alert` → `useToast().showError()`
   - `AsyncStorage` → `expo-secure-store` via `@/services/storage`
3. **Missing files**: Identify which phase should have created them, re-read its reference file and the corresponding doc.
4. **Wrong file content**: Compare with the doc template, identify the diff, fix.
