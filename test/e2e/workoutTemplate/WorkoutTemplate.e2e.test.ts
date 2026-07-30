import request from 'supertest';
import { container } from '../../../src/inversify.config';
import { Application } from '../../../src/application/Application';
import { createMock, type DeepMocked } from '@golevelup/ts-jest';
import { Config } from '../../../src/application/config/Config';
import { MongoDBContainer, type StartedMongoDBContainer } from '@testcontainers/mongodb';
import { randomUUID } from 'crypto';

describe('Workout Template E2E', () => {
  let app: Application;
  let mongod: StartedMongoDBContainer;
  let config: DeepMocked<Config>;

  beforeAll(async () => {
    mongod = await new MongoDBContainer('mongo:8.3.7').withUsername('admin').withPassword('password').start();
    config = createMock<Config>();
    config.getMongoUrl.mockReturnValue(`${mongod.getConnectionString()}&directConnection=true`);
    config.getDbName.mockReturnValue('workouter_test');
    (await container.rebind<Config>(Config)).toConstantValue(config);
    app = await container.getAsync(Application);

    await app.start();
  }, 30000);

  afterAll(async () => {
    await mongod.stop();
    await app.stop();
  });

  it('should return 404 on not matching route', () => {
    return request(app.getApp()).get('/non-existent-route').expect(404);
  });

  describe('GET /workout-templates', () => {
    it('should return 200 and an empty array', async () => {
      const response = await request(app.getApp()).get(`/workout-templates?userId=${randomUUID()}`).expect(200);
      expect(response.body).toEqual([]);
    });

    it('should return 200 with an array of workout templates', async () => {
      const userId = randomUUID();
      const createResponse1 = await request(app.getApp())
        .post(`/workout-templates?userId=${userId}`)
        .send({ name: 'Workout Template 1' })
        .expect(201);
      const createResponse2 = await request(app.getApp())
        .post(`/workout-templates?userId=${userId}`)
        .send({ name: 'Workout Template 2' })
        .expect(201);

      const response = await request(app.getApp()).get(`/workout-templates?userId=${userId}`).expect(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Workout Template 1', _id: createResponse1.body._id }),
          expect.objectContaining({ name: 'Workout Template 2', _id: createResponse2.body._id }),
        ]),
      );
    });
  });
});
