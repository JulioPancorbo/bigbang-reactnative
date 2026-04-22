---
title: Comandos útiles
version: 1.0
---

# Comandos útiles

Referencia rápida de los comandos más habituales durante el desarrollo de un proyecto React Native con Expo.

---

## Arranque y desarrollo

| Comando | Descripción |
|---|---|
| `pnpm start` | Arranca el servidor Metro (Expo DevTools). Abre QR para Expo Go. |
| `pnpm android` | Arranca y abre directamente en emulador/dispositivo Android. |
| `pnpm ios` | Arranca y abre directamente en simulador/dispositivo iOS. |
| `pnpm web` | Arranca la versión web del proyecto. |
| `pnpm start --clear` | Arranca limpiando la caché de Metro. Útil cuando hay cambios en `tsconfig`, alias o dependencias. |

---

## Expo CLI

| Comando | Descripción |
|---|---|
| `npx expo-doctor` | Verifica que el proyecto y sus dependencias son compatibles con la versión de Expo instalada. **Ejecutar siempre antes del primer arranque.** |
| `npx expo install <paquete>` | Instala un paquete fijando automáticamente la versión compatible con el SDK de Expo activo. Preferir este comando sobre `pnpm add` para paquetes del ecosistema Expo. |
| `npx expo install --fix` | Corrige versiones de dependencias incompatibles con el SDK activo. |
| `npx expo prebuild` | Genera las carpetas nativas `android/` e `ios/`. Necesario al usar plugins nativos o al hacer build standalone. |
| `npx expo prebuild --clean` | Regenera las carpetas nativas desde cero (borra y recrea). Usar si hay inconsistencias tras actualizar plugins. |

---

## Dependencias (pnpm)

| Comando | Descripción |
|---|---|
| `pnpm install` | Instala todas las dependencias del `package.json`. |
| `pnpm add <paquete>` | Añade una dependencia de producción. |
| `pnpm add -D <paquete>` | Añade una dependencia de desarrollo. |
| `pnpm remove <paquete>` | Elimina un paquete. |
| `pnpm outdated` | Lista los paquetes con versiones desactualizadas. |

---

## Tests

| Comando | Descripción |
|---|---|
| `pnpm test` | Ejecuta todos los tests una vez (modo CI). |
| `pnpm test:watch` | Ejecuta los tests en modo watch (re-ejecuta al guardar). Ideal durante desarrollo. |
| `pnpm test:coverage` | Genera el informe de cobertura en `coverage/`. |
| `pnpm test -- --testPathPattern=<ruta>` | Ejecuta solo los tests que coincidan con el patrón de ruta indicado. |
| `pnpm test -- --testNamePattern=<nombre>` | Ejecuta solo los tests cuyo nombre coincida con el patrón indicado. |
| `pnpm test -- -u` | Actualiza los snapshots obsoletos. |

---

## TypeScript

| Comando | Descripción |
|---|---|
| `npx tsc --noEmit` | Comprueba tipos en todo el proyecto sin emitir archivos. Útil para detectar errores antes de un commit. |
| `npx tsc --noEmit --watch` | Modo watch para comprobación de tipos continua. |

---

## Git (flujo habitual)

| Comando | Descripción |
|---|---|
| `git status` | Muestra los archivos modificados, staged y no rastreados. |
| `git add .` | Añade todos los cambios al stage. |
| `git commit -m "mensaje"` | Crea un commit con el mensaje indicado. |
| `git push` | Sube los commits al remoto. |
| `git pull --rebase` | Actualiza la rama local aplicando los cambios locales encima. Evita commits de merge innecesarios. |

---

## Diagnóstico y limpieza

| Comando | Descripción |
|---|---|
| `npx expo-doctor` | Diagnóstico completo del proyecto Expo. Ver sección Expo CLI. |
| `npx react-native info` | Muestra versiones del entorno (Node, npm, Java, Xcode, etc.). |
| `rm -rf node_modules && pnpm install` | Reinstalación completa de dependencias. Resolver cuando `pnpm install` no soluciona problemas de módulos. |
| `watchman watch-del-all` | Resetea el watcher de Watchman (macOS/Linux). Útil si Metro no detecta cambios. |

---

## Notas

- Usar siempre `pnpm` como gestor de paquetes. Si no está disponible, consultar al usuario antes de usar `npm`.
- Para paquetes del ecosistema Expo (sensores, cámara, almacenamiento, etc.) usar siempre `npx expo install` para garantizar compatibilidad de versiones.
- Consultar [project-setup.md](./project-setup.md) para el flujo completo de creación de un proyecto desde cero.
- Consultar [testing-ci.md](./testing-ci.md) para la estrategia de tests y configuración de CI.
