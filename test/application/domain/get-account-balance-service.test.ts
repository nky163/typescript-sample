import { Account, AccountId } from '../../../src/application/domain/model/account';
import { Activity } from '../../../src/application/domain/model/activity';
import { ActivityWindow } from '../../../src/application/domain/model/activity-window';
import { Money } from '../../../src/application/domain/model/money';
import { GetAccountBalanceService } from '../../../src/application/domain/service/get-account-balance-service';
import { GetAccountBalanceQuery } from '../../../src/application/port/in/get-account-balance-use-case';

import type { LoadAccountPort } from '../../../src/application/port/out/load-account-port';

class InMemoryLoadAccountPort implements LoadAccountPort {
  constructor(private account: Account) {}
  loadAccount(_accountId: AccountId, _baselineDate: Date): Promise<Account> {
    return Promise.resolve(this.account);
  }
}

describe('GetAccountBalanceService', () => {
  it('returns calculated balance', async () => {
    const accountId = new AccountId(10);
    const account = Account.withId(
      accountId,
      Money.of(100),
      new ActivityWindow([
        new Activity(null, accountId, accountId, new AccountId(99), new Date(), Money.of(50)), // withdrawal
        new Activity(null, accountId, new AccountId(88), accountId, new Date(), Money.of(200)), // deposit
      ]),
    );

    const service = new GetAccountBalanceService(new InMemoryLoadAccountPort(account));
    const balance = await service.getAccountBalance(new GetAccountBalanceQuery(accountId));
    expect(balance.getAmount()).toBe(250); // 100 - 50 + 200
  });
});
