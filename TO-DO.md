i# TO-DO DOCUMENTATION

* [X] Aplicar api.service.ts de ionic en esta documentación para mantener los getEntity etc
* [X] Aplicar testing (con Jist?)
* [X] Elegir entre Redux y Zustand en estados
* [X] Implementar Renovate
* [X] usar @expo/vector-icons para iconos estáticos y "lottie-react-native" para iconos animados
* [X] Animaciones de interfaz con "react-native-reanimated"
* [X] Añadir registro y login funcional?
* [X] Crear pantallas "base" como registro, login, home y profile?
* [X] Añadir plugins (cámara, archivos, pdf) en .md?
* [X] Crear skill "create-project" que ejecute todo.
  * [X] Skill `bigbang-reactnative` movida al repo en `.copilot/skills/bigbang-reactnative/` — siempre instala stack completo, reference files apuntan a docs/ del repo (sincronización automática vía git).
* [ ] Documentar la carpeta `docs-project/` para especificaciones del proyecto concreto.
  * [ ] Crear plantillas de: `brief.md`, `screens.md`, `models.md`, `api.md`
  * [X] Actualizar `README.md` explicando la separación `docs/` (convenciones del stack) vs `docs-project/` (especificaciones del proyecto)
* [X] Patrón de manejo de errores global (ErrorBoundary + sistema de toast/alerts estandarizado)
* [ ] Estrategia offline / NetInfo (`@react-native-community/netinfo` + React Query `onlineManager`)
* [X] Patrón de carga de imágenes optimizado (`expo-image` para caché y rendimiento en listas)
* [ ] Deep linking con auth (redirect post-login cuando usuario no autenticado recibe un link protegido)
* [ ] Patrón de i18n opcional (estructura `src/i18n/` para proyectos multi-idioma)
* [X] Añadir un .copilot-instructions que haga referencia al README.md, de forma que cada vez que el agente vaya a trabajar, tenga en cuenta todas las directrices y convenciones declaradas.
* [X] Recomendaciones de extensiones
