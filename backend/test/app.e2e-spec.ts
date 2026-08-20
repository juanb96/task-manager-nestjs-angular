import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    // In-memory SQLite per test run: fully isolated, nothing written to disk.
    process.env.DB_PATH = ':memory:';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/tasks (GET) starts empty', () => {
    return request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });

  it('supports the full create -> update -> delete flow', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Test task', description: 'desc', status: 'pending', priority: 'high' })
      .expect(201);

    const id = createRes.body.id;
    expect(createRes.body.priority).toBe('high');

    const updateRes = await request(app.getHttpServer())
      .put(`/tasks/${id}`)
      .send({ status: 'completed' })
      .expect(200);

    expect(updateRes.body.title).toBe('Test task');
    expect(updateRes.body.status).toBe('completed');
    expect(updateRes.body.priority).toBe('high');

    await request(app.getHttpServer()).delete(`/tasks/${id}`).expect(204);
    await request(app.getHttpServer()).get('/tasks').expect(200).expect([]);
  });

  it('/tasks (POST) defaults priority to medium when not provided', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'No priority given' })
      .expect(201);

    expect(res.body.priority).toBe('medium');
  });

  it('/tasks (POST) rejects an invalid status with 400', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'x', status: 'invalid' })
      .expect(400);
  });

  it('/tasks/:id (PUT) returns 404 for a nonexistent task', () => {
    return request(app.getHttpServer())
      .put('/tasks/does-not-exist')
      .send({ status: 'pending' })
      .expect(404);
  });
});
