import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Config } from '../../../src/application/config/Config';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { Application } from '../../../src/application/Application';
import { container } from '../../../src/inversify.config';
import request from 'supertest';
import { randomUUID } from 'crypto';

describe('Workout Schedule E2E', () => {
  let app: Application;
  let mongod: StartedMongoDBContainer;
  let config: DeepMocked<Config>;

  beforeAll(async () => {
    mongod = await new MongoDBContainer('mongo:8.3.7').withUsername('admin').withPassword('password').start();
    config = createMock<Config>();
    config.getMongoUrl.mockReturnValue(`${mongod.getConnectionString()}&directConnection=true`);
    config.getDbName.mockReturnValue('workouter_test');

    await container.rebind<Config>(Config).toConstantValue(config);
    app = await container.getAsync(Application);
    await app.start();
  }, 30000);

  afterAll(async () => {
    await app.stop();
    await mongod.stop();
  });

  it('should return 404 on not matching route', () => {
    return request(app.getApp()).get('/non-existent-route').expect(404);
  });

  describe('POST /workout-schedules', () => {
    it('should return 201 and create new workout schedule when provided correct data', async () => {
      const userId = randomUUID();

      const response = await request(app.getApp())
        .post(`/workout-schedules?userId=${userId}`)
        .send({ name: 'Test Workout Schedule' })
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: 'Test Workout Schedule',
        isActive: false,
        setActiveDate: null,
        userId: userId,
        pattern: [],
        lastOrder: null,
        lastFinishedWorkoutDate: null,
      });
    });
  });
});
