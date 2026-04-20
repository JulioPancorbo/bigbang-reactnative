# Phase 0 — Setup & Discovery

This reference defines the progress tracker template and discovery procedures.

---

## Progress Tracker Template

Create `/memories/session/stitch-progress.md` with this exact structure:

```markdown
# Stitch-to-RN Progress — {PROJECT_NAME}

- Input mode: {MCP|Manual}
- Export path: {path} (Manual only)
- Project ID: {id} (MCP only)
- Package manager: {pnpm|npm}
- Design system: {design_system_folder_name}
- Fonts detected: {font_name(s)}

## Design System
- [ ] DESIGN.md parsed
- [ ] Tailwind config inline extracted
- [ ] Tokens applied to tailwind.config.js
- [ ] Fonts installed

## Phases
- [ ] Phase 1: Analysis (inventory + icon mapping + navigation flow)
- [ ] Phase 2: Design System (tailwind.config.js + fonts)
- [ ] Phase 3: Shared Components
- [ ] Phase 5: Navigation (types + stacks + tabs)
- [ ] Phase 6: Verification (tsc + anti-patterns)

## Screens
{For each screen detected:}
- [ ] {ScreenName} ← {folder_name}
```

---

## Manual Mode — Folder Scanning Algorithm

```
1. Receive EXPORT_PATH from user
2. List all immediate subdirectories of EXPORT_PATH
3. For each subdirectory:
   a. If contains DESIGN.md → mark as DESIGN_SYSTEM_FOLDER
   b. If contains code.html → mark as SCREEN_FOLDER
      - Check for *.png files → mark as HAS_SCREENSHOT
4. If no DESIGN.md found → warn user: "No se encontró DESIGN.md en la exportación"
5. If no code.html found → error: "No se encontraron pantallas (code.html) en la exportación"
```

### Screen Name Derivation

Convert folder name to PascalCase screen name:

```
Input: "wishify_welcome_screen"
Steps:
  1. Split by underscore: ["wishify", "welcome", "screen"]
  2. Remove common suffixes: "screen", "updated", "final", "v2", "new"
  3. Remove common prefixes (first token if it appears in ALL folder names = app name)
  4. PascalCase remaining: "Welcome"

Input: "wishify_login_screen_updated"
  → ["wishify", "login", "screen", "updated"]
  → Remove "screen", "updated" → ["wishify", "login"]
  → Remove common prefix "wishify" → ["login"]
  → PascalCase: "Login"

Input: "home_tab"
  → ["home", "tab"]
  → Remove "tab" → ["home"]
  → PascalCase: "Home"
```

If the derived name conflicts with an existing screen or is ambiguous, ask the user.

---

## MCP Mode — API Calls

```
1. mcp_stitch_list_projects()
   → Present list to user, ask which project to convert
   → Store PROJECT_ID

2. mcp_stitch_list_screens(PROJECT_ID)
   → Store list of {screenId, screenName} pairs
   → Derive RN screen names using same algorithm as Manual

3. mcp_stitch_list_design_systems(PROJECT_ID)
   → Store design system tokens
```

---

## Verification Checklist

- [ ] Input mode selected (MCP or Manual)
- [ ] Screens discovered and listed with derived names
- [ ] Design system source identified (DESIGN.md path or MCP tokens)
- [ ] Progress tracker created at `/memories/session/stitch-progress.md`
- [ ] No duplicate screen names
