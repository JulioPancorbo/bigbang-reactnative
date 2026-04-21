# Phase 6 — Verification

This phase validates the entire conversion: TypeScript compilation, anti-pattern scan, structure check, and generates the final report.

## Docs to Read

- `docs/core/conventions.md` — All project conventions for validation
- `docs/core/structure-guide.md` — Expected folder structure

## Input

- All files created/modified in Phases 2-5
- Inventory from `/memories/session/stitch-inventory.md`
- Progress tracker from `/memories/session/stitch-progress.md`

## Steps

### 6.1 TypeScript Compilation

Run:
```bash
npx tsc --noEmit
```

If errors are found:
1. Categorize errors:
   - **Import errors**: missing module, wrong path → fix import
   - **Type errors**: missing type, wrong type → fix type definition
   - **Missing dependency**: package not installed → install it
2. Fix each error
3. Re-run `tsc --noEmit` until 0 errors

### 6.2 Anti-Pattern Scan

Search ALL files in `src/` for these patterns. Each is classified as ERROR (must fix) or WARNING (document):

#### ERRORS (must fix before completing)

| Pattern | Search Regex | Description |
|---|---|---|
| StyleSheet.create | `StyleSheet\.create` | Must use NativeWind className |
| console.log | `console\.(log\|warn\|error\|info\|debug)` | Must use logger.ts |
| Relative imports | `from ['"]\.\.\/` | Must use @/ alias |
| Any type | `: any` | Must use specific types |
| Alert.alert | `Alert\.alert` | Must use useToast |
| Direct fetch | `[^a-zA-Z]fetch\(` | Must use api.ts (Axios) |
| Screen without SafeAreaView | Screen files missing `SafeAreaView` import | All screens need it |
| TextInput without KAV | Screen with `TextInput` but no `KeyboardAvoidingView` | Forms need KAV |
| Web hover residual | `hover:` in className | Not supported in RN |
| Web transition residual | `transition-` in className | Not supported in RN |
| Material Symbols residual | `material-symbols-outlined` | Must be mapped to expo icons |
| Backdrop blur residual | `backdrop-blur` in className | Not supported in NativeWind |

#### WARNINGS (document in report)

| Pattern | Search | Description |
|---|---|---|
| Min-h-screen | `min-h-screen` in className | Should be flex-1 |
| Max-w constraint | `max-w-` in className | Should be removed for mobile |
| ActivityIndicator as main | `ActivityIndicator` without skeleton context | Should use boneyard skeleton |
| Shadow with color | `shadow-.*\/\d+` | Android ignores shadow colors |
| Fixed position | `position.*fixed` or className `fixed` | Should be absolute in RN |

### 6.3 Structure Validation

Verify file structure for each screen:

```
For each screen in inventory:
  ✓ src/screens/{ScreenName}/index.tsx exists
  ✓ Screen exports a named function (not default export)
  ✓ Screen file ≤ 300 lines
  ✓ If sub-components exist: src/screens/{ScreenName}/components/*.tsx
  ✓ Each sub-component ≤ 150 lines

For each shared component created:
  ✓ src/components/{ComponentName}/{ComponentName}.tsx exists
  ✓ src/components/{ComponentName}/index.ts exists
  ✓ Component file ≤ 150 lines
  ✓ Component has typed props (no any)

Navigation:
  ✓ All screens registered in appropriate stack/tab
  ✓ navigation-types.ts has params for all screens
  ✓ No orphan screens (created but not registered)

Design System:
  ✓ tailwind.config.js has Stitch color tokens
  ✓ Font package installed (check pnpm list)
  ✓ App.tsx loads fonts with useFonts
```

### 6.4 Generate TODO-assets.md

If any screens have placeholder images (from Stitch AI-generated URLs):

Create `TODO-assets.md` at project root:

```markdown
# Assets to Replace

These images are AI-generated placeholders from Google Stitch.
Replace each with actual assets before production.

| Screen | Current URL | Description | Suggested Asset |
|---|---|---|---|
| {ScreenName} | {url} | {data-alt description} | {suggested_replacement} |
```

### 6.5 Count TODOs

Search all created files for `// TODO:` comments:
```bash
grep -rn "// TODO:" src/screens/ src/components/ src/hooks/ src/services/api.ts src/types/models.ts
```

Categorize:
- Asset replacement TODOs
- Animation TODOs
- Social login TODOs
- API implementation TODOs
- Decorative background TODOs

### 6.6 Generate Final Report

Compile all results into a structured report for the orchestrator to present to the user.

Report format:
```markdown
# Stitch-to-RN Conversion Report

## Summary
- Screens converted: {N}
- Shared components created: {N}
- Design tokens applied: {N} colors, {N} radius, font: {name}
- Lines of code generated: ~{N}

## Screens
| Screen | Lines | Sub-components | Has Form | TODOs |
|---|---|---|---|---|
| {Name} | {N} | {count} | {yes/no} | {count} |

## Shared Components
| Component | Lines | Used By |
|---|---|---|
| {Name} | {N} | {screens} |

## Design System
- Primary: {hex} | Secondary: {hex} | Tertiary: {hex}
- Font: {name} (installed: yes/no)
- Color tokens: {N} applied to tailwind.config.js
- borderRadius: {values}

## TypeScript
- Compilation: {PASS/FAIL}
- Errors found: {N} (fixed: {N})

## Anti-Pattern Scan
- Errors found: {N}
- Warnings found: {N}
- Details: {list}

## TODOs Generated
- Asset replacements: {N}
- Animations: {N}
- Social login: {N}
- API stubs: {N}
- Other: {N}

## Navigation
- Auth flow: {screen list}
- Tab bar: {screen list with icons}
- Full-screen: {screen list}

## Files Created/Modified
{list of all files}
```

---

## Verification Checklist (Final)

- [ ] `tsc --noEmit` passes with 0 errors
- [ ] Anti-pattern scan: 0 ERRORS remaining
- [ ] All screens have SafeAreaView root
- [ ] All form screens have KeyboardAvoidingView
- [ ] No web-only CSS residuals in any file
- [ ] No Material Symbols residuals
- [ ] All screens registered in navigation
- [ ] All shared components have index.ts re-export
- [ ] No file exceeds line limits (300 screen, 150 component)
- [ ] Font package installed and loaded in App.tsx
- [ ] tailwind.config.js has Stitch tokens (NativeWind preset preserved)
- [ ] TODO-assets.md created (if placeholder images exist)
- [ ] Final report generated
