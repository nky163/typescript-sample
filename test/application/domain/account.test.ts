import { Account, AccountId } from '../../../src/application/domain/model/account';
import { Activity } from '../../../src/application/domain/model/activity';
import { ActivityWindow } from '../../../src/application/domain/model/activity-window';
import { Money } from '../../../src/application/domain/model/money';

describe('Account', () => {
  function defaultActivity(overrides?: Partial<Activity>): Activity {
    const owner = overrides?.ownerAccountId ?? new AccountId(1);
    return new Activity(
      overrides?.id ?? null,
      owner,
      overrides?.sourceAccountId ?? new AccountId(99),
      overrides?.targetAccountId ?? owner,
      overrides?.timestamp ?? new Date(),
      overrides?.money ?? Money.of(1),
    );
  }

  function createAccountWithTwoDeposits(): { account: Account; accountId: AccountId } {
    const accountId = new AccountId(1);
    const window = new ActivityWindow([
      defaultActivity({
        targetAccountId: accountId,
        money: Money.of(999),
        ownerAccountId: accountId,
        sourceAccountId: new AccountId(50),
      }),
      defaultActivity({
        targetAccountId: accountId,
        money: Money.of(1),
        ownerAccountId: accountId,
        sourceAccountId: new AccountId(60),
      }),
    ]);
    const account = Account.withId(accountId, Money.of(555), window);
    return { account, accountId };
  }

  it('calculates balance', () => {
    const { account } = createAccountWithTwoDeposits();
    expect(account.calculateBalance().getAmount()).toBe(1555); // 555 + 999 + 1
  });

  it('withdrawal succeeds', () => {
    const { account } = createAccountWithTwoDeposits();
    const randomTargetAccount = new AccountId(99);
    const success = account.withdraw(Money.of(555), randomTargetAccount);
    expect(success).toBe(true);
    expect(account.activityWindow.getActivities().length).toBe(3);
    expect(account.calculateBalance().getAmount()).toBe(1000); // 1555 - 555
  });

  it('withdrawal failure (insufficient funds)', () => {
    const { account } = createAccountWithTwoDeposits();
    const success = account.withdraw(Money.of(1556), new AccountId(99));
    expect(success).toBe(false);
    expect(account.activityWindow.getActivities().length).toBe(2);
    expect(account.calculateBalance().getAmount()).toBe(1555);
  });

  it('deposit success', () => {
    const { account } = createAccountWithTwoDeposits();
    const success = account.deposit(Money.of(445), new AccountId(99));
    expect(success).toBe(true);
    expect(account.activityWindow.getActivities().length).toBe(3);
    expect(account.calculateBalance().getAmount()).toBe(2000); // 1555 + 445
  });
});
