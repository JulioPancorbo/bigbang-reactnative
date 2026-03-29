---
title: Plugins Nativos
version: 1.0
---

# Plugins Nativos

Este documento define qué plugin usar para cada caso de uso nativo. El agente debe consultar esta guía antes de instalar cualquier dependencia nativa y respetar las decisiones aquí tomadas para garantizar consistencia entre proyectos.

> **Regla operativa:** Antes de instalar un plugin nativo, verificar en la tabla de compatibilidad si requiere Development Build. Nunca instalar una alternativa distinta a la aquí documentada sin consultarlo con el usuario.

---

## Tabla de referencia rápida

| Necesidad | Plugin | Expo Go | Dev Build |
|---|---|:---:|:---:|
| Seleccionar imagen/vídeo de galería | `expo-image-picker` | ✅ | No |
| Acceso a cámara (foto/vídeo) | `expo-camera` | ✅ | No |
| Adjuntar archivo (PDF, docx, etc.) | `expo-document-picker` | ✅ | No |
| Visualizar PDF | `react-native-pdf` | ❌ | **Sí** |
| Mapas interactivos | `react-native-maps` | ✅ | No* |
| Tareas en background | `expo-task-manager` | ⚠️ | Recomendado |
| Geolocalización | `expo-location` | ✅ | No |
| Notificaciones push | `expo-notifications` | ✅ | No |
| Biometría (Face ID / huella) | `expo-local-authentication` | ✅ | No |
| Compartir contenido | `expo-sharing` | ✅ | No |

> \* `react-native-maps` funciona en Expo Go pero **requiere configurar API keys** en `app.json` para funcionar en Android.

---

## Árbol de decisión

```
¿Necesitas acceder a imágenes/vídeos del usuario?
  ├─ De la galería → expo-image-picker  ✅
  └─ Captura con cámara → expo-camera  ✅

¿Necesitas que el usuario adjunte un archivo?
  └─ expo-document-picker  ✅

¿Necesitas mostrar un PDF?
  └─ react-native-pdf  ✅  (requiere Dev Build)

¿Necesitas mostrar un mapa?
  └─ react-native-maps  ✅  (requiere API key en app.json)

¿Necesitas ejecutar código en background?
  ├─ Fetch periódico → expo-task-manager + expo-background-fetch  ✅
  ├─ Localización en background → expo-task-manager + expo-location  ✅
  └─ Notificaciones programadas → expo-task-manager + expo-notifications  ✅

¿Necesitas geolocalización en primer plano?
  └─ expo-location  ✅  (sin expo-task-manager)

¿Necesitas autenticación biométrica?
  └─ expo-local-authentication  ✅

¿Necesitas compartir contenido a otras apps?
  └─ expo-sharing  ✅
```

---

## 1. Galería e imagen — `expo-image-picker`

**Cuándo usarlo:** seleccionar una foto o vídeo de la galería del dispositivo, o capturar una foto desde cámara con UI nativa sencilla (sin control avanzado de cámara).

**Por qué:** incluido en Expo SDK, cero configuración nativa, maneja los permisos automáticamente.

### Instalación

```bash
pnpm add expo-image-picker
```

### Uso básico

```tsx
import * as ImagePicker from 'expo-image-picker'

async function pickImage(): Promise<void> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  })

  if (!result.canceled) {
    const uri = result.assets[0].uri
    // usar uri...
  }
}
```

### Permisos requeridos en `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "La app necesita acceso a tus fotos.",
          "cameraPermission": "La app necesita acceso a tu cámara."
        }
      ]
    ]
  }
}
```

**Reglas:**
- Usar `expo-image-picker` para casos sencillos (avatar, adjuntar foto).
- Si la app necesita control avanzado de cámara (zoom, flash, escaneo QR), evaluar `expo-camera`.
- Siempre manejar el caso `result.canceled === true`.
- La calidad máxima recomendada para upload es `quality: 0.8`.

---

## 2. Cámara — `expo-camera`

**Cuándo usarlo:** cuando se necesita acceso directo al viewfinder de la cámara con control sobre flash, zoom, cara delantera/trasera, o escaneo de códigos de barras/QR.

**Por qué:** integrado en Expo SDK, soporta escaneo QR sin librerías adicionales desde SDK 49.

### Instalación

```bash
pnpm add expo-camera
```

### Uso básico

```tsx
import { CameraView, useCameraPermissions } from 'expo-camera'

