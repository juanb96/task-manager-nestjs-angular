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
