---
title: Instrucciones para el agente IA
version: 2.3
---

# Instrucciones para el agente IA

Este archivo define el flujo operativo exacto que debe seguir un agente IA para crear un proyecto desde cero o incorporar cambios a un proyecto existente usando esta guía.

---

## Regla -1 — Ejecución estricta

Estas reglas aplican **siempre** y tienen prioridad operativa durante toda la ejecución:

1. Seguir la skill y los docs **exactamente como están escritos**.
2. Ejecutar los pasos **uno a uno y en orden**. No fusionar, comprimir, reordenar ni saltarse pasos.
3. Completar y comprobar la verificación de cada paso antes de pasar al siguiente.
4. No asumir ni inventar archivos, convenciones, dependencias, nombres o comportamiento no descritos.
5. Si falta una instrucción, hay ambigüedad o hay contradicción entre documentos, detenerse y consultarlo con el usuario en lugar de improvisar.
6. Al terminar, no basta con un resumen: hay que comunicar también los siguientes pasos operativos.

---

## Regla 0 — Gestor de paquetes

**Antes de cualquier instalación:**

1. Comprueba si `pnpm` está disponible: `pnpm --version`
2. Si está disponible → usa `pnpm` para todo (instalar, ejecutar scripts, etc.)
3. Si **no** está disponible → pregunta al usuario: *"pnpm no está instalado. ¿Quieres instalarlo con `npm install -g pnpm`? Si no, usaré npm."*
4. Si el usuario rechaza → usa `npm` como fallback en todos los comandos

### Regla 0.1 — Expo estable antes del primer arranque

**Nunca** uses `expo@latest` ni plantillas `@latest` de forma acrítica si el objetivo es abrir la app en Expo Go.

1. Crea el proyecto base sin asumir que `latest` es una línea estable.
2. Alinea explícitamente `expo`, `react` y `react-native` a una línea estable del SDK.
3. Si el proyecto se va a abrir en Expo Go, usa una línea compatible con el cliente instalado.
4. Ejecuta `npx expo-doctor@latest` antes del primer `pnpm start`.

### Regla 0.2 — `useEffect` es escape hatch, no la opción por defecto

1. Usa `useEffect` solo para sincronizar React con sistemas externos o APIs imperativas.
2. No lo uses para derivar estado desde props/state, encadenar cálculos, notificar a padres, reaccionar a clicks/submits ni envolver fetch genérico.
3. Para datos del servidor → React Query (`useQuery`/`useMutation`).
4. Para acciones del usuario → event handlers o funciones expuestas por el hook.
5. Para bootstrap único de la app (por ejemplo, hidratar sesión) → inicialización idempotente en entrypoint/store, no un effect de montaje.

---

## Flujo principal — Crear proyecto desde cero

### PASO 1 — Leer [project-setup.md](./project-setup.md)

**Acción:** Ejecutar los pasos de bootstrap en orden:
1. Crear app con `create-expo-app` usando `.` (punto) como destino — **NUNCA** `create-expo-app nombre-proyecto`, eso crea un subdirectorio. El proyecto siempre se genera en la raíz del workspace.
2. Actualizar `app.json` con el nombre real del proyecto (`name` y `slug`)
3. Renombrar `App.js` → `App.tsx`
4. Crear estructura de carpetas `src/`
5. Instalar dependencias (nativewind, axios, react-navigation)
6. Crear `tsconfig.json` con alias `@/`
7. Crear `babel.config.js` con `module-resolver`
8. Crear `.env.example`

**Verificación obligatoria:**
- [ ] Carpeta `src/` creada con subcarpetas: `screens/ components/ navigation/ services/ hooks/ store/ types/ utils/ theme/ assets/`
- [ ] `tsconfig.json` tiene `"@/*": ["src/*"]` en `paths`
- [ ] `babel.config.js` tiene `module-resolver` apuntando a `./src`
- [ ] `npx tsc --noEmit` no da errores
- [ ] `.env.example` creado

---

### PASO 2 — Leer [structure-guide.md](./structure-guide.md)

**Acción:** Interiorizar las reglas de arquitectura antes de crear ningún archivo.

