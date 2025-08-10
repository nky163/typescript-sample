import { Money } from './money';

import type { AccountId } from './account';
import type { Activity } from './activity';

export class ActivityWindow {
  private activities: Activity[];

  constructor(activities: Activity[] = []) {
    this.activities = [...activities];
  }

  static of(...activities: Activity[]): ActivityWindow {
    return new ActivityWindow(activities);
  }

  getStartTimestamp(): Date {
    if (this.activities.length === 0) throw new Error('No activities');
    return this.activities.reduce((min, a) => (a.timestamp < min.timestamp ? a : min)).timestamp;
  }

  getEndTimestamp(): Date {
    if (this.activities.length === 0) throw new Error('No activities');
    return this.activities.reduce((max, a) => (a.timestamp > max.timestamp ? a : max)).timestamp;
  }

  calculateBalance(accountId: AccountId): Money {
    const accountIdValue = Number(accountId.value);
    const depositBalance = this.activities
      .filter((a) => Number(a.targetAccountId.value) === accountIdValue)
      .map((a) => a.money)
      .reduce((acc, m) => Money.add(acc, m), Money.ZERO);

    const withdrawalBalance = this.activities
      .filter((a) => Number(a.sourceAccountId.value) === accountIdValue)
      .map((a) => a.money)
      .reduce((acc, m) => Money.add(acc, m), Money.ZERO);

    return Money.add(depositBalance, withdrawalBalance.negate());
  }

  getActivities(): readonly Activity[] {
    return this.activities.slice();
  }

  addActivity(activity: Activity) {
    this.activities.push(activity);
  }
}
