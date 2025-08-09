import { SendMoneyService } from '../../../src/application/domain/service/SendMoneyService';
import { MoneyTransferProperties } from '../../../src/application/domain/service/MoneyTransferProperties';
import { ThresholdExceededException } from '../../../src/application/domain/service/ThresholdExceededException';
import { SendMoneyCommand } from '../../../src/application/port/in/SendMoneyCommand';
import { Account, AccountId } from '../../../src/application/domain/model/Account';
import { ActivityWindow } from '../../../src/application/domain/model/ActivityWindow';
import { Money } from '../../../src/application/domain/model/Money';
import { LoadAccountPort } from '../../../src/application/port/out/LoadAccountPort';
import { UpdateAccountStatePort } from '../../../src/application/port/out/UpdateAccountStatePort';
import { AccountLock } from '../../../src/application/port/out/AccountLock';

class InMemoryAccountLock implements AccountLock {
  locked: AccountId[] = [];
  async lockAccount(accountId: AccountId): Promise<void> {
    this.locked.push(accountId);
  }
  async releaseAccount(accountId: AccountId): Promise<void> {
    this.locked = this.locked.filter((a) => a.value !== accountId.value);
  }
}

class StubPersistence implements LoadAccountPort, UpdateAccountStatePort {
  constructor(private accounts: Record<number, Account>) {}
  async loadAccount(id: AccountId, _baselineDate: Date): Promise<Account> {
    return this.accounts[id.value];
  }
  async updateActivities(): Promise<void> {
    /* noop */
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
