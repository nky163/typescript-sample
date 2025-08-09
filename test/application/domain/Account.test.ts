import { Account, AccountId } from '../../../src/application/domain/model/Account';
import { Activity } from '../../../src/application/domain/model/Activity';
import { ActivityWindow } from '../../../src/application/domain/model/ActivityWindow';
import { Money } from '../../../src/application/domain/model/Money';

describe('Account', () => {
  function defaultActivity(overrides?: Partial<Activity>): Activity {
    return new Activity(
      overrides?.id ?? null,
      overrides?.ownerAccountId ?? new AccountId(42),
      overrides?.sourceAccountId ?? new AccountId(42),
      overrides?.targetAccountId ?? new AccountId(41),
      overrides?.timestamp ?? new Date(),
      overrides?.money ?? Money.of(999),
    );
  }

  it('calculates balance', () => {
    const accountId = new AccountId(1);
    const account = Account.withId(
      accountId,
      Money.of(555),
      new ActivityWindow([
        defaultActivity({ targetAccountId: accountId, money: Money.of(999) }),
        defaultActivity({ targetAccountId: accountId, money: Money.of(1) }),
      ]),
    );

    const balance = account.calculateBalance();
    expect(balance.getAmount()).toBe(1555);
  });

  it('withdrawal succeeds', () => {
    const accountId = new AccountId(1);
    const account = Account.withId(
      accountId,
      Money.of(555),
      new ActivityWindow([
        defaultActivity({ targetAccountId: accountId, money: Money.of(999) }),
        defaultActivity({ targetAccountId: accountId, money: Money.of(1) }),
      ]),
    );

    const randomTargetAccount = new AccountId(99);
    const success = account.withdraw(Money.of(555), randomTargetAccount);

    expect(success).toBe(true);
    expect(account.activityWindow.getActivities().length).toBe(3);
    expect(account.calculateBalance().getAmount()).toBe(1000);
  });

  it('withdrawal failure', () => {
    const accountId = new AccountId(1);
    const account = Account.withId(
      accountId,
      Money.of(555),
      new ActivityWindow([
        defaultActivity({ targetAccountId: accountId, money: Money.of(999) }),
        defaultActivity({ targetAccountId: accountId, money: Money.of(1) }),
      ]),
    );

    const success = account.withdraw(Money.of(1556), new AccountId(99));

    expect(success).toBe(false);
    expect(account.activityWindow.getActivities().length).toBe(2);
    expect(account.calculateBalance().getAmount()).toBe(1555);
  });

  it('deposit success', () => {
    const accountId = new AccountId(1);
    const account = Account.withId(
      accountId,
      Money.of(555),
      new ActivityWindow([
        defaultActivity({ targetAccountId: accountId, money: Money.of(999) }),
        defaultActivity({ targetAccountId: accountId, money: Money.of(1) }),
      ]),
    );

    const success = account.deposit(Money.of(445), new AccountId(99));

    expect(success).toBe(true);
    expect(account.activityWindow.getActivities().length).toBe(3);
    expect(account.calculateBalance().getAmount()).toBe(2000);
  });
});
