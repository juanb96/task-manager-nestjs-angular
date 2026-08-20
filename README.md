# Task Manager

Prueba técnica: gestor de tareas full-stack (NestJS + Angular 17).

## Estructura

```
backend/    # API REST (NestJS + TypeScript, patrón Repository)
frontend/   # Angular 17 (standalone components)
```

## Backend

### Levantar el proyecto

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

La API queda disponible en `http://localhost:3000`.

### Endpoints

| Método | Ruta         | Descripción              |
|--------|--------------|--------------------------|
| GET    | /tasks       | Lista todas las tareas   |
| POST   | /tasks       | Crea una tarea           |
| PUT    | /tasks/:id   | Edita una tarea          |
| DELETE | /tasks/:id   | Elimina una tarea        |

### Decisiones técnicas

- **NestJS** como framework: trae inyección de dependencias nativa, encaja
  naturalmente con el patrón Repository y es la opción recomendada por el
  enunciado.
- **Patrón Repository**: la interfaz `ITaskRepository` (`domain/`) define el
  contrato de acceso a datos. `InMemoryTaskRepository` (`infrastructure/`) es
  la implementación concreta. Como las interfaces de TypeScript no existen en
  tiempo de ejecución, se usa un token de inyección (`TASK_REPOSITORY`, un
  `Symbol`) para que Nest pueda resolver la dependencia por interfaz en lugar
  de acoplarse a la clase concreta — el `TaskService` solo conoce
  `ITaskRepository`, nunca `InMemoryTaskRepository` directamente.
- **Sin `task.routes.ts` separado**: en NestJS el ruteo se define con
  decoradores sobre el propio controlador (`@Get`, `@Post`, etc.) y se agrupa
  en el `TaskModule`, por lo que un archivo de rutas aparte sería redundante.
- **Validación**: `class-validator` sobre los DTOs (`CreateTaskDto`,
  `UpdateTaskDto`) más un `ValidationPipe` global (`whitelist`,
  `forbidNonWhitelisted`, `transform`) en `main.ts`.
- **Manejo de errores**: `NotFoundException` de Nest para update/delete sobre
  tareas inexistentes (404); errores de validación devuelven 400
  automáticamente vía el `ValidationPipe`.
- **Persistencia en memoria**: cumple el requisito mínimo del enunciado; el
  repositorio está aislado detrás de una interfaz para poder reemplazarlo por
  una implementación con SQLite/Mongo sin tocar el servicio ni el controlador.

## Frontend

En construcción.

## Qué haría distinto con más tiempo

Se documentará al finalizar el desarrollo.
