import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsModule } from './events.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { EnvModule } from 'src/infra/env/env.module';
import { EnvService } from 'src/infra/env/env.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/infra/env/env';
import { Connection } from 'mongoose';

describe('Create Event (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (env) => envSchema.parse(env),
          isGlobal: true,
        }),
        EventsModule,
        EnvModule,
        MongooseModule.forRootAsync({
          imports: [EnvModule],
          inject: [EnvService],
          useFactory: (envService: EnvService) => {
            const baseUri = envService.get('DATABASE_URL_TEST');
            const testDatabaseName = `test-${Date.now()}`;
            const updatedUri = baseUri.replace(
              /\/([^/?]+)(\?|$)/,
              `/${testDatabaseName}$2`,
            );

            return {
              uri: updatedUri,
            };
          },
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  beforeEach(async () => {
    const collections = await connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => await Promise.all([app.close(), connection.close()]));

  it('should create an event', async () => {
    const body = {
      name: 'Event',
      description: 'Event Description',
      location: 'Event Location',
      capacity: 100,
      registrationStartDate: '2022-01-01T00:00:00.000Z',
      registrationEndDate: '2022-01-02T00:00:00.000Z',
      startDate: '2022-01-03T00:00:00.000Z',
      endDate: '2022-01-04T00:00:00.000Z',
    };

    const response = await request(app.getHttpServer())
      .post('/event')
      .send(body)
      .expect(201);

    expect(response.body.event).toMatchObject({
      name: body.name,
      description: body.description,
      location: body.location,
      capacity: body.capacity,
      registrationStartDate: body.registrationStartDate,
      registrationEndDate: body.registrationEndDate,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    expect(response.body.event).toHaveProperty('_id');
    expect(response.body.event).toHaveProperty('createdAt');
    expect(response.body.event).toHaveProperty('updatedAt');
  });

  it('should not create an event with the same name', async () => {
    const body = {
      name: 'Event',
      description: 'Event Description',
      location: 'Event Location',
      capacity: 100,
      registrationStartDate: '2022-01-01T00:00:00.000Z',
      registrationEndDate: '2022-01-02T00:00:00.000Z',
      startDate: '2022-01-03T00:00:00.000Z',
      endDate: '2022-01-04T00:00:00.000Z',
    };

    await request(app.getHttpServer()).post('/event').send(body).expect(201);

    const response = await request(app.getHttpServer())
      .post('/event')
      .send(body)
      .expect(400);

    expect(response.body.message).toBe(
      'There is already an event with the name provided.',
    );
  });
});
