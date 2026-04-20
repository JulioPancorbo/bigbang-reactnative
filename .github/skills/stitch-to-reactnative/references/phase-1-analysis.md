# Phase 1 — Analysis

This phase analyzes all Stitch screens to produce a complete design inventory before any code is generated.

## Docs to Read

- `references/stitch-specifics.md` — Stitch export format, Material Symbols mapping, web-only effects

## Input

- **MCP mode**: Screen list from `mcp_stitch_list_screens(projectId)`. For each screen, call `mcp_stitch_get_screen(screenName, projectId, screenId)` to get HTML.
- **Manual mode**: List of screen folders with `code.html` paths and optional `.png` paths.
- **DESIGN.md** content (from design system folder or MCP).

## Steps

### 1.1 Parse DESIGN.md

Extract high-level tokens:
```
- Color Mode: light|dark
- Primary Color: #hex
- Secondary Color: #hex
- Tertiary Color: #hex
- Neutral Color: #hex
- Headline Font: fontName
- Body Font: fontName
- Label Font: fontName
- Roundedness: Sharp(1)|Moderate(2)|Full(3)
- Spacing: Compact(1)|Normal(2)|Expanded(3)
```

### 1.2 Extract Tailwind Config from HTML

For EACH screen's `code.html`:
1. Find `<script id="tailwind-config">` block
2. Parse the JavaScript object inside `tailwind.config = {...}`
3. Extract:
   - `theme.extend.colors` — all color tokens (MD3 semantic + custom)
   - `theme.extend.fontFamily` — font families
   - `theme.extend.borderRadius` — radius tokens
4. Merge tokens across all screens (they should be identical; flag any discrepancies)

### 1.3 Extract Custom CSS Classes

For each screen's `code.html`:
1. Find all `<style>` blocks (excluding the `min-height` utility)
2. Extract custom class definitions: `.bg-terracotta`, `.text-warm-grey`, etc.
3. Map each to its CSS property value
4. These will become additional tokens in `tailwind.config.js`

### 1.4 Scan Icons

For each screen's `code.html`:
1. Find ALL occurrences of `<span class="material-symbols-outlined"...>icon_name</span>`
2. Check `font-variation-settings: 'FILL' 0|1` on the element or parent `<style>`
3. Record: `{icon_name, fill: 0|1, screen: screenName}`
4. Map each to `@expo/vector-icons` using the table in `stitch-specifics.md`
5. Flag any unmapped icons

### 1.5 Scan Web-Only Effects

For each screen's `code.html`, scan the `<body>` for:
- `hover:*` classes → list with element context
- `active:scale-*` classes → list
- `transition-*` classes → list
- `backdrop-blur-*` classes → list
- `blur-[*]` on decorative elements → list
- `min-h-screen` → list
- `max-w-*` container constraints → list
- `selection:*` → list
- `focus:ring-*` → list
- `cursor-*` → list
- Any `<div class="fixed ... blur ... -z-10">` decorative backgrounds → list

### 1.6 Identify Screen Purpose

For each screen, analyze the HTML structure to determine:
- **Screen type**: welcome, login, register, home, list, detail, profile, settings, search, onboarding, modal
- **Has form inputs**: yes/no (determines KeyboardAvoidingView need)
- **Has scroll content**: yes/no (determines ScrollView need)
- **Has list patterns**: yes/no + count of repeated elements (determines FlatList need)
- **Navigation links**: what other screens does it link to (from `<a>`, `<button>` text)
- **Needs server data**: yes/no (determines if hook + service stubs are needed)

### 1.7 Identify Reusable Components

Scan ALL screens for repeated UI patterns:
- **Buttons**: primary (filled bg), secondary (outlined), text-only, icon-only
- **Text inputs**: with/without icons, with/without labels
- **Cards**: content containers with rounded corners + shadow
- **List items**: horizontal layouts with image + text
- **Headers**: top section with title/subtitle/icon
- **Dividers**: horizontal lines, with/without text
- **Social login**: Google/Apple button pairs
- **Icon containers**: circular backgrounds with centered icon
- **Avatars**: circular images
- **Badges**: small colored labels

For each pattern:
- If it appears in 2+ screens → mark as shared component
- Assign a component name (PascalCase)
- Note which screens use it

### 1.8 Infer Navigation Structure

Based on screen purposes and links:
1. **Auth flow** (AuthStack): Welcome, Login, Register, ForgotPassword
2. **Main tabs** (AppTabs): screens with tab-bar icons, typically Home, Search/Explore, Profile
3. **Full-screen stacks** (AppStack): Detail screens, Settings, EditProfile
4. **Modals**: screens that overlay (typically confirmation dialogs, pickers)

Document the proposed navigation tree.

### 1.9 Check for Stitch Image URLs

Find all `<img>` tags with:
- `src="https://lh3.googleusercontent.com/aida-public/..."` → placeholder image
- Extract `data-alt` attribute for description
- Record: `{screen, src_url, description, element_context}`

---

## Output — Inventory File

Create `/memories/session/stitch-inventory.md` with this structure:

```markdown
# Stitch Design Inventory

## Design System Tokens
- Color mode: {light|dark}
- Primary: {hex} / Secondary: {hex} / Tertiary: {hex} / Neutral: {hex}
- Font: {font_name}
- Roundedness: {level} / Spacing: {level}
- Custom colors: {list of custom color name:value pairs}
- Tailwind config colors count: {N} (from inline config)

## Screens ({count} total)

| # | Stitch Folder | RN Screen Name | Type | Has Form | Has List | Needs Data |
|---|---|---|---|---|---|---|
| 1 | {folder} | {Name} | {type} | {yes/no} | {yes/no} | {yes/no} |

## Shared Components ({count} total)

| Component | Used In | Notes |
|---|---|---|
| {Name} | {Screen1, Screen2} | {brief description} |

## Icon Mapping ({count} total)

| Material Symbol | Fill | Expo Icon | Library | Used In |
|---|---|---|---|---|
| {name} | {0/1} | {mapped_name} | {Ionicons/MCI} | {screens} |

## Navigation Structure
- AuthStack: {screens}
- AppTabs: {screens + tab icons}
- AppStack (full-screen): {screens}

## Web-Only Effects to Remove
- hover: {count} occurrences across {N} screens
- transitions: {count}
- blur decoratives: {count}
- (etc.)

## Placeholder Images ({count} total)

| Screen | Description | URL |
|---|---|---|
| {screen} | {data-alt text} | {url} |

## Discrepancies / Warnings
- {any token conflicts between screens}
- {any unmapped icons}
- {any ambiguous screen names}
```

---

## Verification Checklist

- [ ] DESIGN.md parsed successfully
- [ ] Tailwind config extracted from at least one HTML file
- [ ] All screens analyzed and named (no duplicates)
- [ ] All icons mapped (or flagged as unmapped)
- [ ] Web-only effects catalogued
- [ ] Reusable components identified
- [ ] Navigation structure proposed
- [ ] Placeholder images catalogued
- [ ] Inventory file created at `/memories/session/stitch-inventory.md`
- [ ] Inventory ready for user review
