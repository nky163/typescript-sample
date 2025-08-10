import type {
  GetAccountBalanceQuery,
  GetAccountBalanceUseCase,
} from '../../port/in/get-account-balance-use-case';
import type { LoadAccountPort } from '../../port/out/load-account-port';
import type { Money } from '../model/money';

export class GetAccountBalanceService implements GetAccountBalanceUseCase {
  constructor(private readonly loadAccountPort: LoadAccountPort) {}

  async getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> {
    // Align baseline window with SendMoneyService
    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const account = await this.loadAccountPort.loadAccount(query.accountId, baselineDate);
    return account.calculateBalance();
  }
}
