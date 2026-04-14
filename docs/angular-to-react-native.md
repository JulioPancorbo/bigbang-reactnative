---
title: De Angular/Ionic a React Native
audience: developers
---

# De Angular/Ionic a React Native

Guía de referencia para desarrolladores con experiencia en Ionic + Angular + Laravel que se incorporan a proyectos React Native con este stack.

> Este documento es para lectura humana. El agente de IA no necesita leerlo.

---

## Mentalidad general

| Concepto | Angular | React Native |
|---|---|---|
| Arquitectura | Clases + Inyección de Dependencias | Funciones + importaciones directas |
| Reactividad | RxJS (Observables, Subjects) | React Query + Zustand |
| Estilos | SCSS / Ionic CSS variables | Nativewind (Tailwind CSS) |
| Navegación | Angular Router | React Navigation |
| HTTP | `HttpClient` + `@angular/common/http` | Axios |
| Almacenamiento seguro | `@ionic/storage` | `expo-secure-store` |
| Testing | Jasmine + Karma | Jest + Testing Library |
| DI / Singleton | `@Injectable({ providedIn: 'root' })` | Módulo ES importado directamente |

---

## Servicios

### `@Injectable` → ES module

En Angular, los servicios son clases que Angular instancia una sola vez gracias a `providedIn: 'root'`. En React Native no hay DI: simplemente exportas funciones de un módulo TypeScript y las importas donde las necesitas. El módulo se evalúa una vez, así que el singleton es natural.

```typescript
// Angular
@Injectable({ providedIn: 'root' })
export class ApiService {
  getEntity(entity: string) { ... }
}

// React Native
export const getEntity = async <T>(entity: string): Promise<T> => { ... }
```

### `setTokenToHeaders()` → `interceptors.request`

En Angular tenías que llamar manualmente a `setTokenToHeaders(token)` tras el login. En React Native el token se inyecta automáticamente en cada request vía un interceptor de Axios que lee de `expo-secure-store`.

```typescript
// Angular — manual
this.apiService.setTokenToHeaders(token)

// React Native — automático, en api.ts
api.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

### `HttpClient` con `observe: 'events'` → `onUploadProgress`

El tracking de progreso de uploads usaba `HttpEventType` en Angular. En React Native, Axios lo resuelve con `onUploadProgress`:

```typescript
// Angular
const req = new HttpRequest('POST', url, formData, { reportProgress: true })
this.http.request(req).pipe(
  map(event => {
    if (event.type === HttpEventType.UploadProgress)
      return Math.round((100 * event.loaded) / event.total)
  })
)

// React Native
api.post(url, formData, {
  onUploadProgress: (event) => {
    const percent = Math.round((event.loaded * 100) / event.total)
    onProgress?.(percent)
  },
})
```

---

## Reactividad

### `BehaviorSubject` → Zustand

El `BehaviorSubject` de Angular emite el valor actual a cualquier suscriptor. En React Native, Zustand hace exactamente lo mismo: cualquier componente que lea del store se re-renderiza cuando el estado cambia.

```typescript
// Angular
public authenticationState = new BehaviorSubject('')
this.authenticationState.next(token)       // emitir
this.authenticationState.value             // leer valor actual

// React Native (Zustand)
const useAuthStore = create((set) => ({
  token: null,
  setAuth: (token, user) => set({ token, user }),
}))
useAuthStore.getState().setAuth(token, user)  // emitir
useAuthStore.getState().token                  // leer valor actual
```

### `Subject<any>` (productChange, exerciseChange...) → `queryClient.invalidateQueries`

En Angular, los Subjects en `ApiService` eran una forma de notificar a otras partes de la app que algo cambió. En React Native con React Query, cuando mutes un dato simplemente invalidas su cache y todos los componentes que lo consumen se actualizan solos.

```typescript
// Angular
this.apiService.productChange.next(updatedProduct)

