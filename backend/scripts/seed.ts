import { Task, TaskPriority, TaskStatus } from '../src/domain/task.entity';
import { SqliteTaskRepository } from '../src/infrastructure/task.repository.sqlite';

type SeedTask = Omit<Task, 'id' | 'createdAt'>;

const sampleTasks: SeedTask[] = [
  {
    title: 'Diseñar wireframes',
    description: 'Bocetos de las pantallas principales del tablero',
    status: TaskStatus.PENDING,
    priority: TaskPriority.MEDIUM,
    position: 0,
  },
  {
    title: 'Configurar CI/CD',
    description: 'Pipeline de build y tests automáticos',
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    position: 1,
  },
  {
    title: 'Implementar autenticación',
    description: 'Login y manejo de sesión',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    position: 2,
  },
  {
    title: 'Escribir documentación',
    description: 'README y guía de contribución',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.LOW,
    position: 3,
  },
  {
    title: 'Revisar accesibilidad',
    description: 'Contraste de colores y navegación por teclado',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    position: 4,
  },
  {
    title: 'Instalar dependencias',
    description: 'Angular CLI y paquetes necesarios para el proyecto',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    position: 5,
  },
];

async function seed(): Promise<void> {
  const repository = new SqliteTaskRepository();

  for (const task of sampleTasks) {
    await repository.create(task);
  }

  console.log(`Seeded ${sampleTasks.length} tasks.`);
  repository.onModuleDestroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
