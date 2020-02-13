import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AddonModule } from '../addon/addon.module';

describe('AddonController', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AddonModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ping/health-check (GET)', () => {
    return request(app.getHttpServer())
      .get('/ping/health-check')
      .expect(200)
      .expect({ db: 'OK' });
  });
});
