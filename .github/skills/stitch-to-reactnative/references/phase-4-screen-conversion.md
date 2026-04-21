# Phase 4 — Screen Conversion

This phase converts a SINGLE Stitch screen to React Native. **One subagent per screen.**

## Docs to Read

- `references/html-to-rn-mapping.md` — Complete element, attribute, and class mapping
- `references/stitch-specifics.md` — Icon mapping, web-only effects resolution
- `docs/core/templates-snippets.md` — Screen template patterns
- `docs/core/conventions.md` — Naming, imports, file structure
- `docs/core/hooks-and-state.md` — Hook patterns, useFormState, React Query

## Input (provided by orchestrator in the subagent prompt)

- `SCREEN_NAME`: PascalCase name for the screen (e.g. "Login")
- `SCREEN_HTML`: Full `code.html` content OR path to read it
- `SCREENSHOT_PATH`: Path to `.png` screenshot (optional, use `view_image` if available)
- `SHARED_COMPONENTS`: List of shared components created in Phase 3 with their props
- `ICON_MAP`: Subset of icon mappings relevant to this screen
- `DESIGN_TOKENS`: Applied color/font tokens from Phase 2
- `WORKSPACE_ROOT`: Path to project root

## Steps

### 4.1 Analyze the Screen HTML

1. Read the `code.html` content (or read from provided path)
2. If screenshot is available, view it with `view_image` for visual reference
3. Identify the `<body>` content — ignore `<head>`, `<script>`, `<style>` blocks
4. Map the high-level layout structure:
   - Is it a full-height layout with header + content + footer?
   - Is it centered content (welcome/splash)?
   - Is it a scrollable form?
   - Is it a list/grid of items?

### 4.2 Create Screen File

Create `src/screens/{SCREEN_NAME}/index.tsx`

#### Standard Screen Template

```tsx
import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// Add other imports as needed
// import { useNavigation } from '@react-navigation/native'
// import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
// import type { AuthStackParamList } from '@/navigation'

export function {SCREEN_NAME}(): React.JSX.Element {
  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* converted content */}
    </SafeAreaView>
  )
}
```

#### Screen with Form (has TextInput)

```tsx
import React from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm } from '@/hooks/useFormState'
import { useToast } from '@/hooks/useToast'
import { logger } from '@/services/logger'
// import validation functions from @/utils/validators

export function {SCREEN_NAME}(): React.JSX.Element {
  const { showError } = useToast()

  const { values, errors, loading, handleChange, handleSubmit } = useForm({
    initialValues: { /* fields from the form */ },
    onSubmit: async (vals) => {
      // TODO: implement with actual service call
      logger.info('[{SCREEN_NAME}] submit', vals)
    },
    onError: (error) => {
      logger.error('[{SCREEN_NAME}] submit failed', error)
      const message = error instanceof Error ? error.message : 'Error inesperado'
      showError('Error', message)
    },
    validate: (vals) => {
      const errs: Record<string, string> = {}
      // TODO: add validation rules
      return errs
    },
  })

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* converted form content */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
```

### 4.3 Convert HTML Elements

Process the `<body>` content top-to-bottom, applying these rules:

#### Elements
- `<div>` → `<View>`
- `<main>`, `<header>`, `<footer>`, `<section>`, `<nav>` → `<View>`
- `<p>`, `<span>`, `<h1>`–`<h6>`, `<label>` → `<Text>`
- `<a href="#">...text...</a>` → `<TouchableOpacity onPress={...}><Text>...text...</Text></TouchableOpacity>`
- `<button>...text...</button>` → Use `<Button>` component if it matches, or `<TouchableOpacity><Text>text</Text></TouchableOpacity>`
- `<input>` → `<TextInput>` or `<StyledTextInput>` (if shared component exists)
- `<img>` → `<Image>` from `expo-image`
- `<form>` → Remove wrapper, keep inner content. Form logic goes to `useFormState` hook
- `<br>` → Remove (use spacing via className)
- `<hr>` → `<Divider>` component or `<View className="h-px bg-warm-gray/10" />`

#### Text Content Rules
- ALL text must be inside `<Text>` — never bare text in `<View>`
- Nested text: `<Text>Don't have an account? <Text className="text-primary font-bold">Sign up</Text></Text>`
- If the nested text is a link → wrap inner `<Text>` in `<TouchableOpacity>` or make the whole `<Text>` pressable

#### Image Rules
- `<img src="https://lh3.googleusercontent.com/aida-public/...">` →
  ```tsx
  <Image
    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/...' }}
    className="w-32 h-32" // match original dimensions from className
    contentFit="contain"
  />
  // TODO: replace with actual asset
  ```
- Google logo / Apple logo in social login → Use `<Ionicons>` instead of `<Image>`

#### Icon Rules
- `<span class="material-symbols-outlined">icon_name</span>` →
  ```tsx
  <Ionicons name="{mapped_name}" size={N} color="{color}" />
  ```
- Determine `size` from the text size class (e.g. `text-[40px]` → `size={40}`, `text-3xl` → `size={30}`, `text-2xl` → `size={24}`)
- Determine `color` from the text color class (e.g. `text-primary` → use primary hex, `text-terracotta` → use terracotta hex)
- Check `FILL` variant: `font-variation-settings: 'FILL' 1` → use filled icon name

### 4.4 Convert CSS Classes

Apply the mapping from `html-to-rn-mapping.md`:

