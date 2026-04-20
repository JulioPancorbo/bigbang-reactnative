# Stitch-Specific Reference

This document contains Google Stitch export format details, Material Symbols mapping, and web-only effects that must be handled during conversion.

---

## Stitch Export Format

### Manual Export Structure

```
stitch_export/
├── {design_system_name}/           # e.g. warm_minimalism/
│   └── DESIGN.md                   # High-level design tokens
├── {screen_name}/                  # e.g. wishify_welcome_screen/
│   ├── code.html                   # Full HTML + inline Tailwind config
│   └── screenshot.png              # Visual reference (optional)
└── ...
```

### DESIGN.md Format

```markdown
# Design System

## Theme

### Color
- **Color Mode**: light|dark
- **Primary Color**: `#hex`
- **Secondary Color**: `#hex`
- **Tertiary Color**: `#hex`
- **Neutral Color**: `#hex`

### Typography
- **Headline Font**: fontName (camelCase, e.g. plusJakartaSans)
- **Body Font**: fontName
- **Label Font**: fontName

### Shape
- **Roundedness**: Sharp (1) | Moderate (2) | Full (3)

### Spacing
- **Spacing**: Compact (1) | Normal (2) | Expanded (3)
```

### code.html Structure

Each `code.html` is a complete HTML document containing:

1. **`<head>`** with:
   - Google Fonts CDN link(s): `<link href="https://fonts.googleapis.com/css2?family=...">`
   - Material Symbols Outlined CDN link
   - Tailwind CDN: `<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries">`
   - **Inline Tailwind config** in `<script id="tailwind-config">`:
     ```javascript
     tailwind.config = {
       darkMode: "class",
       theme: {
         extend: {
           colors: {
             // MD3 semantic colors (~30-40 tokens)
             "primary": "#9f3c27",
             "on-primary": "#ffffff",
             "primary-container": "#bf533d",
             "surface": "#fcf9f4",
             "background": "#fcf9f4",
             "error": "#ba1a1a",
             // ... plus custom colors
             "warm-gray": "#7A6C62",
             "deep-brown": "#3A312B",
             "input-light": "#F4F0EA",
           },
           fontFamily: {
             "headline": ["Plus Jakarta Sans", "sans-serif"],
             "body": ["Plus Jakarta Sans", "sans-serif"],
             "label": ["Plus Jakarta Sans", "sans-serif"]
           },
           borderRadius: {
             "DEFAULT": "0.5rem",  // or "1rem" depending on roundedness
             "lg": "1rem",        // or "2rem"
             "xl": "1.5rem",      // or "3rem"
             "full": "9999px"
           }
         }
       }
     }
     ```
   - Custom `<style>` blocks with additional classes (e.g. `.bg-terracotta`, `.text-warm-grey`)

2. **`<body>`** with the screen layout using Tailwind classes

### Token Priority

```
Priority 1: <script id="tailwind-config"> from HTML (most detailed, has all MD3 + custom colors)
Priority 2: DESIGN.md (high-level summary, good for validation)
Priority 3: MCP design system API (equivalent to DESIGN.md)
```

If tokens from Priority 1 conflict with DESIGN.md, alert the user but use Priority 1.

---

## Material Symbols → @expo/vector-icons Mapping

Stitch uses Google Material Symbols Outlined via:
```html
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0|1">icon_name</span>
```

### Common Mappings

| Material Symbol | @expo/vector-icons | Library | Notes |
|---|---|---|---|
| `favorite` | `heart` | Ionicons | FILL 1 = filled variant |
| `favorite_border` | `heart-outline` | Ionicons | |
| `visibility` | `eye-outline` | Ionicons | |
| `visibility_off` | `eye-off-outline` | Ionicons | |
| `auto_awesome` | `sparkles` | Ionicons | Or `auto-fix` from MaterialCommunityIcons |
| `magic_button` | `flash-outline` | Ionicons | Or `creation` from MaterialCommunityIcons |
| `ios` | `logo-apple` | Ionicons | Or use `<Text>` with Apple logo text |
| `search` | `search` | Ionicons | |
| `close` | `close` | Ionicons | |
| `arrow_back` | `arrow-back` | Ionicons | |
| `arrow_forward` | `arrow-forward` | Ionicons | |
| `menu` | `menu` | Ionicons | |
| `settings` | `settings-outline` | Ionicons | |
| `person` | `person-outline` | Ionicons | |
| `home` | `home-outline` | Ionicons | |
| `notifications` | `notifications-outline` | Ionicons | |
| `add` | `add` | Ionicons | |
| `edit` | `create-outline` | Ionicons | |
| `delete` | `trash-outline` | Ionicons | |
| `share` | `share-outline` | Ionicons | |
| `shopping_cart` | `cart-outline` | Ionicons | |
| `check_circle` | `checkmark-circle` | Ionicons | |
| `error` | `alert-circle` | Ionicons | |
| `info` | `information-circle-outline` | Ionicons | |
| `warning` | `warning-outline` | Ionicons | |
| `camera` | `camera-outline` | Ionicons | |
| `photo` | `image-outline` | Ionicons | |
| `location_on` | `location-outline` | Ionicons | |
| `calendar_today` | `calendar-outline` | Ionicons | |
| `star` | `star` | Ionicons | |
| `star_border` | `star-outline` | Ionicons | |
| `thumb_up` | `thumbs-up-outline` | Ionicons | |
| `chat` | `chatbubble-outline` | Ionicons | |
| `mail` | `mail-outline` | Ionicons | |
| `phone` | `call-outline` | Ionicons | |
| `lock` | `lock-closed-outline` | Ionicons | |
| `logout` | `log-out-outline` | Ionicons | |

