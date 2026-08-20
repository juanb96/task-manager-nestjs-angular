# Progreso del desarrollo

Registro de Pull Requests mergeados, en orden cronológico. Cada feature del
proyecto se desarrolla en su propia rama y se integra a `main` vía PR.

| # PR | Rama | Descripción | Estado | Fecha |
|------|------|-------------|--------|-------|
| -    | -    | Setup inicial del repositorio (.gitignore, README) | Mergeado directo a main | 2026-08-20 |
| #1   | chore/pr-tracking-doc | Documento de tracking de PRs | Mergeado | 2026-08-20 |
| #2   | feat/backend-scaffold | Backend NestJS: patrón Repository, CRUD `/tasks`, validación, DI por token | Mergeado | 2026-08-20 |
| #3   | feat/frontend-scaffold | Frontend Angular 22 standalone: TaskForm/TaskList/TaskItem, TaskService, filtro por estado, manejo de loading/error | Mergeado | 2026-08-20 |
| #4   | feat/backend-task-priority | Backend: campo `priority` (low/medium/high) en Task, DTOs y tests | Mergeado | 2026-08-20 |
| #5   | feat/frontend-kanban-redesign | Frontend: rediseño tipo tablero Kanban (sidebar, topbar, drag&drop, búsqueda, filtro por prioridad, modal) | Mergeado | 2026-08-20 |
| #6   | feat/backend-sqlite-persistence | Backend: persistencia real con SQLite (`node:sqlite`), reemplaza el repositorio en memoria | Mergeado | 2026-08-20 |
| #7   | feat/docker-single-container | Docker: un solo contenedor (frontend+backend+SQLite), `docker-compose up`, volumen persistente, límite de memoria | Mergeado | 2026-08-20 |
| #8   | feat/frontend-board-pagination | Frontend: paginación por columna en el tablero Kanban (6 tareas/página), drag&drop con índices absolutos | Mergeado | 2026-08-20 |
| #9   | fix/task-card-text-overflow | Fix: título/descripción largos se desbordaban de la tarjeta; `overflow-wrap` + `line-clamp` | Mergeado | 2026-08-20 |
| #10  | feat/manual-task-ordering | Fix: mover una tarea entre columnas la mandaba al principio en vez de dejarla donde se soltó; orden manual real con `position` (índice fraccional) | Mergeado | 2026-08-20 |
| #11  | fix/new-task-appears-first | Fix: las tareas nuevas quedan primeras en su columna (contador de `position` decreciente) | Mergeado | 2026-08-20 |
| #12  | test/backend-task-service-unit-tests | Tests unitarios de `TaskService` mockeando `ITaskRepository` (9 tests) | Mergeado | 2026-08-20 |
| #13  | test/frontend-component-unit-tests | Tests unitarios de TaskForm/TaskList/TaskItem/TaskBoard/Sidebar/Topbar/TaskService (34 tests) | Mergeado | 2026-08-20 |
| #14  | feat/backend-swagger-docs | Documentación interactiva de la API con Swagger (`/docs`), generada desde los DTOs y el controlador | Mergeado | 2026-08-20 |
| #15  | fix/favicon-task-icon | Favicon: reemplaza el ícono por defecto de Angular por un check morado consistente con el logo del sidebar | Mergeado | 2026-08-20 |
| #16  | feat/backend-seed-script | Script `npm run seed` para cargar tareas de ejemplo (local y Docker) sin arrancar la app vacía | Esperando aprobación | 2026-08-20 |
