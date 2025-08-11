import { daysAgo } from '../../../shared/time/time';

import type {
  GetAccountBalanceQuery,
  GetAccountBalanceUseCase,
} from '../../port/in/get-account-balance-use-case';
import type { LoadAccountPort } from '../../port/out/load-account-port';
import type { Money } from '../model/money';

/**
 * アカウント残高取得ユースケース実装。
 * - baselineDate (過去10日) 以降アクティビティ差分で算出
 * - 副作用: 永続層読み取り
 * - 例外: ID 不存在時は永続層例外透過
 */
export class GetAccountBalanceService implements GetAccountBalanceUseCase {
  constructor(private readonly loadAccountPort: LoadAccountPort) {}
  async getAccountBalance(query: GetAccountBalanceQuery): Promise<Money> {
    // 過去 10 日 (長期履歴は別集計)
    const baselineDate = daysAgo(10);
    const account = await this.loadAccountPort.loadAccount(query.accountId, baselineDate);
    return account.calculateBalance();
  }
}