// React Native
queryClient.invalidateQueries({ queryKey: ['products'] })
```

### `Observable` / `pipe` / `catchError` → `async/await` + `try/catch`

No hay RxJS. Toda la lógica asíncrona va con `async/await`:

```typescript
// Angular
this.apiService.getEntity('user').pipe(
  map((user: User) => user.role_id),
  catchError(error => of(null))
)

// React Native
const user = await getEntity<User>('user')
return user.role_id
```

---

## Autenticación

### `@ionic/storage` → `expo-secure-store`

`@ionic/storage` en Ionic guarda datos de forma no encriptada por defecto. `expo-secure-store` usa el **Keychain de iOS** y el **Keystore de Android**, que son almacenes encriptados a nivel de sistema operativo. Nunca uses `AsyncStorage` para tokens.

```typescript
// Ionic
await this.storage.set('auth-token', token)
await this.storage.get('auth-token')
await this.storage.remove('auth-token')

// React Native
await SecureStore.setItemAsync('auth-token', token)
await SecureStore.getItemAsync('auth-token')
await SecureStore.deleteItemAsync('auth-token')
```

### `checkToken()` en el constructor → bootstrap idempotente del store/entrypoint

En Angular, el constructor del `AuthenticationService` llamaba a `checkToken()` en el arranque. En React Native no hay constructores, y tampoco conviene usar un `useEffect` de montaje para esto. La equivalencia correcta es arrancar la hidratación una vez desde el entrypoint o el store, con un bootstrap idempotente.

```typescript
// Angular (constructor)
constructor(...) { this.checkToken() }

// React Native (entrypoint / App.tsx)
let didBootstrap = false

function bootstrapApp(): void {
  if (didBootstrap) return
  didBootstrap = true
  void useAuthStore.getState().loadToken()
}
```

### `SubscriptionGuard.clearCache()` → `queryClient.clear()`

Al hacer logout hay que limpiar cualquier dato cacheado del usuario anterior. En React Native, React Query tiene `queryClient.clear()` para vaciar toda la cache.

```typescript
// Angular
SubscriptionGuard.clearCache()

// React Native
queryClient.clear()
```

---

## Hooks vs Servicios

En Angular, la mayor parte de la lógica vivía en los servicios (`@Injectable`). En React Native hay que separar en dos capas:

| Responsabilidad | Angular | React Native |
|---|---|---|
| Llamadas HTTP | `ApiService` | `services/api.ts` (funciones puras) |
| Estado reactivo | `BehaviorSubject` + suscripciones | `useQuery` / `useMutation` / Zustand |
| Puente entre ambos | — | `hooks/` (custom hooks) |

Los hooks de React son el equivalente al "pegamento" que en Angular hacían los componentes con `async pipe` y las subscripciones en `ngOnInit`.

---

## Rutas anidadas de Laravel

El patrón de sub-entidades es el mismo concepto que en el Angular service:

```typescript
// Angular
this.apiService.getSubEntity('trainers', 1, 'exercises')
// → GET /trainers/1/exercises

// React Native
getSubEntity<Exercise[]>('trainers', 1, 'exercises')
// → GET /trainers/1/exercises
```

La diferencia es que en React Native la función es directamente `async/await` sin Observable.

---

## Formularios

| Angular | React Native |
|---|---|
| `ReactiveFormsModule` / `FormGroup` | `useForm` hook custom + `TextInput` |
| `FormControl.valueChanges` | `onChangeText` + `useState` |
| `Validators.required` / `Validators.email` | Función `validate` en `useForm` |
| `form.valid` | `Object.keys(errors).length === 0` |

---

## Estructura de archivos

```
Angular                          React Native
──────────────────────────────────────────────────
app/services/api.service.ts   →  src/services/api.ts
app/services/auth.service.ts  →  src/services/auth.ts
                                 src/store/authStore.ts (estado)
                                 src/hooks/useAuth.ts (hook)
app/pages/Home/home.page.ts   →  src/screens/Home/index.tsx
app/components/btn/btn.ts     →  src/components/Button/Button.tsx
src/environments/             →  .env + process.env.EXPO_PUBLIC_*
app-routing.module.ts         →  src/navigation/ (React Navigation)
```
