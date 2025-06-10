import { Encrypter } from 'src/domain/event/application/cryptography/encrypter';

export class MockEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    // Simple mock implementation - just stringify and encode
    return `token_${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
  }
}
