import { GetAccountBalanceService } from '../../../src/application/domain/service/GetAccountBalanceService';
import { GetAccountBalanceQuery } from '../../../src/application/port/in/GetAccountBalanceUseCase';
import { Account, AccountId } from '../../../src/application/domain/model/Account';
import { ActivityWindow } from '../../../src/application/domain/model/ActivityWindow';
import { Money } from '../../../src/application/domain/model/Money';
import { Activity } from '../../../src/application/domain/model/Activity';
import { LoadAccountPort } from '../../../src/application/port/out/LoadAccountPort';

class InMemoryLoadAccountPort implements LoadAccountPort {
  constructor(private account: Account) {}
  async loadAccount(_accountId: AccountId, _baselineDate: Date): Promise<Account> {
    return this.account;
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
