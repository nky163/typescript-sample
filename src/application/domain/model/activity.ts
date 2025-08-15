import { ValueObject } from './common/base-model';

import type { AccountId } from './account';
import type { Money } from './money';
/**
 *
 */
export class ActivityId extends ValueObject<'ActivityId', number> {
  constructor(value: number) {
    super(value);
  }
  protected isValid(value: number): void {
    // ActivityIdの生成に関する不変条件
    if (value <= 0) throw new Error('Invalid ActivityId');
  }

  isEqual(other: ActivityId): boolean {
    return this.value === other.value;
  }
}

/**
 *
 */
export class Activity {
  constructor(
    public readonly id: ActivityId | null,
    public readonly ownerAccountId: AccountId,
    public readonly sourceAccountId: AccountId,
    public readonly targetAccountId: AccountId,
    public readonly timestamp: Date,
    public readonly money: Money,
  ) {}
}
