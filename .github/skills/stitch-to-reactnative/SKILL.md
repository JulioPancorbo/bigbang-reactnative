---
name: stitch-to-reactnative
description: Convert Google Stitch designs (HTML/CSS/Material Design 3) into React Native + NativeWind screens. Use when asked to "convert stitch design", "maquetar app", "import stitch screens", "convert HTML to React Native", "stitch to RN", "maquetar pantallas", "importar diseño", "convert design to code", "layout from stitch", "transform stitch export", "diseño a código", or "pantallas desde stitch". Supports both MCP and manual import (folders with code.html + DESIGN.md). Processes screens one-by-one via subagents to keep context clean.
author: Julio Alberto Pancorbo Montoro (@juliocodex) — https://github.com/JulioPancorbo
---

# Stitch to React Native — Design-to-Code Conversion Skill

This skill converts Google Stitch design exports (HTML + Tailwind CSS + Material Design 3) into production-ready React Native + NativeWind screens, following all conventions from the bigbang-reactnative template.

The main agent acts as **orchestrator only** — each phase is delegated to an **isolated subagent**.

---

## Architecture — Orchestrator + Subagents

**CRITICAL: The main agent MUST NOT execute phases directly.** The main agent's ONLY job is:
1. Ask user for input mode (MCP or Manual)
2. Discover screens and design system
3. Create the progress tracker
4. Dispatch one subagent per phase, sequentially (except Phase 4: one subagent PER screen)
5. Read each subagent's result (PASS/FAIL)
6. Update progress tracker after each phase
7. Present inventory checkpoint (Phase 1) for user validation before continuing
8. Report final result to user

```
Main Agent (Orchestrator) — reads 0 HTML files, creates 0 project files
│
├─ Step 0: Ask input mode (MCP vs Manual), discover screens, create progress tracker
│
├─ Subagent → Phase 1: Analysis
│    Reads: phase-1-analysis.md → stitch-specifics.md
│    Analyzes: all screens HTML + DESIGN.md + screenshots
│    Produces: inventory (screens, components, icons, navigation flow, web-only effects)
│    Checkpoint: present inventory to user for approval
│
├─ Subagent → Phase 2: Design System
│    Reads: phase-2-design-system.md → stitch-specifics.md
│    Modifies: tailwind.config.js, App.tsx (fonts)
│    Installs: expo-google-fonts if needed
│    Reports: PASS or FAIL + reason
│
├─ Subagent → Phase 3: Shared Components
│    Reads: phase-3-shared-components.md → html-to-rn-mapping.md
│    Creates: src/components/ files based on inventory
│    Reports: PASS or FAIL + reason
│
├─ Subagent(s) → Phase 4: Screen Conversion (ONE subagent PER screen)
│    Reads: phase-4-screen-conversion.md → html-to-rn-mapping.md
│    Input: single screen HTML + screenshot + shared components list
│    Creates: src/screens/{Name}/index.tsx + hooks/types/services stubs if needed
│    Reports: PASS or FAIL + reason
│
├─ Subagent → Phase 5: Navigation
│    Reads: phase-5-navigation.md
│    Modifies: navigation-types.ts, stacks/, tabs
│    Reports: PASS or FAIL + reason
│
└─ Subagent → Phase 6: Verification
     Reads: phase-6-verification.md
     Runs: tsc --noEmit, anti-pattern scan, structure check
     Reports: Full checklist + results
```

### Why one subagent per screen in Phase 4?

- Stitch HTML files are large (100-200 lines each) with inline Tailwind config (~60 lines).
- Processing 10+ screens sequentially in one agent **fills the context window by screen 3-4**.
- Each screen subagent starts with a **clean context**: reads mapping docs + ONE screen HTML → converts → reports back.
- The progress tracker (`/memories/session/stitch-progress.md`) is the **single shared state** between phases.

### Execution Discipline — Mandatory

- Follow the skill and the referenced docs **exactly as written**.
- Execute steps **one by one, in order**. Do not skip, merge, reorder, or compress steps.
- Verify each step against its checklist before moving to the next one.
- Do **not** assume, infer, or invent missing files, conventions, dependencies, or implementation details.
- If a required instruction is missing or ambiguous, **fail clearly** and surface the exact gap instead of improvising.
- A phase is not complete until its verification checklist passes.

---

## Prerequisites

- **This skill lives inside the React Native template repo** at `.github/skills/stitch-to-reactnative/`.
- A bigbang-reactnative project must already exist (created by the `bigbang-reactnative` skill or manually).
- The project must have `docs/` folder with all convention docs.
- Node.js LTS (v20+), pnpm preferred.

---

## Step 0 — Input Mode Selection & Discovery (Main Agent executes directly)

### 0.1 Check for interrupted execution

```
Check if /memories/session/stitch-progress.md exists
IF exists:
  → Read it to find mode, screens list, first uncompleted phase
  → Ask user: "Se encontró un progreso previo de maquetación. ¿Retomar desde Fase {N}?"
  → If yes → skip to that phase
  → If no → delete the file and start fresh
```

### 0.2 Ask input mode

