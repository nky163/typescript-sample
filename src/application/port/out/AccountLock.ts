import { AccountId } from '../../application/domain/model/Account';

export interface AccountLock {
  lockAccount(accountId: AccountId): Promise<void> | void;
  releaseAccount(accountId: AccountId): Promise<void> | void;
}
