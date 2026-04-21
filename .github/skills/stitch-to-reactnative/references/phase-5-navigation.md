# Phase 5 — Navigation

This phase registers all converted screens in the navigation system.

## Docs to Read

- `docs/core/navigation-patterns.md` — Navigation architecture and patterns
- `docs/core/templates-snippets.md` — Stack/Tab registration templates

## Input

- Inventory from `/memories/session/stitch-inventory.md` (navigation structure)
- List of all screens created in Phase 4
- Current navigation files in the project

## Steps

### 5.1 Read Current Navigation Files

Read these files to understand the existing structure:
- `src/navigation/navigation-types.ts`
- `src/navigation/stacks/AuthStack.tsx`
- `src/navigation/stacks/AppStack.tsx`
- `src/navigation/stacks/AppTabs.tsx`
- `src/navigation/RootNavigator.tsx`
- `src/navigation/hooks.ts`
- `src/navigation/index.ts`

### 5.2 Update navigation-types.ts

Update the param lists to include ALL new screens:

```typescript
// — Auth (usuario no autenticado) —
export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  Register: undefined
  // Add new auth screens:
  // ForgotPassword: undefined
  // Onboarding: undefined
}

// — App: stack principal autenticado —
export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabsParamList>
  // Add full-screen screens from inventory:
  // ProductDetail: { productId: string }
  // Settings: undefined
}

// — Tabs principales —
export type AppTabsParamList = {
  Home: undefined
  Profile: undefined
  // Add/modify tab screens from inventory:
  // Search: undefined
  // Favorites: undefined
}
```

For each screen:
- If it has route params → define them as typed properties
- If it has no params → `undefined`
- Match the name EXACTLY with how it was created in Phase 4

### 5.3 Update AuthStack.tsx

For each screen in the Auth flow (from inventory):
1. Add import statement
2. Add `<Stack.Screen>` entry

```tsx
import { {ScreenName} } from '@/screens/{ScreenName}'

// In the Navigator:
<Stack.Screen name="{ScreenName}" component={{ScreenName}} />
```

Screen options:
- All auth screens default to `headerShown: false`
- If a screen needs a back button → `headerShown: true` with minimal header

### 5.4 Update AppTabs.tsx

For each tab screen (from inventory):
1. Add import statement
2. Add `<Tab.Screen>` entry with icon

Determine tab icons from:
- The Phase 1 inventory "Navigation Structure" section
- Map tab purpose to Ionicons:
  - Home → `home-outline` / `home`
  - Search/Explore → `search-outline` / `search`
  - Favorites/Wishlist → `heart-outline` / `heart`
  - Profile → `person-outline` / `person`
  - Settings → `settings-outline` / `settings`
  - Cart → `cart-outline` / `cart`
  - Notifications → `notifications-outline` / `notifications`

```tsx
<Tab.Screen
  name="{TabName}"
  component={{TabName}}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="{icon-outline}" size={size} color={color} />
    ),
    tabBarLabel: '{Display Label}',
  }}
/>
```

Tab bar styling should match the Stitch design:
- Background color: `surface` or `background` token
- Active tint color: `primary` token
- Inactive tint color: `warm-gray` or `secondary` token

```tsx
<Tab.Navigator
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: '{primary_hex}',
    tabBarInactiveTintColor: '{warm_gray_hex}',
    tabBarStyle: {
      backgroundColor: '{background_hex}',
      borderTopColor: '{outline_variant_hex}',
    },
  }}
>
```

### 5.5 Update AppStack.tsx

For each full-screen (non-tab) screen in the App flow:
1. Add import statement
2. Add `<Stack.Screen>` entry

```tsx
import { {ScreenName} } from '@/screens/{ScreenName}'

<Stack.Screen name="{ScreenName}" component={{ScreenName}} />
```

### 5.6 Handle New Navigation Patterns (if needed)

If the inventory specifies navigation patterns that don't exist in the template:

#### Drawer Navigation
- Install: `{PKG_MANAGER} add @react-navigation/drawer react-native-gesture-handler react-native-reanimated`
- Create: `src/navigation/stacks/AppDrawer.tsx`
- Update: `RootNavigator.tsx` if drawer replaces or wraps tabs

#### Onboarding Flow
- If screens are sequential pages → use a stack with custom transitions
- Or use a `<FlatList>` pager approach inside a single screen

#### Modal Screens
- Add to `AppStack.tsx` with `presentation: 'modal'`:
  ```tsx
  <Stack.Screen
    name="{ModalName}"
    component={{ModalName}}
    options={{ presentation: 'modal' }}
  />
  ```

### 5.7 Update index.ts Exports

Ensure `src/navigation/index.ts` exports all type aliases needed by screens:

```typescript
export type {
  RootStackParamList,
  AuthStackParamList,
  AppStackParamList,
  AppTabsParamList,
  AuthScreenProps,
  AppStackScreenProps,
  AppTabsScreenProps,
} from './navigation-types'
```

---

## Verification Checklist

- [ ] `navigation-types.ts` has param types for ALL screens created in Phase 4
- [ ] No screen is missing from stacks/tabs registration
- [ ] All screen imports use `@/` alias
- [ ] Tab icons are set using `Ionicons` (not Material Symbols)
- [ ] Tab bar colors match Stitch design tokens
- [ ] Auth flow screens are in `AuthStack`
- [ ] Tab screens are in `AppTabs`
- [ ] Full-screen (non-tab) screens are in `AppStack`
- [ ] Modal screens have `presentation: 'modal'` option
- [ ] `index.ts` exports all necessary types
- [ ] No duplicate screen names across stacks
- [ ] Screen names in navigation match the exported function names exactly
