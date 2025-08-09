import { AccountLock } from '../../../application/port/out/AccountLock';
import { AccountId } from '../../../application/domain/model/Account';

export class NoOpAccountLock implements AccountLock {
  async lockAccount(_accountId: AccountId): Promise<void> {
    // no-op
  }
  async releaseAccount(_accountId: AccountId): Promise<void> {
    // no-op
  }
}
