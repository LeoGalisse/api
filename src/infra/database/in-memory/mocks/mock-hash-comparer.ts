import { HashComparer } from 'src/domain/event/application/cryptography/hash-comparer';

export class MockHashComparer implements HashComparer {
  async compare(plain: string, hash: string): Promise<boolean> {
    // Simple mock implementation - check if hash is "hashed_" + plain
    return hash === `hashed_${plain}`;
  }
}
