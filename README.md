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

### Datos de ejemplo (opcional)

La base arranca vacía (no hay ningún `.sqlite` versionado en el repo). Para
tener algo para mostrar sin cargar tareas a mano:

```bash
cd backend
npm run seed
```

Carga 6 tareas de ejemplo (2 por estado) directo con el mismo repositorio
que usa la app — sin pasar por HTTP. Si se va a usar Docker, ejecutar el
seed **antes** de `docker-compose up`, apuntando a la misma carpeta que el
contenedor monta como volumen:

```bash
cd backend
DB_PATH=../data/tasks.sqlite npm run seed
cd ..
docker-compose up
```

`backend/scripts/seed.ts` corre con `ts-node` directo (usa `tsconfig.json`,
no `tsconfig.build.json`), así que no pasa por `nest build`. **Bug real que
encontramos**: al agregar `scripts/` sin excluirlo de `tsconfig.build.json`,
`nest build` empezó a compilarlo también (nada lo excluía), lo que cambió
la raíz común de compilación de `src/` a la carpeta del proyecto — el
output pasó de `dist/main.js` a `dist/src/main.js`, rompiendo el `CMD`
del Dockerfile en silencio. Se corrigió agregando `"scripts"` al `exclude`
de `tsconfig.build.json`.

### Endpoints

| Método | Ruta         | Descripción              |
|--------|--------------|--------------------------|
| GET    | /tasks       | Lista todas las tareas   |
| POST   | /tasks       | Crea una tarea           |
| PUT    | /tasks/:id   | Edita una tarea          |
| DELETE | /tasks/:id   | Elimina una tarea        |

Documentación interactiva (Swagger UI): **`http://localhost:3000/docs`**.

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
- **Documentación con Swagger** (`@nestjs/swagger`, en `/docs`): se genera
  sola a partir de los mismos decoradores de los DTOs (`@ApiProperty`) y del
  controlador (`@ApiOperation`/`@ApiResponse`) — no es un documento aparte
  que se pueda desactualizar, es la misma fuente de verdad que ya usa
  `class-validator`. Excluido explícitamente del `ServeStaticModule` para
  que no choque con los estáticos del frontend.
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
- **Tests unitarios por componente** (34 en total, además de los 3 del
  componente raíz): `TaskForm` (validación, modo crear/editar), `TaskList`
  (filtro), `TaskItem` (render, eventos), `TaskBoard` (paginación y el
  cálculo de `position` al arrastrar — incluida la distinción por
  referencia entre "misma columna" y "columna distinta"), `Sidebar` y
  `Topbar` (eventos), y `TaskService` con `HttpClientTesting`.
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

- **Migraciones de esquema para SQLite**: hoy un cambio de esquema requiere
  borrar el archivo `.sqlite` existente (ver la sección de Backend). Un
  guard de `ALTER TABLE ... ADD COLUMN` en el constructor del repositorio
  resolvería esto sin herramientas externas.
- **Autenticación/multiusuario**: el enunciado aclara que no se requiere,
  pero en un producto real cada usuario vería solo sus propias tareas.
- **CORS sin restringir** (`app.enableCors()` sin opciones): aceptable para
  correr local sin autenticación, pero en producción restringiría el
  origen permitido a la URL real del frontend.
- **Validación sin límites en `description` y `position`**: `title` tiene
  `@MaxLength(200)`, pero `description` no tiene tope de longitud, y
  `position` acepta cualquier número (un cliente podría mandar un valor
  extremo y romper el orden). Le agregaría `@MaxLength` y un rango
  razonable a `position`.
- **Drag & drop combinado con búsqueda/filtro activos**: `TaskBoard` calcula
  la nueva `position` mirando solo los vecinos *visibles* — si hay una tarea
  oculta por el filtro de búsqueda/prioridad justo entre las dos tarjetas
  visibles donde se suelta la tarjeta, el orden puede quedar mal ubicado
  respecto a esa tarea oculta (se nota recién al limpiar el filtro). Mismo
  problema al soltar en una columna que se ve vacía solo por el filtro: la
  posición cae al final (timestamp) en vez de considerar las tareas
  ocultas. Para arreglarlo de raíz, el cálculo de posición debería mirar el
  array completo de la columna (sin filtrar), no solo lo renderizado.
- **`pagedTasks()` sin memoizar** (`TaskBoard`): es un método plano, así que
  reasigna un array nuevo con `.slice()` en cada ciclo de detección de
  cambios (el template lo llama 2 veces por columna). A la escala de esta
  app (6 tareas por página) el costo es insignificante — lo dejaría como
  `computed()` recién si el dataset creciera mucho.
