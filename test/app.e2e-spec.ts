import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/api/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.timestamp).toBeDefined();
        });
    });
  });

  describe('Auth', () => {
    it('/api/auth/login (POST) - should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'invalid@test.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('/api/auth/signup (POST) - should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/signup')
        .send({ email: 'invalid-email', password: 'password123', roleId: 1 })
        .expect(400);
    });
  });

  describe('Users', () => {
    it('/api/users (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(401);
    });
  });
});
