import {
  GetAccountBalanceQuery,
  GetAccountBalanceUseCase,
} from '../../port/in/GetAccountBalanceUseCase';
import { LoadAccountPort } from '../../port/out/LoadAccountPort';
import { Money } from '../model/Money';

export class GetAccountBalanceService implements GetAccountBalanceUseCase {
  constructor(private readonly loadAccountPort: LoadAccountPort) {}

  async getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> {
    // Align baseline window with SendMoneyService
    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const account = await this.loadAccountPort.loadAccount(query.accountId, baselineDate);
    return account.calculateBalance();
  }
}