### FILL Variant Handling

```
FILL 0 → use "-outline" variant (e.g. heart-outline)
FILL 1 → use filled variant (e.g. heart)
```

If `font-variation-settings: 'FILL' 1` is set on the element or parent, use the filled icon variant.

### Unmapped Icons

If a Material Symbol has no direct mapping:
1. Search Ionicons first: https://ionic.io/ionicons
2. Search MaterialCommunityIcons: https://materialdesignicons.com/
3. If still no match → use `<Text>` with emoji or add `// TODO: find icon replacement for {icon_name}`

---

## Web-Only Effects — Resolution Table

| Web Effect | CSS/Class | RN Resolution | Action |
|---|---|---|---|
| Hover states | `hover:*` | No hover on mobile | **REMOVE** |
| Active scale | `active:scale-[0.98]` | Use `activeOpacity={0.7}` on TouchableOpacity | **REMOVE** class, add prop |
| Transitions | `transition-*` | No CSS transitions in RN | **REMOVE**, add `// TODO: animation` if visually important |
| Backdrop blur | `backdrop-blur-*` | Not supported in NativeWind | **REMOVE**, use solid color + opacity |
| Decorative blur | `blur-[Xpx]` on fixed divs | Not supported | **SIMPLIFY** to `<View>` with color + opacity, or remove |
| Min height screen | `min-h-screen` | RN screens are full height | **REPLACE** with `flex-1` |
| Max width | `max-w-md`, `max-w-[Xpx]` | Mobile is always full width | **REMOVE** |
| Text selection | `selection:*` | Not applicable in RN | **REMOVE** |
| Underline offset | `underline-offset-*` | Not supported in NativeWind | **REMOVE** |
| Container queries | `@container`, `@[...]` | Not supported | **REMOVE**, use standard responsive |
| Focus ring | `focus:ring-*` | Not visual on mobile | **REMOVE** |
| CSS grid | `grid`, `grid-cols-*` | Use Flexbox instead | **REPLACE** with `flex-row flex-wrap` |
| Position fixed | `fixed` | Use `absolute` in RN | **REPLACE** with `absolute` or remove if decorative |
| Negative z-index | `-z-10` | Limited z-index support | **REMOVE** if decorative background |
| Shadow with color | `shadow-primary/20` | Android ignores shadow color | **SIMPLIFY** to `shadow-lg` |

### Resolution Priorities

1. **REMOVE** if purely decorative or cosmetic (blur backgrounds, hover effects)
2. **REPLACE** if there's a direct RN equivalent (grid → flexbox, fixed → absolute)
3. **SIMPLIFY** if partial support exists (colored shadows → plain shadows)
4. **TODO** if the effect is visually important but requires `react-native-reanimated` or `expo-blur`

---

## Font Name Mapping

Stitch uses camelCase font names in DESIGN.md but proper names in HTML:

| DESIGN.md Name | Google Fonts Name | expo-google-fonts Package |
|---|---|---|
| `plusJakartaSans` | `Plus Jakarta Sans` | `@expo-google-fonts/plus-jakarta-sans` |
| `inter` | `Inter` | `@expo-google-fonts/inter` |
| `roboto` | `Roboto` | `@expo-google-fonts/roboto` |
| `poppins` | `Poppins` | `@expo-google-fonts/poppins` |
| `montserrat` | `Montserrat` | `@expo-google-fonts/montserrat` |
| `openSans` | `Open Sans` | `@expo-google-fonts/open-sans` |
| `lato` | `Lato` | `@expo-google-fonts/lato` |
| `nunito` | `Nunito` | `@expo-google-fonts/nunito` |
| `raleway` | `Raleway` | `@expo-google-fonts/raleway` |
| `workSans` | `Work Sans` | `@expo-google-fonts/work-sans` |

For fonts not in this table:
1. Convert camelCase to kebab-case for the package name
2. Verify the package exists: `pnpm info @expo-google-fonts/{kebab-name}`

---

## Stitch Image URLs

Stitch generates AI images hosted at:
```
https://lh3.googleusercontent.com/aida-public/AB6AXu...
```

These are **temporary URLs** that may expire. Always:
1. Keep the URL as a placeholder in source code
2. Mark with `// TODO: replace with actual asset`
3. Add to `TODO-assets.md` at project root with description from `data-alt` attribute

The `data-alt` attribute on `<img>` tags contains the AI prompt used to generate the image — use this as the description in TODO-assets.md.
