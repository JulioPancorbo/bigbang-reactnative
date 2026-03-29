#!/usr/bin/env node
/**
 * BigBang React Native — Structure Verification
 * Cross-platform script (Windows, macOS, Linux) — requires Node.js only.
 *
 * Usage:  node verify-structure.js [projectPath]
 * Default projectPath: current working directory
 *
 * Exit 0 = all checks passed
 * Exit 1 = one or more checks failed
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const projectPath = process.argv[2] || process.cwd()
const srcPath     = path.join(projectPath, 'src')
let   failures    = 0

// ── ANSI colours ────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  green:  '\x1b[32m',
  red:    '\x1b[31m',
}

function pass(msg)    { console.log(`  ${c.green}[PASS]${c.reset} ${msg}`) }
function fail(msg)    { console.log(`  ${c.red}[FAIL]${c.reset} ${msg}`); failures++ }
function section(msg) { console.log(`\n${c.cyan}=== ${msg} ===${c.reset}`) }

console.log(`\n${c.yellow}BigBang React Native — Structure Verification${c.reset}`)
console.log(`${c.yellow}Project: ${projectPath}${c.reset}`)
console.log(`${c.yellow}${'='.repeat(50)}${c.reset}`)

// ============================================================
// 1. REQUIRED FOLDERS
// ============================================================
section('Required Folders')

const requiredFolders = [
  'src',
  'src/screens',
  'src/components',
  'src/navigation',
  'src/navigation/stacks',
  'src/services',
  'src/hooks',
  'src/store',
  'src/types',
  'src/utils',
  'src/assets',
  'src/assets/images',
  'src/assets/icons',
  'src/assets/fonts',
]

for (const folder of requiredFolders) {
  const fullPath = path.join(projectPath, ...folder.split('/'))
  try {
    if (fs.statSync(fullPath).isDirectory()) pass(folder)
    else fail(`${folder} — not a directory`)
  } catch {
    fail(`${folder} — directory missing`)
  }
}

// ============================================================
// 2. REQUIRED FILES
// ============================================================
section('Required Files')

const requiredFiles = [
  // Root configs
  'tsconfig.json',
  'babel.config.js',
  'tailwind.config.js',
  'global.d.ts',
  '.env.example',
  'package.json',
  // Services
  'src/services/api.ts',
  'src/services/auth.ts',
  'src/services/storage.ts',
  'src/services/logger.ts',
  // Types
  'src/types/models.ts',
  'src/types/api.ts',
  'src/types/index.ts',
  // Utils
  'src/utils/constants.ts',
  'src/utils/validators.ts',
  'src/utils/formatters.ts',
  // Store
  'src/store/authStore.ts',
  // Hooks
  'src/hooks/useAuth.ts',
  'src/hooks/useFormState.ts',
  'src/hooks/useFetch.ts',
  'src/hooks/useToast.ts',
  // Navigation
  'src/navigation/navigation-types.ts',
  'src/navigation/hooks.ts',
  'src/navigation/RootNavigator.tsx',
  'src/navigation/index.ts',
  'src/navigation/stacks/AuthStack.tsx',
  'src/navigation/stacks/AppStack.tsx',
  'src/navigation/stacks/AppTabs.tsx',
  // Components
  'src/components/Button/Button.tsx',
  'src/components/Button/index.ts',
  'src/components/ErrorBoundary/ErrorBoundary.tsx',
  'src/components/ErrorBoundary/index.ts',
  // Screens
  'src/screens/Welcome/index.tsx',
  'src/screens/Login/index.tsx',
  'src/screens/Register/index.tsx',
  'src/screens/Home/index.tsx',
  'src/screens/Profile/index.tsx',
  // App entry
  'src/App.tsx',
]

for (const file of requiredFiles) {
  const fullPath = path.join(projectPath, ...file.split('/'))
  try {
    if (fs.statSync(fullPath).isFile()) pass(file)
    else fail(`${file} — not a file`)
  } catch {
    fail(`${file} — file missing`)
  }
}

// ============================================================
// 3. ANTI-PATTERN SCAN
// ============================================================
section('Anti-Pattern Scan')

/** Recursively collect all .ts / .tsx files under dir */
function getAllTsFiles(dir) {
  const results = []
  if (!fs.existsSync(dir)) return results
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())                             results.push(...getAllTsFiles(full))
    else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) results.push(full)
  }
  return results
}

/**
 * Scan files for a regex pattern.
 * Returns first-match-per-file list: [{ filePath, line }]
 * excludeFn(filePath) → true means skip that file.
 */
function scanPattern(files, pattern, excludeFn) {
  const regex   = new RegExp(pattern)
  const matches = []
  for (const filePath of files) {
    if (excludeFn && excludeFn(filePath)) continue
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        matches.push({ filePath, line: i + 1 })
        break // one match per file (equivalent to Select-String -List)
      }
    }
  }
  return matches
}

