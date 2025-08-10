import type { AccountId } from '../../domain/model/account';
import type { Money } from '../../domain/model/money';

export interface GetAccountBalanceUseCase {
  getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> | Money;
}

export class GetAccountBalanceQuery {
  constructor(public readonly accountId: AccountId) {
    if (!accountId) throw new Error('accountId required');
  }
}