Use `vscode_askQuestions` with these options:

```
Question: "¿Cómo recibirás los diseños de Google Stitch?"
Options:
  A) "MCP — Conexión directa a Google Stitch (automático)"
  B) "Manual — Carpeta con archivos exportados (code.html + DESIGN.md)"
```

### 0.3 Discover screens

**If MCP:**
```
1. Call mcp_stitch_list_projects → present list to user for selection
2. Store PROJECT_ID
3. Call mcp_stitch_list_screens(PROJECT_ID) → store SCREENS list
4. Call mcp_stitch_list_design_systems(PROJECT_ID) → store DESIGN_SYSTEM
```

**If Manual:**
```
1. Ask user for the export folder path (or detect if attached to chat)
2. Scan the folder:
   a. Find DESIGN.md in any subfolder → that subfolder = design system folder
   b. Every other subfolder containing code.html = a screen
   c. If subfolder also contains .png → note as screenshot available
3. Derive screen names from folder names:
   → "wishify_welcome_screen" → "Welcome"
   → "wishify_login_screen_updated" → "Login"
   → Strip common prefixes, remove "screen"/"updated" suffixes, PascalCase result
4. Store SCREENS list with paths
```

### 0.4 Create progress tracker

Read the phase-0-setup.md reference for the exact template:

```
Create /memories/session/stitch-progress.md
```

See [references/phase-0-setup.md](./references/phase-0-setup.md) for the full progress tracker template.

---

## Step 1 — Dispatch Phase Subagents (Main Agent orchestrates)

For each phase, the main agent dispatches a subagent using `runSubagent`. **Do NOT read HTML files or create project files yourself — the subagent does it.**

### Subagent Prompt Template

Use this template for each phase, replacing variables:

```
You are executing Phase {N} ({PHASE_NAME}) of the stitch-to-reactnative design conversion.

CONTEXT:
- Input mode: {MODE} (MCP or Manual)
- Export folder: {EXPORT_PATH} (if Manual)
- Project ID: {PROJECT_ID} (if MCP)
- Workspace root: {WORKSPACE_ROOT}
- Package manager: {PKG_MANAGER}
- Screens: {SCREENS_LIST}
- Design system: {DESIGN_SYSTEM_INFO}

YOUR TASK:
1. Read the reference file at: {WORKSPACE_ROOT}/.github/skills/stitch-to-reactnative/references/phase-{N}-{name}.md
2. The reference file lists which additional references and docs/ files to read. Read ALL of them.
3. Execute EVERY step in the reference file in the exact order written.
4. After EACH step, confirm that the expected output exists and is complete.
5. Run the verification checklist at the end of the reference file.
6. If any check fails, fix it immediately and re-verify.
7. If any instruction is missing or ambiguous, do NOT guess. Stop and report the exact gap.

CONVENTIONS (non-negotiable):
- NEVER use `any` type
- NEVER use `StyleSheet.create()` — only className with Nativewind
- NEVER use `console.log` — use logger
- NEVER call Axios from screens — screens call hooks, hooks call services
- ALWAYS use `@/` import alias — NEVER relative paths `../`
- ALL functions must have explicit return types
- Max 300 lines per screen, 150 per component
- SafeAreaView as root wrapper on every screen
- KeyboardAvoidingView if screen has TextInput
- NEVER leave web-only CSS residuals: hover:*, active:scale-*, transition-*, backdrop-blur-*, min-h-screen, max-w-md, selection:*

REPORT BACK with exactly one of:
- "PHASE {N} COMPLETE — {summary of what was created/modified}"
- "PHASE {N} FAILED — {specific failure reason}"
Include a list of files created/modified.
```

### Phase dispatch order

| Phase | Reference File | Subagent Description | Dependencies |
|-------|---------------|---------------------|--------------|
| 1 | `references/phase-1-analysis.md` | "Execute Phase 1 Analysis" | None |
| 2 | `references/phase-2-design-system.md` | "Execute Phase 2 Design System" | Phase 1 approved |
| 3 | `references/phase-3-shared-components.md` | "Execute Phase 3 Shared Components" | Phase 1 approved |
| 4 | `references/phase-4-screen-conversion.md` | "Execute Phase 4 Screen: {ScreenName}" | Phases 2+3 |
| 5 | `references/phase-5-navigation.md` | "Execute Phase 5 Navigation" | Phase 4 |
| 6 | `references/phase-6-verification.md` | "Execute Phase 6 Verification" | Phase 5 |

### Special handling for Phase 1 — User Checkpoint

After Phase 1 completes, the main agent MUST:
1. Read the inventory from `/memories/session/stitch-inventory.md`
2. Present it to the user in a readable format
3. Ask: "¿Apruebas este inventario? Puedes ajustar nombres, eliminar pantallas, o reorganizar."
4. Wait for user approval before dispatching Phase 2

### Special handling for Phase 4 — One Subagent Per Screen

Phase 4 is NOT a single subagent. For EACH screen in the approved inventory:

