import { Activity } from '../../../src/application/domain/model/Activity';
import { ActivityWindow } from '../../../src/application/domain/model/ActivityWindow';
import { AccountId } from '../../../src/application/domain/model/Account';
import { Money } from '../../../src/application/domain/model/Money';

describe('ActivityWindow', () => {
  function startDate() {
    return new Date('2019-08-03T00:00:00Z');
  }
  function inBetweenDate() {
    return new Date('2019-08-04T00:00:00Z');
  }
  function endDate() {
    return new Date('2019-08-05T00:00:00Z');
  }

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

  it('calculates start timestamp', () => {
    const window = ActivityWindow.of(
      defaultActivity({ timestamp: startDate() }),
      defaultActivity({ timestamp: inBetweenDate() }),
      defaultActivity({ timestamp: endDate() }),
    );

    expect(window.getStartTimestamp()).toEqual(startDate());
  });

  it('calculates end timestamp', () => {
    const window = ActivityWindow.of(
      defaultActivity({ timestamp: startDate() }),
      defaultActivity({ timestamp: inBetweenDate() }),
      defaultActivity({ timestamp: endDate() }),
    );

    expect(window.getEndTimestamp()).toEqual(endDate());
  });

  it('calculates balance', () => {
    const account1 = new AccountId(1);
    const account2 = new AccountId(2);

    const window = ActivityWindow.of(
      defaultActivity({
        sourceAccountId: account1,
        targetAccountId: account2,
        money: Money.of(999),
      }),
      defaultActivity({ sourceAccountId: account1, targetAccountId: account2, money: Money.of(1) }),
      defaultActivity({
        sourceAccountId: account2,
        targetAccountId: account1,
        money: Money.of(500),
      }),
    );

    expect(window.calculateBalance(account1).getAmount()).toBe(-500);
    expect(window.calculateBalance(account2).getAmount()).toBe(500);
  });
});
