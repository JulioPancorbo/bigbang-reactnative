# Phase 2 — Design System

This phase applies the Stitch design tokens to the project's `tailwind.config.js` and installs custom fonts.

## Docs to Read

- `references/stitch-specifics.md` — Token priority, font name mapping
- [docs/core/nativewind-theme.md](docs/core/nativewind-theme.md) — NativeWind theme conventions
- [docs/core/project-setup.md](docs/core/project-setup.md) — Project configuration patterns

## Input

- Inventory from `/memories/session/stitch-inventory.md` (Phase 1 output)
- Tailwind config tokens extracted from HTML `<script id="tailwind-config">`
- DESIGN.md tokens
- Current `tailwind.config.js` in project

## Steps

### 2.1 Read Current tailwind.config.js

Read the existing `tailwind.config.js` at the workspace root. Note:
- Existing color tokens (primary, secondary, success, danger, etc.)
- Existing fontFamily settings
- NativeWind preset configuration (MUST be preserved)
- Content paths (MUST be preserved)

### 2.2 Determine Which Tokens to Include

From the Tailwind config inline extracted in Phase 1:
1. Scan ALL screen HTML bodies for actual class usage
2. For each color token in the config, check if any screen uses `text-{token}`, `bg-{token}`, or `border-{token}`
3. **ONLY include tokens that are actually used** — do NOT import all ~40 MD3 tokens if only 10 are used
4. Always include: `primary`, `secondary`, `tertiary`, `error`, `background`, `surface`, `on-primary`, `on-surface`
5. Include custom colors (terracotta, warm-gray, deep-brown, etc.) only if used in HTML bodies

### 2.3 Map Colors to tailwind.config.js

Update `tailwind.config.js > theme.extend.colors` with:

```javascript
// Map from Stitch tokens
colors: {
  // Core (always included)
  primary: '{primary_hex}',
  secondary: '{secondary_hex}',
  tertiary: '{tertiary_hex}',
  danger: '{error_hex}',           // template convention: "danger" not "error"
  background: '{background_hex}',
  surface: '{surface_hex}',

  // Text colors (from on-* tokens)
  'on-primary': '{on_primary_hex}',
  'on-surface': '{on_surface_hex}',
  'on-background': '{on_background_hex}',

  // Surface variants (if used)
  'surface-container': '{hex}',
  'surface-container-high': '{hex}',

  // Custom Stitch colors (if used in HTML bodies)
  'warm-gray': '{hex}',
  'deep-brown': '{hex}',
  'input-light': '{hex}',
  // ... only those actually referenced in className usage
}
```

### 2.4 Map Custom CSS Classes

If Phase 1 found custom `<style>` classes (e.g. `.bg-terracotta { background-color: #C85A43; }`):
1. Extract the color value
2. Check if it's already covered by a Tailwind token (e.g. `terracotta` might equal `primary`)
3. If NOT covered → add as a new color token
4. If it IS the same as an existing token → note it as alias, use the token name in conversions

### 2.5 Map borderRadius

Update `tailwind.config.js > theme.extend.borderRadius`:

```javascript
borderRadius: {
  DEFAULT: '{default_value}',   // e.g. '0.5rem' for Moderate, '0.25rem' for Sharp
  lg: '{lg_value}',             // e.g. '1rem'
  xl: '{xl_value}',             // e.g. '1.5rem'
  '2xl': '{2xl_value}',         // e.g. '2rem' (if present)
  '3xl': '{3xl_value}',         // e.g. '3rem' (if present)
  full: '9999px',               // always
}
```

### 2.6 Map Spacing

Based on DESIGN.md Spacing level:
- **Compact (1)**: No changes needed (Tailwind defaults are fine)
- **Normal (2)**: No changes needed (Tailwind defaults are fine)
- **Expanded (3)**: Add custom spacing scale:
  ```javascript
  spacing: {
    '4.5': '1.125rem',
    '5.5': '1.375rem',
    '7': '1.75rem',
    '9': '2.25rem',
  }
  ```

### 2.7 Apply Changes to tailwind.config.js

Write the updated `tailwind.config.js`. **PRESERVE**:
- The NativeWind preset (`presets: [require('nativewind/preset')]` or similar)
- The `content` array
- The `darkMode` setting
- Any existing `plugins` configuration

### 2.8 Install and Configure Fonts

1. Determine the font package name from `stitch-specifics.md` font mapping table
2. Install: `{PKG_MANAGER} add @expo-google-fonts/{font-package}`
3. Also install `expo-splash-screen` if not already present
4. Update `App.tsx`:

```tsx
// Add at the top of App.tsx
import { useFonts, {FontName}_400Regular, {FontName}_500Medium, {FontName}_600SemiBold, {FontName}_700Bold, {FontName}_800ExtraBold } from '@expo-google-fonts/{font-package}'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

// Inside the App component, before the return:
const [fontsLoaded] = useFonts({
  '{FontName}_400Regular': {FontName}_400Regular,
  '{FontName}_500Medium': {FontName}_500Medium,
  '{FontName}_600SemiBold': {FontName}_600SemiBold,
  '{FontName}_700Bold': {FontName}_700Bold,
  '{FontName}_800ExtraBold': {FontName}_800ExtraBold,
})

React.useEffect(() => {
  if (fontsLoaded) {
    SplashScreen.hideAsync()
  }
}, [fontsLoaded])

if (!fontsLoaded) {
  return null
}
```

5. Update `tailwind.config.js` fontFamily:
```javascript
fontFamily: {
  sans: ['{FontName}_400Regular'],
  'sans-medium': ['{FontName}_500Medium'],
  'sans-semibold': ['{FontName}_600SemiBold'],
  'sans-bold': ['{FontName}_700Bold'],
  'sans-extrabold': ['{FontName}_800ExtraBold'],
  headline: ['{FontName}_700Bold'],
  body: ['{FontName}_400Regular'],
  label: ['{FontName}_500Medium'],
}
```

**NOTE**: The font weight mapping should match what's available in the Google Fonts package. Check `@expo-google-fonts/{font-package}` exports to see available weights.

### 2.9 Create Color Aliases for Template Compatibility

Ensure the template's expected color tokens still work:
- `primary` → mapped from Stitch primary
- `secondary` → mapped from Stitch secondary
- `danger` → mapped from Stitch error (NOT "error" — template uses "danger")
- `success` → keep existing or add `#34C759` as default if not in Stitch
- If Stitch uses `error` as a color name in HTML, add both `error` and `danger` pointing to same hex

---

## Verification Checklist

- [ ] `tailwind.config.js` updated with Stitch color tokens
- [ ] Only actually-used tokens included (not all ~40 MD3 tokens)
- [ ] NativeWind preset preserved in config
- [ ] `content` paths preserved in config
- [ ] `borderRadius` tokens applied
- [ ] Font package installed (`pnpm list @expo-google-fonts/*`)
- [ ] `App.tsx` loads fonts with `useFonts`
- [ ] `SplashScreen.preventAutoHideAsync()` called before font loading
- [ ] `fontFamily` tokens registered in `tailwind.config.js`
- [ ] Template color aliases preserved (primary, danger, success)
- [ ] No `StyleSheet.create` introduced
- [ ] File is valid JavaScript (no syntax errors)
