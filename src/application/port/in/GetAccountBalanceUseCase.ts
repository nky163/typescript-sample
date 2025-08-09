import { Money } from '../../domain/model/Money';
import { AccountId } from '../../domain/model/Account';

export interface GetAccountBalanceUseCase {
  getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> | Money;
}

export class GetAccountBalanceQuery {
  constructor(public readonly accountId: AccountId) {
    if (!accountId) throw new Error('accountId required');
  }
}
