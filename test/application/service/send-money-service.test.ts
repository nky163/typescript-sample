import { Account, AccountId } from '../../../src/application/domain/model/account';
import { ActivityWindow } from '../../../src/application/domain/model/activity-window';
import { Money } from '../../../src/application/domain/model/money';
import { MoneyTransferProperties } from '../../../src/application/domain/service/money-transfer-properties';
import { SendMoneyService } from '../../../src/application/domain/service/send-money-service';
import { ThresholdExceededException } from '../../../src/application/domain/service/threshold-exceeded-exception';
import { SendMoneyCommand } from '../../../src/application/port/in/send-money-command';

import type { AccountLock } from '../../../src/application/port/out/account-lock';
import type { LoadAccountPort } from '../../../src/application/port/out/load-account-port';
import type { UpdateAccountStatePort } from '../../../src/application/port/out/update-account-state-port';

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