```
For each screen in SCREENS_LIST:
  1. Prepare screen-specific context:
     - HTML source (MCP: call mcp_stitch_get_screen; Manual: read code.html path)
     - Screenshot path (if available)
     - List of shared components created in Phase 3
     - Icon mapping table from Phase 1 inventory
  2. Dispatch subagent with phase-4-screen-conversion.md reference
     + screen-specific HTML content
     + the screen name and target path
  3. Read result (PASS/FAIL)
  4. Update progress tracker
  5. If >8 screens total: checkpoint with user every 4 screens
```

### After each subagent returns

```
IF result contains "COMPLETE":
  → Update /memories/session/stitch-progress.md: mark phase/screen [x]
  → Proceed to next phase/screen

IF result contains "FAILED":
  → Read the failure reason
  → Re-dispatch the SAME phase with additional context:
    "Previous attempt failed because: {failure_reason}.
     Check which files already exist. Create only missing ones. Fix and retry."
  → If second attempt also fails → STOP and report to user:
    "La fase {N} falló después de 2 intentos. Error: {reason}."
```

---

## Step 2 — Recovery from Interrupted Execution

If the skill is invoked but a previous run was interrupted:

1. Check if `/memories/session/stitch-progress.md` exists
2. If it exists → read it to find mode, export path, and first uncompleted item
3. Ask user: "Se encontró un progreso previo. ¿Retomar desde {next_incomplete}?"
4. If yes → skip completed phases, dispatch subagent for the next incomplete one with:
   ```
   "This is a RESUME from an interrupted run.
    Check which files already exist. Create only missing ones.
    Run the full verification checklist. Report PASS or FAIL."
   ```
5. Continue the dispatch loop from there

---

## Conventions — Non-Negotiable Rules

These rules are embedded in every subagent prompt. They also serve as quick reference.

### TypeScript
- **NEVER** use `any` — use `unknown` + type narrowing
- **ALL** functions must have explicit return types
- Use `type` (not `interface`) for type definitions

### Styles
- **NEVER** use `StyleSheet.create()` — only `className` with Nativewind
- **NEVER** create `.styles.ts` files
- **NEVER** use fixed pixel widths for containers
- All layouts must be responsive (Flexbox, fractions, breakpoints)

### Web-to-Mobile Cleanup (Stitch-specific)
- **ALWAYS** remove `hover:*` classes (no hover on mobile)
- **ALWAYS** remove `active:scale-[*]` classes (use `activeOpacity` prop instead)
- **ALWAYS** remove `transition-*` classes (document as TODO if animation needed)
- **ALWAYS** remove `backdrop-blur-*` classes (replace with solid color + opacity)
- **ALWAYS** replace `min-h-screen` with `flex-1`
- **ALWAYS** remove `max-w-md`, `max-w-[*px]` (mobile is always full width)
- **ALWAYS** remove `selection:*` classes
- **ALWAYS** simplify `blur-[Xpx]` decorative backgrounds to `<View>` with opacity
- **ALWAYS** replace `<span class="material-symbols-outlined">` with `@expo/vector-icons`

### Architecture (3 Layers)
- **Screen** → only renders, consumes hooks. NEVER calls Axios directly
- **Hook** → manages state, calls services. Bridge between Screen and Service
- **Service** → pure TypeScript, HTTP calls with Axios. No React dependencies

### Imports
- **ALWAYS** use `@/` path alias — NEVER relative paths `../`
- Order: React → third-party libs → `@/` local imports

### Components
- Max 300 lines per screen, 150 per component
- One component = one folder with `index.ts` re-export
- SafeAreaView as root wrapper on ALL screens
- KeyboardAvoidingView on ALL screens with TextInput

### Loading & Errors
- **boneyard** skeletons for loading states — NEVER ActivityIndicator as main loading
- API errors in hooks (onError) — NEVER in screens
- `useToast` for user-facing messages — NEVER `Alert.alert()` directly

---

## Step 3 — Post-Completion (Main Agent)

After all phases report COMPLETE:

1. Confirm `/memories/session/stitch-progress.md` has all items marked `[x]`
2. Report final status to the user:
   - Screens created (Stitch name → RN name mapping)
   - Shared components created
   - Design system tokens applied
   - Fonts installed
   - Navigation changes
   - TODOs generated (placeholder images, animations, social login)
   - TypeScript errors (if any from Phase 6)
   - Anti-patterns detected (if any from Phase 6)
3. Suggest next steps:
   ```
   Maquetación completada. Próximos pasos:
   1. Ejecuta `pnpm start` y verifica el layout en Expo Go/simulador.
   2. Revisa TODO-assets.md para reemplazar imágenes placeholder con assets reales.
   3. Busca comentarios "// TODO:" en las screens para:
      - Animaciones pendientes (react-native-reanimated)
      - Social login (expo-auth-session)
      - Background blur decorativos
   4. Implementa la lógica de negocio: conecta los hooks stub con endpoints reales.
   5. Si tienes docs/workspace/, úsalos para completar modelos, endpoints y lógica.
   ```

---

## Author

Created by **Julio Alberto Pancorbo Montoro** ([@juliocodex](https://github.com/JulioPancorbo)).
