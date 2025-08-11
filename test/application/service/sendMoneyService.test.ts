import { Account, AccountId } from '../../../src/application/domain/model/account';
import { ActivityWindow } from '../../../src/application/domain/model/activityWindow';
import { Money } from '../../../src/application/domain/model/money';
import { MoneyTransferProperties } from '../../../src/application/domain/service/moneyTransferProperties';
import { SendMoneyService } from '../../../src/application/domain/service/sendMoneyService';
import { ThresholdExceededException } from '../../../src/application/domain/service/thresholdExceededException';
import { SendMoneyCommand } from '../../../src/application/port/in/sendMoneyCommand';

import type { AccountLock } from '../../../src/application/port/out/accountLock';
import type { LoadAccountPort } from '../../../src/application/port/out/loadAccountPort';
import type { UpdateAccountStatePort } from '../../../src/application/port/out/updateAccountStatePort';

class InMemoryAccountLock implements AccountLock {
  locked: AccountId[] = [];
  lockAccount(accountId: AccountId): Promise<void> {
    this.locked.push(accountId);
    return Promise.resolve();
  }
  releaseAccount(accountId: AccountId): Promise<void> {
    this.locked = this.locked.filter((a) => a.value !== accountId.value);
    return Promise.resolve();
  }
}

class StubPersistence implements LoadAccountPort, UpdateAccountStatePort {
  constructor(private accounts: Record<number, Account>) {}
  loadAccount(id: AccountId, _baselineDate: Date): Promise<Account> {
    return Promise.resolve(this.accounts[id.value]);
  }
  updateActivities(): Promise<void> {
    return Promise.resolve();
  }
}

function newAccount(id: number, balance: number): Account {
  return Account.withId(new AccountId(id), Money.of(balance), new ActivityWindow([]));
}

describe('SendMoneyService (unit)', () => {
  it('transfers money between accounts', async () => {
    const source = newAccount(1, 500);
    const target = newAccount(2, 100);
    const persistence = new StubPersistence({ 1: source, 2: target });
    const lock = new InMemoryAccountLock();
    const service = new SendMoneyService(
      persistence,
      lock,
      persistence,
      new MoneyTransferProperties(Money.of(1000)),
    );

    const result = await service.sendMoney(
      new SendMoneyCommand(source.getId()!, target.getId()!, Money.of(200)),
    );

    expect(result).toBe(true);
    expect(source.calculateBalance().getAmount()).toBe(300);
    expect(target.calculateBalance().getAmount()).toBe(300);
  });

  it('fails when threshold exceeded', async () => {
    const source = newAccount(1, 5000);
    const target = newAccount(2, 0);
    const persistence = new StubPersistence({ 1: source, 2: target });
    const lock = new InMemoryAccountLock();
    const service = new SendMoneyService(
      persistence,
      lock,
      persistence,
      new MoneyTransferProperties(Money.of(100)),
    );

    await expect(
      service.sendMoney(new SendMoneyCommand(source.getId()!, target.getId()!, Money.of(101))),
    ).rejects.toBeInstanceOf(ThresholdExceededException);
  });
});
