import type {
  GetAccountBalanceQuery,
  GetAccountBalanceUseCase,
} from '../../port/in/getAccountBalanceUseCase';
import type { LoadAccountPort } from '../../port/out/loadAccountPort';
import type { Money } from '../model/money';

export class GetAccountBalanceService implements GetAccountBalanceUseCase {
  constructor(private readonly loadAccountPort: LoadAccountPort) {}
  async getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> {
    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const account = await this.loadAccountPort.loadAccount(query.accountId, baselineDate);
    return account.calculateBalance();
  }
}