export function CameraScreen(): JSX.Element {
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission?.granted) {
    return (
      <View className="flex-1 items-center justify-center">
        <Button onPress={requestPermission} label="Conceder permiso de cámara" />
      </View>
    )
  }

  return (
    <CameraView
      className="flex-1"
      facing="back"
    />
  )
}
```

### Permisos requeridos en `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "La app necesita acceso a tu cámara."
        }
      ]
    ]
  }
}
```

**Reglas:**
- No usar `expo-camera` si solo se necesita seleccionar una foto — usar `expo-image-picker`.
- Pedir permiso siempre antes de montar el componente `CameraView`.
- No mantener la cámara activa en background; desactivarla al navegar fuera de la pantalla.

---

## 3. Adjuntar archivo — `expo-document-picker`

**Cuándo usarlo:** cuando el usuario necesita adjuntar un archivo desde su almacenamiento (PDF, Word, Excel, imágenes, etc.).

**Por qué:** integrado en Expo SDK, usa el picker nativo del sistema operativo, sin configuración nativa adicional.

### Instalación

```bash
pnpm add expo-document-picker
```

### Uso básico

```tsx
import * as DocumentPicker from 'expo-document-picker'

async function pickDocument(): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',        // cualquier tipo de archivo
    copyToCacheDirectory: true,
  })

  if (!result.canceled) {
    const file = result.assets[0]
    // file.uri, file.name, file.mimeType, file.size
  }
}

