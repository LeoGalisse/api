import { Module } from '@nestjs/common'
import { BcryptHasher } from './bcrypt-hasher'
import { JwtEncrypter } from './jwt-encrypter'
import { Encrypter } from 'src/domain/event/application/cryptography/encrypter'
import { HashComparer } from 'src/domain/event/application/cryptography/hash-comparer'
import { HashGenerator } from 'src/domain/event/application/cryptography/hash-generator'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
