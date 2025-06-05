import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { EnvModule } from 'src/infra/env/env.module';
import { EnvService } from 'src/infra/env/env.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from 'src/infra/env/env';
import { Connection } from 'mongoose';
import { LecturesModule } from './lectures.module';
import { VenuesModule } from '../venues/venues.module';
import { AuthModule } from 'src/infra/auth/auth.module';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

describe('Create Lecture (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validate: (env) => envSchema.parse(env),
          isGlobal: true,
        }),
        LecturesModule,
        VenuesModule,
        EventsModule,
        EnvModule,
        AuthModule,
        UsersModule,
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

            console.log(updatedUri);

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

  it('should create a lecture', async () => {
    const event = {
      name: 'Event',
      description: 'Event Description',
      location: 'Event Location',
      capacity: 100,
      registrationStartDate: '2022-01-01T00:00:00.000Z',
      registrationEndDate: '2022-01-02T00:00:00.000Z',
      startDate: '2022-01-03T00:00:00.000Z',
      endDate: '2022-01-04T00:00:00.000Z',
    };

    const createdEvent = await request(app.getHttpServer())
      .post('/event')
      .send(event)
      .expect(201);

    const user = {
      username: 'User',
      email: 'user@email.com',
      password: 'password',
      event: createdEvent.body.event._id,
      role: 'admin',
    };

    await request(app.getHttpServer()).post('/register').send(user).expect(201);

    const auth = await request(app.getHttpServer())
      .post('/sessions')
      .send({ email: user.email, password: user.password })
      .expect(201);

    const venue = {
      name: 'Venue',
      address: 'Venue Location',
      capacity: '100',
    };

    const venueResponse = await request(app.getHttpServer())
      .post('/venue')
      .auth(auth.body.accessToken, { type: 'bearer' })
      .send(venue)
      .expect(201);

    const body = {
      name: 'Lecture',
      description: 'Lecture Description',
      venue: venueResponse.body.venue._id,
      capacity: '100',
      startDate: '2022-01-01T00:00:00.000Z',
      endDate: '2022-01-02T00:00:00.000Z',
    };

    const response = await request(app.getHttpServer())
      .post('/lecture')
      .auth(auth.body.accessToken, { type: 'bearer' })
      .send(body)
      .expect(201);

    expect(response.body.lecture).toMatchObject({
      name: body.name,
      description: body.description,
      venue: body.venue,
      capacity: Number(body.capacity),
      startDate: body.startDate,
      endDate: body.endDate,
    });

    expect(response.body.lecture).toHaveProperty('_id');
    expect(response.body.lecture).toHaveProperty('createdAt');
    expect(response.body.lecture).toHaveProperty('updatedAt');
  });
});