// Solo PDFs
async function pickPdf(): Promise<void> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
  })
  // ...
}
```

**Reglas:**
- `copyToCacheDirectory: true` es necesario si el archivo se va a leer o subir.
- Siempre manejar `result.canceled === true`.
- Para filtrar por tipo, usar MIME types: `application/pdf`, `image/*`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, etc.

---

## 4. Visor de PDF — `react-native-pdf`

**Cuándo usarlo:** cuando la app necesita renderizar y mostrar un PDF dentro de la pantalla.

**Por qué:** es la librería más completa para visualización de PDF en React Native, con soporte de páginas, zoom y scroll.

> ⚠️ **Requiere Development Build.** No funciona en Expo Go. Siempre avisar al equipo antes de añadirla.

### Instalación

```bash
pnpm add react-native-pdf
pnpm add react-native-blob-util  # dependencia obligatoria
```

Configurar en `app.json`:

```json
{
  "expo": {
    "plugins": ["react-native-pdf"]
  }
}
```

Reconstruir el Development Build tras la instalación:

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

### Uso básico

```tsx
import Pdf from 'react-native-pdf'
import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

export function PdfViewer({ uri }: { uri: string }): JSX.Element {
  return (
    <Pdf
      source={{ uri, cache: true }}
      style={{ flex: 1, width, height }}
      onError={(error) => {
        // manejar error
      }}
    />
  )
}
```

**Reglas:**
- Usar `cache: true` para PDFs remotos y evitar descargas repetidas.
- Si solo se necesita abrir un PDF en el visor del sistema (sin renderizado en app), usar `expo-file-viewer` — no requiere Dev Build.
- Siempre implementar el callback `onError`.

---

## 5. Mapas — `react-native-maps`

**Cuándo usarlo:** cuando la app necesita mostrar un mapa interactivo con marcadores, rutas o clustering.

**Por qué:** es el estándar de facto en React Native para mapas, compatible con Google Maps (Android/iOS) y Apple Maps (iOS).

> ⚠️ **Requiere API Key de Google Maps** para funcionar en Android. Sin ella, el mapa aparece en blanco.

### Instalación

```bash
pnpm add react-native-maps
```

### Configuración en `app.json`

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "EXPO_PUBLIC_GOOGLE_MAPS_KEY"
        }
      }
    },
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "EXPO_PUBLIC_GOOGLE_MAPS_KEY"
        }
      ]
    ]
  }
}
```

Añadir la variable en `.env`:

```
EXPO_PUBLIC_GOOGLE_MAPS_KEY=tu_api_key_aqui
```

### Uso básico

```tsx
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

export function MapScreen(): JSX.Element {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      className="flex-1"
      initialRegion={{
        latitude: 40.4168,
        longitude: -3.7038,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker
        coordinate={{ latitude: 40.4168, longitude: -3.7038 }}
        title="Madrid"
        description="Capital de España"
      />
    </MapView>
  )
}
```

**Reglas:**
- Usar siempre `PROVIDER_GOOGLE` en Android para consistencia visual entre plataformas.
- La API key de Google Maps debe estar en `.env` como `EXPO_PUBLIC_GOOGLE_MAPS_KEY`, nunca hardcodeada.
- No olvidar habilitar la API "Maps SDK for Android" y "Maps SDK for iOS" en Google Cloud Console.
- Para iOS en Expo Go: Apple Maps funciona sin configuración; Google Maps requiere Dev Build.

---

## 6. Tareas en background — `expo-task-manager`

**Cuándo usarlo:** cuando la app necesita ejecutar código mientras está en background o cerrada.

**Por qué:** es la capa de abstracción de Expo sobre las APIs nativas de background. Siempre se combina con otro módulo según el caso de uso.

> ⚠️ **Funcionalidad limitada en Expo Go.** Se recomienda Development Build para pruebas fiables.

### Combinaciones requeridas según caso de uso

| Caso | Módulos |
|---|---|
| Fetch periódico de datos | `expo-task-manager` + `expo-background-fetch` |
| Geolocalización en background | `expo-task-manager` + `expo-location` |
| Notificaciones programadas | `expo-task-manager` + `expo-notifications` |

### Instalación (ejemplo con background fetch)

```bash
pnpm add expo-task-manager expo-background-fetch
```

### Uso básico — Background Fetch

```tsx
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'

const BACKGROUND_FETCH_TASK = 'background-fetch-task'

// Definir la tarea — debe estar en el scope global del archivo (fuera de componentes)
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // lógica de sincronización...
    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

// Registrar la tarea (ej: al iniciar sesión)
async function registerBackgroundFetch(): Promise<void> {
  await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 15 * 60, // mínimo 15 minutos en iOS
    stopOnTerminate: false,
    startOnBoot: true,
  })
}

// Cancelar la tarea (ej: al cerrar sesión)
async function unregisterBackgroundFetch(): Promise<void> {
  await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK)
}
```

**Reglas:**
- `TaskManager.defineTask` siempre en el scope global del módulo, nunca dentro de un componente o función.
- El intervalo mínimo en iOS es de **15 minutos**; el sistema puede no respetar intervalos menores.
- Desregistrar siempre las tareas al cerrar sesión o cuando ya no sean necesarias.
- No asumir que la tarea se ejecutará en el intervalo exacto — iOS las regula según batería y uso.

---

## 7. Geolocalización — `expo-location`

**Cuándo usarlo:** obtener la posición GPS del usuario, tanto en primer plano como en background (combinado con `expo-task-manager`).

### Instalación

```bash
pnpm add expo-location
```

### Uso básico (primer plano)

```tsx
import * as Location from 'expo-location'

async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  const { status } = await Location.requestForegroundPermissionsAsync()

  if (status !== 'granted') {
    return null
  }

  return Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
}
```

### Permisos en `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "La app usa tu ubicación para mostrarte contenido relevante.",
          "isAndroidBackgroundLocationEnabled": true
        }
      ]
    ]
  }
}
```

**Reglas:**
- Para background: combinar con `expo-task-manager` y pedir permiso `requestBackgroundPermissionsAsync`.
- Usar `Accuracy.Balanced` como valor por defecto; solo usar `Accuracy.High` cuando sea imprescindible (mayor consumo de batería).
- Siempre manejar el caso de permiso denegado con un mensaje claro al usuario.

---

## 8. Notificaciones push — `expo-notifications`

**Cuándo usarlo:** enviar o recibir notificaciones push locales o remotas.

### Instalación

```bash
pnpm add expo-notifications
```

### Configuración en `app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./src/assets/images/notification-icon.png",
          "color": "#007AFF"
        }
      ]
    ]
  }
}
```

### Uso básico — obtener token push

```tsx
import * as Notifications from 'expo-notifications'

async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync()

  if (status !== 'granted') {
    return null
  }

  const token = await Notifications.getExpoPushTokenAsync()
  return token.data
}
```

**Reglas:**
- El token de push debe enviarse al backend tras el login y eliminarse al logout.
- Configurar `Notifications.setNotificationHandler` en `App.tsx` para controlar el comportamiento en primer plano.
- Para notificaciones locales programadas, combinar con `expo-task-manager`.

---

## 9. Biometría — `expo-local-authentication`

**Cuándo usarlo:** autenticar al usuario con Face ID, Touch ID o huella dactilar como capa de seguridad adicional.

### Instalación

```bash
pnpm add expo-local-authentication
```

### Uso básico

```tsx
import * as LocalAuthentication from 'expo-local-authentication'

async function authenticateWithBiometrics(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync()
  const isEnrolled = await LocalAuthentication.isEnrolledAsync()

  if (!hasHardware || !isEnrolled) {
    return false
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Confirma tu identidad',
    fallbackLabel: 'Usar contraseña',
  })

  return result.success
}
```

**Reglas:**
- Siempre verificar `hasHardwareAsync` e `isEnrolledAsync` antes de lanzar el prompt.
- No usar biometría como único método de autenticación — siempre ofrecer fallback por PIN o contraseña.
- No almacenar credenciales en AsyncStorage; usar `expo-secure-store` para tokens sensibles.

---

## 10. Compartir contenido — `expo-sharing`

**Cuándo usarlo:** permitir al usuario compartir un archivo, imagen o PDF a otras apps del sistema.

### Instalación

```bash
pnpm add expo-sharing
```

### Uso básico

```tsx
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system'

async function shareFile(remoteUri: string, filename: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync()

  if (!isAvailable) {
    // El dispositivo no soporta compartir (simulador, algunos Android)
    return
  }

  // Descargar el archivo primero si es remoto
  const localUri = `${FileSystem.cacheDirectory}${filename}`
  await FileSystem.downloadAsync(remoteUri, localUri)

  await Sharing.shareAsync(localUri)
}
```

**Reglas:**
- Siempre verificar `isAvailableAsync()` antes de llamar a `shareAsync`.
- Los archivos remotos deben descargarse localmente antes de compartirlos — usar `expo-file-system`.
- `expo-file-system` es parte del Expo SDK y no requiere instalación adicional.

---

## Reglas generales

- **No instalar un plugin nativo que no esté en esta guía sin consultarlo con el usuario primero.**
- Si el plugin requiere Dev Build, comunicarlo explícitamente antes de instalarlo.
- Siempre añadir los permisos necesarios en `app.json` en el mismo paso que la instalación.
- Las API keys y secrets nunca van hardcodeados — siempre en variables `EXPO_PUBLIC_*` en `.env`.
- Tras instalar cualquier plugin con código nativo, si se usa Dev Build, reconstruir antes de probar.
- Registrar cualquier plugin nuevo añadido al proyecto en `docs/changelog.md`.
