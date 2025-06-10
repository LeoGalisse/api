import { HashGenerator } from 'src/domain/event/application/cryptography/hash-generator';

export class MockHashGenerator implements HashGenerator {
  async hash(plain: string): Promise<string> {
    // Simple mock implementation - just adds a prefix
    return `hashed_${plain}`;
  }
}