**Verificación obligatoria:**
- [ ] ¿El proyecto sigue la arquitectura de 3 capas? (Screen → Hook → Service)
- [ ] ¿Cada carpeta tiene un `index.ts` que re-exporta?
- [ ] ¿Las carpetas siguen kebab-case y los componentes PascalCase?
- [ ] ¿No hay ningún `any` en el código?
- [ ] ¿Ningún componente supera las 300 líneas?

---

### PASO 3 — Leer [conventions.md](./conventions.md)

**Acción:** Aplicar convenciones de nombres, TypeScript e imports en todos los archivos creados.

**Verificación obligatoria:**
- [ ] ¿Los imports usan `@/` (no rutas relativas `../`)?
- [ ] ¿Los imports están ordenados: React → librerías → locales?
- [ ] ¿Las funciones tienen tipo de retorno explícito?
- [ ] ¿No se usa `StyleSheet.create()` en ningún archivo?

---

### PASO 4 — Leer [nativewind-theme.md](./nativewind-theme.md)

**Acción:** Configurar Nativewind y el tema visual del proyecto.
1. Configurar `tailwind.config.js` con colores y espaciado del proyecto
2. Añadir `presets: [require('nativewind/preset')]` en `tailwind.config.js`
3. Configurar `babel.config.js` con `['babel-preset-expo', { jsxImportSource: 'nativewind' }]` y `nativewind/babel` en `presets`
4. Crear `metro.config.js` con `withNativeWind(config, { input: './global.css' })`
5. Crear `global.css` e importarlo desde `src/App.tsx`
6. Añadir plugin `@nativewind/typescript` en `tsconfig.json`

**Verificación obligatoria:**
- [ ] ¿`tailwind.config.js` define colores `primary`, `secondary`, `error`?
- [ ] ¿`tailwind.config.js` usa `nativewind/preset`?
- [ ] ¿`babel.config.js` usa `jsxImportSource: 'nativewind'` y `nativewind/babel` en `presets`?
- [ ] ¿Existe `metro.config.js` con `withNativeWind` apuntando a `global.css`?
- [ ] ¿`src/App.tsx` importa `../global.css`?
- [ ] ¿No hay `StyleSheet.create()` en ningún componente?
- [ ] ¿Un componente de prueba muestra estilos correctamente?

---

### PASO 5 — Leer [navigation-patterns.md](./navigation-patterns.md)

**Acción:** Crear el sistema de navegación tipado.
1. Crear `src/navigation/navigation-types.ts` con todos los `ParamList` (`RootStackParamList`, `AuthStackParamList`, `AppStackParamList`, `AppTabsParamList`)
2. Crear `src/navigation/hooks.ts` con `useRootNavigation()`, `useAuthNavigation()` y `useAppNavigation()`
3. Crear `src/navigation/RootNavigator.tsx` (con lógica condicional `useAuthStore`)
4. Crear `src/navigation/stacks/AuthStack.tsx` (Welcome, Login, Register)
5. Crear `src/navigation/stacks/AppTabs.tsx` (BottomTabNavigator: Home, Profile)
6. Crear `src/navigation/stacks/AppStack.tsx` (NativeStack que envuelve AppTabs + pantallas full-screen)
7. Crear `src/navigation/index.ts` (re-exporta todo)

**Verificación obligatoria:**
- [ ] ¿Existe `declare global { namespace ReactNavigation { ... } }` en `navigation-types.ts`?
- [ ] ¿Se usa `NavigatorScreenParams` para tipar la relación `AppStack → AppTabs`?
- [ ] ¿Las pantallas importan tipos desde `@/navigation` (path alias)?
- [ ] ¿No hay rutas duplicadas en múltiples archivos?
- [ ] ¿El `RootNavigator` apunta a `AppStack` (no a `AppTabs` directamente)?
- [ ] ¿`RootNavigator` usa `useAuthStore` para decidir entre `AuthStack` y `AppStack`?
- [ ] ¿`AppStack` tiene `MainTabs` como primera screen y registra pantallas full-screen?
- [ ] ¿`AppTabs` usa `@react-navigation/bottom-tabs` con iconos de `@expo/vector-icons`?

---

### PASO 6 — Crear pantallas base

**Acción:** Crear las pantallas mínimas que todo proyecto necesita. Usar las plantillas de [templates-snippets.md](./templates-snippets.md).

