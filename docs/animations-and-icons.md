---
title: Animaciones e Iconos
version: 1.0
---

# Animaciones e Iconos

Este documento define qué librería usar para cada caso de uso visual. La elección incorrecta genera overhead innecesario o limita las posibilidades de la UI.

---

## Jerarquía de decisión

```
¿Necesitas un icono estático?
  └─ @expo/vector-icons  ✅

¿Necesitas un icono/ilustración animada (Lottie JSON)?
  └─ lottie-react-native  ✅

¿Necesitas animar elementos de la interfaz (transiciones, gestos, layouts)?
  └─ react-native-reanimated  ✅
```

---

## 1. Iconos estáticos — `@expo/vector-icons`

**Cuándo usarlo:** cualquier icono estático en la UI (botones, tabs, listas, headers).

**Por qué:** viene incluido en Expo SDK, cero configuración adicional, incluye Ionicons, MaterialIcons, Feather, FontAwesome y más.

```tsx
import { Ionicons } from '@expo/vector-icons'

// Correcto
<Ionicons name="home-outline" size={24} color="#007AFF" />

// Con clase NativeWind para el contenedor
<View className="flex-row items-center gap-2">
  <Ionicons name="person-outline" size={20} color="#5856D6" />
  <Text className="text-base text-primary">Perfil</Text>
</View>
```

**Familias disponibles:**
| Familia | Import |
|---|---|
| Ionicons | `import { Ionicons } from '@expo/vector-icons'` |
| MaterialIcons | `import { MaterialIcons } from '@expo/vector-icons'` |
| Feather | `import { Feather } from '@expo/vector-icons'` |
| FontAwesome | `import { FontAwesome } from '@expo/vector-icons'` |
| AntDesign | `import { AntDesign } from '@expo/vector-icons'` |

**Reglas:**
- No instalar librerías de iconos adicionales si el icono existe en `@expo/vector-icons`.
- Usar siempre `color` como prop, nunca `className` directamente sobre el componente icono.
- El tamaño base es `size={24}` para iconos estándar, `size={20}` para iconos en texto inline.

---

## 2. Iconos y ilustraciones animadas — `lottie-react-native`

**Cuándo usarlo:** animaciones complejas basadas en JSON de After Effects (splash screens, estados vacíos, loaders, ilustraciones interactivas).

**Por qué:** reproduce archivos `.json` exportados desde LottieFiles o After Effects con resolución vectorial perfecta, sin coste de desarrollo de la animación.

### Instalación

```bash
# pnpm (recomendado)
pnpm add lottie-react-native

# npm
npm install lottie-react-native
```

### Uso básico

```tsx
import LottieView from 'lottie-react-native'

// Animación en bucle (loader, fondo)
<LottieView
  source={require('@/assets/animations/loading.json')}
  autoPlay
  loop
  style={{ width: 120, height: 120 }}
/>

// Animación que se reproduce una vez (success, onboarding)
<LottieView
  source={require('@/assets/animations/success.json')}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
/>
```

### Control programático

```tsx
import LottieView from 'lottie-react-native'
import { useRef } from 'react'

export function SuccessAnimation(): JSX.Element {
  const animationRef = useRef<LottieView>(null)

  const play = (): void => animationRef.current?.play()
  const reset = (): void => animationRef.current?.reset()

  return (
    <LottieView
      ref={animationRef}
      source={require('@/assets/animations/success.json')}
      loop={false}
      style={{ width: 160, height: 160 }}
    />
  )
}
```

**Reglas:**
- Los archivos `.json` de Lottie van en `src/assets/animations/`.
- No usar Lottie para animaciones de layout o transiciones de pantalla — eso es territorio de Reanimated.
- Preferir animaciones de LottieFiles que tengan licencia libre antes de encargar diseño propio.
- Siempre definir `style` con dimensiones explícitas para evitar saltos de layout.

---

## 3. Animaciones de interfaz — `react-native-reanimated`

**Cuándo usarlo:** transiciones de pantalla, animaciones de entrada/salida de elementos, gestos, interpolaciones de scroll, feedback táctil, animaciones de layout.

**Por qué:** corre en el hilo de UI (no en JS), lo que garantiza 60/120 fps sin jank. Es la librería estándar de facto para animaciones de interfaz en React Native.

### Instalación

```bash
# pnpm
pnpm add react-native-reanimated

# npm
npm install react-native-reanimated
```

Añadir el plugin en `babel.config.js` (debe ser el **último** plugin):

```js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module-resolver', { alias: { '@': './src' } }],
    'react-native-reanimated/plugin', // ← siempre el último
  ],
}
```

### Patrones de uso

#### Fade in al montar

```tsx
import Animated, { useAnimatedStyle, withTiming, FadeIn } from 'react-native-reanimated'

export function FadeCard(): JSX.Element {
  return (
    <Animated.View entering={FadeIn.duration(300)} className="p-4 bg-white rounded-xl">
      <Text className="text-base">Contenido</Text>
    </Animated.View>
  )
}
```

#### Animación controlada por estado

```tsx
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { useSharedValue } from 'react-native-reanimated'

export function ExpandableCard(): JSX.Element {
  const height = useSharedValue(60)

  const animatedStyle = useAnimatedStyle(() => ({
    height: withSpring(height.value),
  }))

  return (
    <Animated.View style={animatedStyle} className="bg-white rounded-xl overflow-hidden">
      <Pressable onPress={() => { height.value = height.value === 60 ? 200 : 60 }}>
        <Text className="p-4 text-base font-medium">Toca para expandir</Text>
      </Pressable>
    </Animated.View>
  )
}
```

#### Interpolación de scroll (header que se oculta)

```tsx
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'

export function AnimatedHeader(): JSX.Element {
  const scrollY = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y
  })

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [0, 80], [0, -40], Extrapolation.CLAMP) }],
  }))

  return (
    <>
      <Animated.View style={headerStyle} className="px-4 py-3 bg-white">
        <Text className="text-xl font-bold">Título</Text>
      </Animated.View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        {/* contenido */}
      </Animated.ScrollView>
    </>
  )
}
```

**Reglas:**
- Usar siempre `useSharedValue` para valores animados, nunca `useState` + `Animated.Value` de la API legacy.
- `useAnimatedStyle` nunca debe tener side effects ni llamadas a hooks React dentro.
- El plugin `react-native-reanimated/plugin` debe ser **el último** en `babel.config.js`.
- Para animaciones de entrada/salida simples, preferir los presets (`FadeIn`, `SlideInRight`, etc.) antes de construir con `withTiming` manualmente.
- No usar `react-native-reanimated` para reproducir animaciones basadas en JSON — para eso está Lottie.

---

## Resumen de reglas

| Necesidad | Librería | Instalar |
|---|---|---|
| Icono estático | `@expo/vector-icons` | Ya incluida en Expo |
| Icono/ilustración animada (JSON) | `lottie-react-native` | `pnpm add lottie-react-native` |
| Animación de layout, gesto o transición | `react-native-reanimated` | `pnpm add react-native-reanimated` |

**Nunca:**
- No usar `Animated` de React Native core (API legacy, JS thread).
- No usar `StyleSheet.create()` para valores animados.
- No usar Lottie para transiciones de UI nativas.
- No usar Reanimated para reproducir ficheros `.json` de Lottie.
