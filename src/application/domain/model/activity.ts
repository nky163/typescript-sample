import type { AccountId } from './account';
import type { Money } from './money';

export class ActivityId {
  constructor(public readonly value: number) {}
}

export class Activity {
  constructor(
    public readonly id: ActivityId | null,
    public readonly ownerAccountId: AccountId,
    public readonly sourceAccountId: AccountId,
    public readonly targetAccountId: AccountId,
    public readonly timestamp: Date,
    public readonly money: Money,
  ) {}

  static withoutId(
    ownerAccountId: AccountId,
    sourceAccountId: AccountId,
    targetAccountId: AccountId,
    timestamp: Date,
    money: Money,
  ): Activity {
    return new Activity(null, ownerAccountId, sourceAccountId, targetAccountId, timestamp, money);
  }
}
