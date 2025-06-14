import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { z } from 'zod';
import { EnvService } from '../env/env.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

const tokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum([
    'admin',
    'organizer',
    'staff_leader',
    'staff',
    'speaker',
    'participant',
  ]),
  event: z.string(),
});

export type UserPayload = z.infer<typeof tokenPayloadSchema>;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: EnvService) {
    const publicKey = config.get('JWT_PUBLIC_KEY');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Buffer.from(publicKey, 'base64'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: UserPayload) {
    return tokenPayloadSchema.parse(payload);
  }
}
