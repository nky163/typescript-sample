import { Account, AccountId } from '../../domain/model/Account';

export interface LoadAccountPort {
  loadAccount(accountId: AccountId, baselineDate: Date): Promise<Account>;
}
