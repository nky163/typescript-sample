import type { AccountId } from '../../../application/domain/model/account';
import type { AccountLock } from '../../../application/port/out/accountLock';

/**
 *
 */
export class NoOpAccountLock implements AccountLock {
  async lockAccount(_accountId: AccountId): Promise<void> {}
  async releaseAccount(_accountId: AccountId): Promise<void> {}
}
