# Copilot Instructions — React Native + Expo + TypeScript + Nativewind

Este workspace es un **template base** para proyectos React Native.
Antes de cualquier acción, lee [docs/core/agent-instructions.md](docs/core/agent-instructions.md). Define el flujo completo con verificaciones obligatorias.

---

## Reglas no negociables

- **Estilos:** Nativewind v4 siempre. Nunca `StyleSheet.create()`. Nunca estilos inline en píxeles fijos.
- **Expo:** Nunca instalar `expo@latest` ni usar plantillas `@latest` sin fijar una línea estable de SDK compatible con Expo Go. Verifica con `expo-doctor` antes del primer arranque.
- **Bootstrap:** Si se crea el proyecto desde este template, se genera **siempre en la raíz del workspace** con `create-expo-app .`. Nunca crear un subdirectorio adicional. El nombre del proyecto se deriva de la carpeta raíz y se refleja en `app.json` (`name` y `slug`).
- **Arquitectura 3 capas:** `Screen → Hook → Service`. La screen nunca llama a Axios directamente.
- **Estado global:** Zustand para sesión auth. React Query (`useQuery`/`useMutation`) para datos del servidor. Sin Redux.
- **HTTP:** Axios desde `src/services/api.ts`. Nunca `fetch` directo.
- **Imports:** Siempre alias `@/`. Nunca rutas relativas `../`. Orden: React → librerías → locales.
- **TypeScript:** Sin `any`. Todas las funciones con tipo de retorno explícito.
- **Logs:** Nunca `console.log`. Usar `src/services/logger.ts`.
- **Errores de API:** Siempre en el hook (`onError`). Nunca en la screen. Nunca `Alert.alert()` directo. Todo proyecto debe tener `useToast` + `<Toast />` y `ErrorBoundary` en `App.tsx`.
- **useEffect:** Solo para sincronizar con sistemas externos o APIs imperativas. No usarlo para derivar estado desde props/state, encadenar cálculos, reaccionar a eventos de usuario, disparar submits/POST ni como wrapper genérico de fetch. Para datos del servidor usar React Query; para acciones del usuario, handlers o `useMutation`; para bootstrap único de app, inicialización idempotente en entrypoint/store.
- **Gestor de paquetes:** `pnpm` preferido. Si no está disponible, preguntar antes de usar `npm`.
- **Componentes:** Máximo 300 líneas por archivo. Sin archivos `.styles.ts`.
- **App shell:** `App.tsx` debe usar `SafeAreaProvider` como provider global, `QueryClientProvider`, `ErrorBoundary`, `NavigationContainer`, `RootNavigator` y `<Toast />` como último hijo. En desarrollo, `verifyInstallation()` de Nativewind va dentro de `if (__DEV__)`.
- **SafeAreaView:** Todas las screens deben estar envueltas en `<SafeAreaView>` para respetar el status bar, notch, y dynamic island. `SafeAreaProvider` está en `App.tsx` (global).
- **Guest mode:** El template soporta "Entrar como invitado" desde Login. Usar `useAuth().loginAsGuest()` para acceder a tabs sin autenticación. Screens pueden checar `isGuest` para adaptar contenido (ej: Profile muestra UI diferente para invitados).
- **Loading states:** Usar skeletons con **boneyard** ([github.com/0xGF/boneyard](https://github.com/0xGF/boneyard)) para estados de carga de listas y tarjetas. Nunca `ActivityIndicator` como estado principal de pantalla. Para acciones puntuales (submit de formulario) es aceptable deshabilitar el botón con un label de "Cargando…".
- **Keyboard management:** Toda screen que contenga `TextInput` debe envolver su contenido en `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>`. Importar `Platform` de `react-native`.

---

## Doc a leer según la tarea

| Tarea | Doc obligatorio |
|---|---|
| Crear proyecto desde cero | [docs/core/agent-instructions.md](docs/core/agent-instructions.md) (flujo completo PASO 1–10) |
| Nueva pantalla o feature | [docs/core/agent-instructions.md](docs/core/agent-instructions.md) (sección "Añadir una nueva screen") |
| Estilos / Tailwind | [docs/core/nativewind-theme.md](docs/core/nativewind-theme.md) |
| Navegación / rutas | [docs/core/navigation-patterns.md](docs/core/navigation-patterns.md) |
| Servicios / Axios / API | [docs/core/services-and-api.md](docs/core/services-and-api.md) |
| Hooks / React Query / Zustand | [docs/core/hooks-and-state.md](docs/core/hooks-and-state.md) |
| Plantillas de archivos | [docs/core/templates-snippets.md](docs/core/templates-snippets.md) |
| Iconos o animaciones | [docs/core/animations-and-icons.md](docs/core/animations-and-icons.md) |
| Plugin nativo (cámara, mapas, PDF, etc.) | [docs/core/native-plugins.md](docs/core/native-plugins.md) — leer **antes** de instalar |
| Naming, TypeScript, imports | [docs/core/conventions.md](docs/core/conventions.md) |
| Tests | [docs/core/testing-ci.md](docs/core/testing-ci.md) |
| Pantallas con formularios / inputs | [docs/core/templates-snippets.md](docs/core/templates-snippets.md) (sección KeyboardAvoidingView) |
| Loading states / skeleton | [docs/core/hooks-and-state.md](docs/core/hooks-and-state.md) (sección Loading States y Skeleton) |
| Maquetación desde Google Stitch | Skill `stitch-to-reactnative` (`.github/skills/stitch-to-reactnative/SKILL.md`) |

---

## Flujo para añadir una feature nueva

```
1. Añadir tipo en src/types/models.ts
2. Añadir función en src/services/api.ts
3. Crear hook en src/hooks/useFeature.ts (useQuery/useMutation si es dato de servidor)
4. Crear carpeta src/screens/FeatureName/index.tsx  ← usar plantilla de templates-snippets.md
5. Registrar ruta en src/navigation/navigation-types.ts
6. Añadir screen al stack en src/navigation/stacks/
```

---

## Separación de docs

| Carpeta | Contenido |
|---|---|
| `docs/core/` | Convenciones del stack — iguales para todos los proyectos |
| `docs/workspace/` | Especificaciones del proyecto concreto (no incluida en el template) |

Cuando exista `docs/workspace/`, leer primero sus archivos (`brief.md`, `screens.md`, `models.md`, `api.md`) para saber **qué** construir, y luego `docs/core/` para saber **cómo** construirlo.

**Cross-links entre docs — usa siempre rutas relativas desde la ubicación del archivo actual:**

| Origen | Destino | Formato |
|---|---|---|
| `docs/core/*.md` | Otro doc de core | `./X.md` |
| `docs/workspace/*.md` | Doc de core | `../core/X.md` |
| `README.md`, skills, `.github/` | Cualquier doc | `docs/core/X.md` |

---

## Ante la duda

- Si algo no está cubierto en los docs → preguntar al usuario antes de inventar convenciones.
- Si identificas una mejora → anotarla en [docs/core/changelog.md](docs/core/changelog.md). No modificar otros docs sin consenso.
