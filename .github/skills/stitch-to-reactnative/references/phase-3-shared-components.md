# Phase 3 — Shared Components

This phase creates reusable components identified during Phase 1 analysis.

## Docs to Read

- `references/html-to-rn-mapping.md` — HTML to RN element and class mapping
- `references/stitch-specifics.md` — Icon mapping, web-only effects
- [docs/core/templates-snippets.md](docs/core/templates-snippets.md) — Component template patterns
- [docs/core/conventions.md](docs/core/conventions.md) — Naming conventions, imports

## Input

- Inventory from `/memories/session/stitch-inventory.md` (shared components list)
- Tailwind tokens applied in Phase 2
- Screen HTML files (to extract component patterns)

## Steps

### 3.1 Review Component Inventory

Read the "Shared Components" section from `/memories/session/stitch-inventory.md`.
For each component, read the relevant HTML from the screens where it appears.

### 3.2 Create Components

For EACH shared component identified, follow this pattern:

#### File Structure
```
src/components/{ComponentName}/
├── {ComponentName}.tsx    # Component implementation
└── index.ts               # Re-export
```

#### index.ts Template
```typescript
export { {ComponentName} } from './{ComponentName}'
```

#### Component Template
```tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
// Add other imports as needed

type {ComponentName}Props = {
  // Define props based on component usage across screens
}

export function {ComponentName}({ ...props }: {ComponentName}Props): React.JSX.Element {
  return (
    // NativeWind className only — never StyleSheet.create
  )
}
```

### 3.3 Component-Specific Instructions

#### Button (update existing)

The template already has `src/components/Button/Button.tsx`. Update it to match Stitch design:
- Check if existing variants (primary, secondary, danger) cover the Stitch button styles
- If Stitch has additional button styles → add new variants
- Update colors to use new Stitch tokens
- Update borderRadius to match Stitch roundedness
- Keep the existing API (`label`, `onPress`, `variant`, `disabled`, `className` props)

Common Stitch button patterns:
```html
<!-- Primary -->
<button class="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-lg">
<!-- Secondary (outlined) -->
<button class="w-full h-14 border-2 border-primary text-primary font-bold rounded-2xl bg-white/50">
<!-- Text only -->
<a class="text-primary font-bold hover:underline">
```

#### StyledTextInput (new)

Stitch generates styled inputs with specific patterns:
```html
<input class="w-full h-14 bg-input-light border-none rounded-2xl px-5 placeholder:text-warm-gray/60 focus:ring-2 focus:ring-primary/50">
```

Convert to:
```tsx
import React from 'react'
import { View, Text, TextInput, type TextInputProps } from 'react-native'

type StyledTextInputProps = TextInputProps & {
  label?: string
  error?: string
  rightIcon?: React.ReactNode
}

export function StyledTextInput({
  label,
  error,
  rightIcon,
  className,
  ...props
}: StyledTextInputProps): React.JSX.Element {
  return (
    <View className="gap-2">
      {label ? (
        <Text className="text-sm font-semibold text-deep-brown ml-1">{label}</Text>
      ) : null}
      <View className="relative">
        <TextInput
          className={`w-full h-14 bg-input-light rounded-2xl px-5 text-deep-brown ${rightIcon ? 'pr-12' : ''} ${className ?? ''}`}
          placeholderTextColor="#7A6C6299"
          {...props}
        />
        {rightIcon ? (
          <View className="absolute right-4 top-0 bottom-0 justify-center">
            {rightIcon}
          </View>
        ) : null}
      </View>
      {error ? (
        <Text className="text-danger text-sm ml-1">{error}</Text>
      ) : null}
    </View>
  )
}
```

**NOTE**: Replace color values (`text-deep-brown`, `bg-input-light`, etc.) with the actual tokens applied in Phase 2. The colors above are examples from the Wishify design.

#### Divider (new)

```tsx
import React from 'react'
import { View, Text } from 'react-native'

type DividerProps = {
  text?: string
  className?: string
}

export function Divider({ text, className }: DividerProps): React.JSX.Element {
  if (!text) {
    return <View className={`h-px bg-warm-gray/10 ${className ?? ''}`} />
  }

  return (
    <View className={`flex-row items-center ${className ?? ''}`}>
      <View className="flex-1 h-px bg-warm-gray/10" />
      <Text className="px-3 text-xs uppercase text-warm-gray/50">{text}</Text>
      <View className="flex-1 h-px bg-warm-gray/10" />
    </View>
  )
}
```

#### SocialLoginButton (new)

```tsx
import React from 'react'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

type SocialLoginButtonProps = {
  provider: 'google' | 'apple'
  onPress: () => void
  className?: string
}

export function SocialLoginButton({
  provider,
  onPress,
  className,
}: SocialLoginButtonProps): React.JSX.Element {
  const iconName = provider === 'google' ? 'logo-google' : 'logo-apple'

  return (
    <TouchableOpacity
      className={`flex-1 h-12 border border-warm-gray/10 rounded-2xl items-center justify-center ${className ?? ''}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={iconName} size={20} color="#3A312B" />
    </TouchableOpacity>
  )
}
```

**NOTE**: The `onPress` handler should be a `// TODO: implement with expo-auth-session` placeholder.

#### IconBadge / IconContainer (new, if detected)

For circular icon backgrounds found in Stitch:
```html
<div class="bg-primary/10 p-4 rounded-full">
  <span class="material-symbols-outlined text-primary text-[40px]">favorite</span>
</div>
```

```tsx
import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { ComponentProps } from 'react'

type IconBadgeProps = {
  name: ComponentProps<typeof Ionicons>['name']
  size?: number
  color?: string
  bgClassName?: string
  className?: string
}

export function IconBadge({
  name,
  size = 24,
  color = '#9f3c27',
  bgClassName = 'bg-primary/10',
  className,
}: IconBadgeProps): React.JSX.Element {
  return (
    <View className={`p-4 rounded-full items-center justify-center ${bgClassName} ${className ?? ''}`}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  )
}
```

### 3.4 Only Create What's Needed

Do NOT create components that are not in the inventory. Only create:
1. Components that appear in **2 or more screens**
2. The Button component (update existing if needed)
3. StyledTextInput if ANY screen has form inputs

### 3.5 Update Existing Components

If the existing `Button` component in the template needs updates:
- Read the current implementation first
- Only change what's necessary to match Stitch styling
- Preserve the existing API surface (don't rename props)
- Add new variants if needed, don't remove existing ones

---

## Verification Checklist

- [ ] Each component has `{ComponentName}.tsx` + `index.ts`
- [ ] All components use `className` only — no `StyleSheet.create`
- [ ] All components have TypeScript props type (no `any`)
- [ ] All components have explicit return type `React.JSX.Element`
- [ ] No component exceeds 150 lines
- [ ] All imports use `@/` alias
- [ ] No `console.log` — use logger if logging needed
- [ ] No web-only CSS residuals (hover, transition, etc.)
- [ ] Icon mappings use `@expo/vector-icons` (Ionicons or MaterialCommunityIcons)
- [ ] Color tokens match what was applied in Phase 2 `tailwind.config.js`
- [ ] Only components from the inventory were created (no extra)