if (!fs.existsSync(srcPath)) {
  fail('src/ directory not found — cannot scan for anti-patterns')
} else {
  const tsFiles = getAllTsFiles(srcPath)

  // 3.1 console.log (excluding logger.ts)
  const consoleLog = scanPattern(tsFiles, 'console\\.log\\(', f => path.basename(f) === 'logger.ts')
  if (consoleLog.length === 0) pass('No console.log found (excluding logger.ts)')
  else {
    fail(`console.log found in ${consoleLog.length} file(s):`)
    consoleLog.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.2 StyleSheet.create
  const stylesheet = scanPattern(tsFiles, 'StyleSheet\\.create')
  if (stylesheet.length === 0) pass('No StyleSheet.create found')
  else {
    fail(`StyleSheet.create found in ${stylesheet.length} file(s):`)
    stylesheet.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.3 : any (but not : any[])
  const anyType = scanPattern(tsFiles, ':\\s*any\\b(?!\\[\\])')
  if (anyType.length === 0) pass("No ': any' type found")
  else {
    fail(`': any' type found in ${anyType.length} file(s):`)
    anyType.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.4 Deep relative imports (../../)
  const deepImports = scanPattern(tsFiles, "from\\s+['\"]\\.\\.[\\/]\\.\\.[\\/]")
  if (deepImports.length === 0) pass('No deep relative imports (../../) found')
  else {
    fail(`Deep relative imports found in ${deepImports.length} file(s):`)
    deepImports.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.5 Alert.alert
  const alertAlert = scanPattern(tsFiles, 'Alert\\.alert\\(')
  if (alertAlert.length === 0) pass('No Alert.alert found')
  else {
    fail(`Alert.alert found in ${alertAlert.length} file(s):`)
    alertAlert.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.6 AsyncStorage
  const asyncStorage = scanPattern(tsFiles, 'AsyncStorage')
  if (asyncStorage.length === 0) pass('No AsyncStorage found (using expo-secure-store)')
  else {
    fail(`AsyncStorage found in ${asyncStorage.length} file(s) — should use expo-secure-store:`)
    asyncStorage.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }

  // 3.7 fetch() outside services/
  const servicesSep = `${path.sep}services${path.sep}`
  const directFetch = scanPattern(
    tsFiles,
    '\\bfetch\\s*\\(',
    f => f.includes(servicesSep) || f.includes('/services/')
  )
  if (directFetch.length === 0) pass('No direct fetch() calls outside services')
  else {
    fail(`Direct fetch() found in ${directFetch.length} file(s) — should use Axios via services/api.ts:`)
    directFetch.forEach(m => console.log(`    ${c.red}→ ${m.filePath}:${m.line}${c.reset}`))
  }
}

// ============================================================
// 4. INDEX FILE CHECK
// ============================================================
section('Index File Re-exports')

const foldersNeedingIndex = [
  'src/types',
  'src/navigation',
  'src/components/Button',
  'src/components/ErrorBoundary',
]

for (const folder of foldersNeedingIndex) {
  const base    = path.join(projectPath, ...folder.split('/'))
  const indexTs  = path.join(base, 'index.ts')
  const indexTsx = path.join(base, 'index.tsx')
  if (fs.existsSync(indexTs) || fs.existsSync(indexTsx)) pass(`${folder} has index file`)
  else fail(`${folder} — missing index.ts`)
}

// ============================================================
// 5. CONFIG CONTENT CHECKS
// ============================================================
section('Configuration Content')

// tsconfig.json — @/* alias
const tsconfigPath = path.join(projectPath, 'tsconfig.json')
if (fs.existsSync(tsconfigPath)) {
  const content = fs.readFileSync(tsconfigPath, 'utf8')
  if (/"@\/\*"/.test(content)) pass('tsconfig.json has @/* path alias')
  else fail('tsconfig.json missing @/* path alias')
}

// babel.config.js — module-resolver + nativewind
const babelPath = path.join(projectPath, 'babel.config.js')
if (fs.existsSync(babelPath)) {
  const content = fs.readFileSync(babelPath, 'utf8')
  if (/module-resolver/.test(content)) pass('babel.config.js has module-resolver')
  else fail('babel.config.js missing module-resolver')
  if (/nativewind/.test(content)) pass('babel.config.js has nativewind plugin')
  else fail('babel.config.js missing nativewind plugin')
}

// tailwind.config.js — primary colour
const twPath = path.join(projectPath, 'tailwind.config.js')
if (fs.existsSync(twPath)) {
  const content = fs.readFileSync(twPath, 'utf8')
  if (/primary/.test(content)) pass('tailwind.config.js has primary color')
  else fail('tailwind.config.js missing primary color')
}

// ============================================================
// SUMMARY
// ============================================================
console.log(`\n${c.yellow}${'='.repeat(50)}${c.reset}`)

if (failures === 0) {
  console.log(`\n  ${c.green}ALL CHECKS PASSED${c.reset}`)
  console.log(`  ${c.green}Project structure is valid.\n${c.reset}`)
  process.exit(0)
} else {
  console.log(`\n  ${c.red}${failures} CHECK(S) FAILED${c.reset}`)
  console.log(`  ${c.red}Review the failures above and fix them.\n${c.reset}`)
  process.exit(1)
}