1. Crear `src/screens/Welcome/index.tsx` — Pantalla de bienvenida con título y botón "Continuar" → navega a Login
2. Crear `src/screens/Login/index.tsx` — Formulario email/password con `useForm` + `useAuth`, enlace a Register
3. Crear `src/screens/Register/index.tsx` — Formulario nombre/email/password/confirmar con `useForm` + `useAuth`, enlace a Login
4. Crear `src/screens/Home/index.tsx` — Pantalla principal usando la **plantilla completa** de [templates-snippets.md](./templates-snippets.md), incluyendo los datos mock y el layout base. No sustituirla por un placeholder simplificado.
5. Crear `src/screens/Profile/index.tsx` — Pantalla de perfil con datos placeholder y botón "Cerrar sesión" (`useAuth().logout`)

**Verificación obligatoria:**
- [ ] ¿Existen las 5 pantallas: Welcome, Login, Register, Home, Profile?
- [ ] ¿Welcome navega a Login al pulsar "Continuar"?
- [ ] ¿Login usa `useForm` + `useAuth` para autenticación?
- [ ] ¿Login tiene enlace a Register y Register tiene enlace a Login?
- [ ] ¿Register valida que las contraseñas coincidan?
- [ ] ¿Profile tiene botón de logout funcional con `useAuth().logout`?
- [ ] ¿Las pantallas usan `SafeAreaView` de `react-native-safe-area-context`?
- [ ] ¿Las pantallas con `TextInput` (Login, Register) usan `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>`  importando `Platform` de `react-native`?
- [ ] ¿Las pantallas de lista muestran skeleton de boneyard cuando `isLoading === true`? (no `ActivityIndicator`)
- [ ] ¿Ninguna pantalla llama a Axios directamente? (todo a través de hooks)

---

### PASO 7 — Leer [services-and-api.md](./services-and-api.md)

**Acción:** Crear la capa de servicios con Axios.
1. Crear `src/services/api.ts` con Axios client, interceptores y `parseApiError`
2. Crear `src/services/auth.ts` si hay autenticación
3. Crear `src/services/logger.ts` (reemplaza `console.log`)

**Verificación obligatoria:**
- [ ] ¿Axios está instalado como dependencia?
- [ ] ¿`api.ts` usa `process.env.EXPO_PUBLIC_API_URL` como base URL?
- [ ] ¿`parseApiError` maneja tanto errores Axios como errores genéricos?
- [ ] ¿No hay `console.log` directo en los servicios?
- [ ] ¿Las funciones de servicio son puras (sin imports de React)?

---

### PASO 8 — Leer [hooks-and-state.md](./hooks-and-state.md)

**Acción:** Crear el patrón de hooks y el store de estado global.
1. Crear hooks por entidad con React Query: `useProducts.ts`, `useAuth.ts`
2. Crear `src/store/authStore.ts` con Zustand para el estado de sesión
3. Envolver la app en `QueryClientProvider` en `App.tsx`

**Verificación obligatoria:**
- [ ] ¿Los hooks de datos del servidor usan `useQuery`/`useMutation` de React Query?
- [ ] ¿El estado de sesión (token, usuario) vive en `authStore` con Zustand?
- [ ] ¿Los hooks llaman a servicios (no a Axios directamente)?
- [ ] ¿Las screens obtienen datos del hook, no del servicio?
- [ ] ¿No se creó un hook genérico tipo `useFetch(fn, deps)` basado en `useEffect`/`mounted` como patrón base?
- [ ] ¿No se usa Redux Toolkit?

---

### PASO 9 — Leer [templates-snippets.md](./templates-snippets.md)

**Acción:** Usar las plantillas para crear los primeros archivos del proyecto.
- Las pantallas base ya se crearon en el PASO 6 usando las plantillas de este doc
- `src/types/models.ts` con los modelos del proyecto
- `src/types/index.ts` que re-exporta todo

**Verificación obligatoria:**
- [ ] ¿Cada nuevo archivo sigue el esqueleto de la plantilla correspondiente?
- [ ] ¿Los `index.ts` re-exportan correctamente?
- [ ] ¿`App.tsx` importa `global.css` y usa `SafeAreaProvider` + `QueryClientProvider` + `ErrorBoundary` + `NavigationContainer` + `RootNavigator` + `Toast`?

