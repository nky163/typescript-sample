import type { AccountId } from '../../application/domain/model/account';

export interface AccountLock {
  lockAccount(accountId: AccountId): Promise<void> | void;
  releaseAccount(accountId: AccountId): Promise<void> | void;
}
