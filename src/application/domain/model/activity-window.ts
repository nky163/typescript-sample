import { Money } from './money';

import type { AccountId } from './account';
import type { Activity } from './activity';

/**
 *
 */
export class ActivityWindow {
  private activities: Activity[];
  constructor(activities: Activity[] = []) {
    this.activities = [...activities];
  }
  static of(...activities: Activity[]): ActivityWindow {
    return new ActivityWindow(activities);
  }
  getStartTimestamp(): Date {
    if (!this.activities.length) throw new Error('No activities');
    return this.activities.reduce((m, a) => (a.timestamp < m.timestamp ? a : m)).timestamp;
  }
  getEndTimestamp(): Date {
    if (!this.activities.length) throw new Error('No activities');
    return this.activities.reduce((m, a) => (a.timestamp > m.timestamp ? a : m)).timestamp;
  }
  calculateBalance(accountId: AccountId): Money {
    const id = Number(accountId.value);
    const deposit = this.activities
      .filter((a) => Number(a.targetAccountId.value) === id)
      .map((a) => a.money)
      .reduce((acc, m) => Money.add(acc, m), Money.ZERO);
    const withdrawal = this.activities
      .filter((a) => Number(a.sourceAccountId.value) === id)
      .map((a) => a.money)
      .reduce((acc, m) => Money.add(acc, m), Money.ZERO);
    return Money.add(deposit, withdrawal.negate());
  }
  getActivities(): readonly Activity[] {
    return this.activities.slice();
  }
  addActivity(activity: Activity) {
    this.activities.push(activity);
  }
}
