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
- **Persistencia real con SQLite**: `SqliteTaskRepository` usa el módulo
  nativo `node:sqlite` (disponible desde Node 22+, estable en Node 24 que usa
  este proyecto) — sin dependencias externas ni compilación nativa. La ruta
  del archivo se configura por `DB_PATH` (`.env`); en los tests e2e se usa
  `:memory:` para aislar cada corrida sin tocar disco. El cambio de
  `InMemoryTaskRepository` a `SqliteTaskRepository` fue **un solo archivo**
  (`task.module.ts`, el binding del token de DI) — es la demostración práctica
  de por qué vale la pena el patrón Repository: el servicio y el controlador
  no se tocaron. `InMemoryTaskRepository` se conserva en el código como
  implementación alternativa de referencia.
- **Prioridad de tarea** (`low` / `medium` / `high`): campo agregado para
  soportar el rediseño del frontend (tablero tipo Kanban con badges de
  prioridad). Por defecto es `medium` si no se especifica al crear.
- **Orden manual** (`position`, índice fraccional): al principio el listado
  se ordenaba por `createdAt`, así que arrastrar una tarea vieja a otra
  columna la hacía "saltar" al principio en vez de quedarse donde se soltó.
  Se agregó `position` (número); el frontend calcula el punto medio entre
  las dos tareas vecinas en el punto de destino (`(anterior + siguiente) / 2`)
  y lo persiste — así solo se actualiza la tarea movida, sin tocar el resto.
  Al crear una tarea, `position` se asigna con un contador estrictamente
  **decreciente** (en vez de creciente) para que la tarea nueva quede primera
  en su columna — es el comportamiento esperado de "agregar tarea" en un
  Kanban, en vez de que aparezca al final.
  **Limitación conocida**: como no hay sistema de migraciones, agregar esta
  columna a una base SQLite ya existente (creada con el esquema viejo)
  requiere borrar el archivo — `CREATE TABLE IF NOT EXISTS` no altera tablas
  ya creadas. Con más tiempo, agregaría un guard de migración (`ALTER TABLE
  ... ADD COLUMN` si la columna no existe) en el constructor del repositorio.
- **Tests unitarios de `TaskService`**: mockean `ITaskRepository` directamente
  (`jest.Mocked<ITaskRepository>`, sin Nest `TestingModule` ni SQLite real) —
  cubren los valores por defecto al crear, el filtrado de campos `undefined`
  en `update`, el orden decreciente de `position`, y los casos de
  `NotFoundException`. Es la demostración concreta de por qué vale la pena
  el patrón Repository: el servicio se testea aislado, sin tocar una base
  de datos real.

## Docker (todo en un solo comando)

```bash
docker-compose up
```

La app completa (frontend + backend + base de datos persistida) queda
disponible en `http://localhost:3000`, un solo contenedor, un solo puerto.
Los datos sobreviven a `docker-compose down && docker-compose up` gracias al
volumen `./data:/app/data`.

### Decisiones técnicas

- **Un solo contenedor, no dos**: el backend sirve el build de producción de
  Angular como archivos estáticos (`@nestjs/serve-static`) desde el mismo
  proceso Express/Nest que expone la API. Evita nginx y un segundo contenedor
  — para el alcance de esta prueba, un runtime menos que orquestar.
- **URLs relativas en el frontend** (`API_BASE_URL = ''`): antes apuntaban a
  `http://localhost:3000` a fuego, lo cual rompía en cuanto la app corriera
  bajo otro host/puerto dentro de un contenedor. En desarrollo (`ng serve`),
  un proxy de Angular (`proxy.conf.json`) reenvía `/tasks` al backend en el
  puerto 3000; en Docker, mismo origen, no hace falta proxy.
- **Multi-stage build**: una etapa compila Angular, otra compila Nest, y la
  imagen final solo copia los artefactos ya compilados + dependencias de
  producción — la imagen no lleva código fuente ni devDependencies.
- **Límite de memoria** (`mem_limit: 512m` en `docker-compose.yml`): evita que
  el contenedor consuma memoria sin control.