---

### PASO 10 — Leer [testing-ci.md](./testing-ci.md) (opcional para MVP)

**Acción:** Configurar tests si el proyecto los requiere.
1. Instalar dependencias de test
2. Crear `jest.config.js`
3. Crear estructura `tests/__mocks__/`

**Verificación obligatoria:**
- [ ] ¿`npm test` (o `pnpm test`) pasa sin errores?

---

## Reglas operativas

- **No crear ningún archivo antes de leer el doc correspondiente.**
- **No saltarse pasos ni verificaciones.** Cada checklist debe quedar validado antes de continuar.
- Ante la duda entre dos enfoques, elegir el más simple.
- Si algo no está en la guía, consulta con el usuario antes de inventar convenciones.
- Si identificas una mejora a la guía, anótala en [changelog.md](./changelog.md) (no modifiques los otros docs sin consenso).
- No usar `console.log`; usar `src/services/logger.ts`.
- No crear archivos `.styles.ts`.
- No usar `StyleSheet.create()`.
- Estado global: **Zustand** para sesión auth + **React Query** para datos del servidor. No usar Redux Toolkit.
- Iconos y animaciones: seguir la jerarquía de [animations-and-icons.md](./animations-and-icons.md) (iconos estáticos → `@expo/vector-icons`, animaciones JSON → `lottie-react-native`, animaciones de UI → `react-native-reanimated`).
- Plugins nativos: **antes de instalar cualquier plugin nativo** (cámara, mapas, PDF, background tasks, etc.), consultar [native-plugins.md](./native-plugins.md). Si la necesidad no está cubierta, proponer una opción al usuario antes de instalar.
- Manejo de errores: **todo proyecto** debe tener `ErrorBoundary` en `App.tsx` + `useToast` hook + `<Toast />` como último hijo. Errores de API van en hooks (`onError`), nunca en screens. No usar `Alert.alert()` directamente.
- `useEffect`: úsalo solo para sincronización externa real. No lo uses para derivar estado, encadenar cálculos, disparar lógica de eventos del usuario ni como patrón genérico de fetch. Para datos del servidor, React Query; para bootstrap único, inicialización idempotente en entrypoint/store.
- Diseño responsive: **todas las pantallas deben ser responsive**. Usar Flexbox, fracciones (`w-1/2`), breakpoints de Nativewind (`sm:`, `md:`, `lg:`), `useWindowDimensions()` para lógica dinámica. No anchos fijos en píxeles. Diseñar para posible conversión a web (Expo Web).
- Loading states: **toda pantalla de lista o tarjetas** debe usar skeleton de **boneyard** cuando `isLoading === true`. Nunca `ActivityIndicator` como estado principal de pantalla. Para submit de formulario: deshabilitar el botón con label "Cargando…".
- Keyboard management: **toda screen que contenga `TextInput`** debe envolver su contenido en `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>`. Importar `Platform` de `react-native`.

---

## Añadir una nueva screen — Flujo rápido

```
1. Crear carpeta src/screens/NombrePantalla/
2. Crear index.tsx (usar plantilla de ./templates-snippets.md)
3. Si tiene componentes propios → crear components/ dentro de la carpeta
4. Añadir ruta en navigation/navigation-types.ts:
   - ¿Es un tab? → AppTabsParamList
   - ¿Es pantalla full-screen sin tabs? → AppStackParamList
   - ¿Es pantalla de auth? → AuthStackParamList
5. Registrar la pantalla en el navegador correspondiente:
   - Tab → stacks/AppTabs.tsx
   - Full-screen autenticada → stacks/AppStack.tsx
   - Auth → stacks/AuthStack.tsx
6. Crear hook en src/hooks/useNombreFeature.ts si la pantalla tiene datos
7. Crear función en src/services/api.ts si el hook llama a la API
8. Si la pantalla usa iconos o animaciones → consultar [animations-and-icons.md](./.animations-and-icons.md)
9. Si la pantalla usa plugins nativos (cámara, mapas, PDF, etc.) → consultar [native-plugins.md](./.native-plugins.md)
```

---

## Checklist de validación final

Antes de dar por terminado el proyecto, ejecutar la validación completa de [structure-guide.md](./structure-guide.md) (sección "Checklist de Validación").
