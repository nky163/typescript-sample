import type { AccountId } from '../../../application/domain/model/account';
import type { AccountLock } from '../../../application/port/out/account-lock';

export class NoOpAccountLock implements AccountLock {
  async lockAccount(_accountId: AccountId): Promise<void> {
    // no-op
  }
  async releaseAccount(_accountId: AccountId): Promise<void> {
    // no-op
  }
}
