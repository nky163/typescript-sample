import type { Account, AccountId } from '../../domain/model/account';
export interface LoadAccountPort {
  loadAccount(accountId: AccountId, baselineDate: Date): Promise<Account>;
}
