import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Encrypter } from 'src/domain/event/application/cryptography/encrypter'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwrService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwrService.signAsync(payload)
  }
}