1. **Keep** all supported Tailwind classes (layout, spacing, sizing, typography, colors, borders, opacity, overflow, position, shadow)
2. **REMOVE** all web-only classes:
   ```
   hover:*  active:scale-*  transition-*  backdrop-blur-*
   cursor-*  select-*  selection:*  underline-offset-*
   ring-*  outline-*  focus:*  focus-within:*  focus-visible:*
   group-hover:*  placeholder:*  @container  scroll-smooth
   snap-*  will-change-*  appearance-*  animate-*
   ```
3. **REPLACE**:
   - `min-h-screen` → `flex-1`
   - `max-w-md` / `max-w-[*px]` → remove
   - `grid grid-cols-N` → `flex-row flex-wrap` + `w-1/N` on children
   - `fixed` → `absolute` (or remove if decorative)
   - `w-screen` → `w-full`
4. **SIMPLIFY**:
   - `shadow-lg shadow-primary/20` → `shadow-lg` (Android ignores shadow color)
   - `blur-[80px]` decorative backgrounds → `<View className="absolute ... bg-{color}/5 rounded-full" />` or remove entirely

### 4.5 Handle Decorative Backgrounds

Stitch often generates decorative blur elements:
```html
<div class="fixed top-[-10%] right-[-10%] w-64 h-64 bg-primary-container/5 rounded-full blur-[80px] -z-10"></div>
```

Resolution:
- If 1-2 small decorative elements → simplify to `<View>` with color + opacity, no blur
- If many decorative elements → remove them entirely
- Add `// TODO: decorative background blur` comment where removed

### 4.6 Handle Navigation Links

For every `<a>` or `<button>` that navigates to another screen:
1. Determine the target screen name from the button text (e.g. "Log in" → Login, "Sign up" → Register)
2. Convert to:
   ```tsx
   <TouchableOpacity onPress={() => navigation.navigate('{TargetScreen}')}>
     <Text className="text-primary font-bold">{link_text}</Text>
   </TouchableOpacity>
   ```
3. Add navigation import and typing at the top of the file
4. If the target screen doesn't exist in the project yet → still add the navigation call (it will be typed in Phase 5)

### 4.7 Handle Guest Mode

If this screen is Welcome/Login and has a "Continue as guest" button:
```tsx
import { useAuth } from '@/hooks/useAuth'

// Inside component:
const { loginAsGuest } = useAuth()

// Button:
<Button label="Continue as guest" onPress={loginAsGuest} variant="secondary" />
```

### 4.8 Create Supporting Files (if needed)

#### Hook Stub (if screen needs server data)
Create `src/hooks/use{SCREEN_NAME}.ts`:
```tsx
import { useQuery } from '@tanstack/react-query'
import { logger } from '@/services/logger'
// import { fetch{Entity} } from '@/services/api'

export function use{SCREEN_NAME}() {
  // TODO: implement with actual API call
  return useQuery({
    queryKey: ['{screen-name}'],
    queryFn: async () => {
      logger.info('[use{SCREEN_NAME}] fetching data')
      // return fetch{Entity}()
      return [] // placeholder
    },
  })
}
```

#### Type Stub (if screen uses data models)
Add to `src/types/models.ts`:
```typescript
export type {EntityName} = {
  id: string
  // TODO: define entity fields based on API spec
}
```

#### API Stub (if screen needs endpoints)
Add to `src/services/api.ts`:
```typescript
// TODO: implement {SCREEN_NAME} endpoints
// export const fetch{Entity} = async (): Promise<{EntityType}[]> => {
//   const { data } = await api.get('/{endpoint}')
//   return data
// }
```

### 4.9 Extract Sub-Components (if screen exceeds 300 lines)

If the converted screen exceeds 300 lines:
1. Identify logical sections (header, card, form section, footer)
2. Extract to `src/screens/{SCREEN_NAME}/components/{SubComponent}.tsx`
3. Each sub-component max 150 lines
4. Import with relative path from the screen's own components folder:
   ```tsx
   // Exception: screen-local components can use relative imports
   import { LoginForm } from './components/LoginForm'
   ```
   **NOTE**: This is the ONLY exception to the @/ import rule — screen-local sub-components.

---

## Output

For each screen, report:
- Files created: `src/screens/{Name}/index.tsx` + any sub-components, hooks, types, api stubs
- Lines count for the screen file
- Web-only effects removed (count)
- Icons mapped (count)
- TODOs added (list)
- Any issues or ambiguities found

---

## Verification Checklist (per screen)

- [ ] Screen file created at `src/screens/{SCREEN_NAME}/index.tsx`
- [ ] Screen does not exceed 300 lines (sub-components extracted if needed)
- [ ] `SafeAreaView` is the root wrapper
- [ ] `KeyboardAvoidingView` present if screen has `TextInput`
- [ ] All imports use `@/` alias (except screen-local sub-components)
- [ ] No `StyleSheet.create`
- [ ] No `console.log`
- [ ] No `any` type
- [ ] No web-only CSS residuals (hover, transition, blur, min-h-screen, max-w-md)
- [ ] No `<span class="material-symbols-outlined">` residuals — all mapped to Ionicons
- [ ] All `<Text>` content wrapped in `<Text>` component (no bare strings in `<View>`)
- [ ] All navigation uses `useNavigation` with proper typing
- [ ] Form screens use `useFormState` hook
- [ ] Placeholder images have `// TODO: replace with actual asset` comment
- [ ] Function has explicit return type
- [ ] Exported as named export (not default)
