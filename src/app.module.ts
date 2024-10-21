import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './infra/env/env';
import { EnvModule } from './infra/env/env.module';
import { AuthModule } from './infra/auth/auth.module';
import { HttpModule } from './infra/http/http.module';
import { EnvService } from './infra/env/env.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    AuthModule,
    HttpModule,
    MongooseModule.forRootAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        uri: envService.get('DATABASE_URL'),
      }),
    })
  ],
})
export class AppModule {}