- **Volumen para SQLite**: `./data:/app/data` persiste el archivo `.sqlite`
  fuera del ciclo de vida del contenedor.

## Frontend

### Levantar el proyecto

```bash
cd frontend
npm install
npm start
```

La app queda disponible en `http://localhost:4200`. Requiere el backend
corriendo en `http://localhost:3000` (ver sección Backend).

### Componentes

- `TaskForm`: formulario reactivo (crear y editar, según si recibe una tarea).
- `TaskList`: listado con filtro por estado.
- `TaskItem`: tarjeta individual de una tarea (editar / eliminar).
- `App` (raíz): orquesta el estado (tareas, carga, error, edición activa) y
  las llamadas a `TaskService`.

### Decisiones técnicas

- **Standalone components** en toda la app, sin `NgModule`, como pide el
  enunciado para Angular 17+.
- **Signals** (`signal`, `input()`, `output()`, `effect()`) en vez de
  `@Input`/`@Output`/`EventEmitter` clásicos — es la API moderna recomendada
  por Angular y el proyecto se generó zoneless por defecto (Angular 22).
- **`TaskService`** inyectado con `inject()`, expone un método por operación
  CRUD sobre `HttpClient`.
- **Manejo de error**: la app raíz centraliza el estado de `loading`/`error` y
  muestra un mensaje si el backend no responde.
- **Sin variables de entorno de Angular** (`environment.ts`): la URL base de
  la API vive en `core/api.config.ts` como constante simple, ya que el
  alcance del proyecto no justifica configurar file replacement por ambiente.
- **Tests con Vitest**: el schematic por defecto de Angular 22 (`@angular/build:unit-test`)
  ya no usa Karma/Jasmine sino Vitest; se mantiene esa configuración por
  defecto en vez de forzar Karma.
- **Rediseño tipo tablero Kanban**: sidebar (Tablero / Todas las tareas, como
  toggle de vista local, sin Angular Router — no había ninguna otra ruta que
  justificara agregarlo), topbar con búsqueda y filtro por prioridad, y un
  tablero de 3 columnas (una por estado) con drag & drop vía `@angular/cdk`
  para cambiar el estado de una tarea arrastrándola entre columnas. El
  formulario pasó a vivir en un modal en vez de estar siempre visible.
- **Deliberadamente fuera de alcance**: no se agregaron páginas de
  "Calendario" ni "Estadísticas" en la sidebar (no las pide el enunciado y
  hubieran quedado como enlaces muertos), ni un avatar/usuario (el enunciado
  aclara que no se requiere autenticación).
- **Paginación por columna del tablero** (6 tareas por página): cada
  columna del Kanban pagina de forma independiente. El drag & drop calcula
  el índice absoluto dentro del array completo de la columna (no solo el de
  la página visible), así que mover una tarjeta entre columnas sigue
  funcionando correctamente aunque haya más de una página.
- **Desbordamiento de texto en las tarjetas**: título y descripción usan
  `overflow-wrap: break-word` (para que una palabra larga sin espacios se
  parta) + `-webkit-line-clamp` (2 líneas el título, 3 la descripción, con
  "…") para que las tarjetas mantengan una altura consistente sin importar
  cuánto texto tenga la tarea.

## Qué haría distinto con más tiempo

- **Tests unitarios de componentes del frontend**: hoy solo hay tests del
  componente raíz (3). El backend ya tiene tests unitarios de `TaskService`
  mockeando `ITaskRepository` (ver sección Backend), pero faltan tests de
  los componentes individuales del frontend (`TaskForm`, `TaskList`,
  `TaskItem`, `TaskBoard`, `Sidebar`, `Topbar`).
- **Migraciones de esquema para SQLite**: hoy un cambio de esquema requiere
  borrar el archivo `.sqlite` existente (ver la sección de Backend). Un
  guard de `ALTER TABLE ... ADD COLUMN` en el constructor del repositorio
  resolvería esto sin herramientas externas.
- **Autenticación/multiusuario**: el enunciado aclara que no se requiere,
  pero en un producto real cada usuario vería solo sus propias tareas.
