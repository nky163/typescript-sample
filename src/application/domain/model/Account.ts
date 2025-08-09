import { Money } from './Money';
import { Activity } from './Activity';
import { ActivityWindow } from './ActivityWindow';

export class AccountId {
  constructor(public readonly value: number) {}
}

export class Account {
  private constructor(
    private readonly id: AccountId | null,
    public readonly baselineBalance: Money,
    public readonly activityWindow: ActivityWindow,
  ) {}

  static withoutId(baselineBalance: Money, activityWindow: ActivityWindow) {
    return new Account(null, baselineBalance, activityWindow);
  }

  static withId(accountId: AccountId, baselineBalance: Money, activityWindow: ActivityWindow) {
    return new Account(accountId, baselineBalance, activityWindow);
  }

  getId(): AccountId | null {
    return this.id;
  }

  calculateBalance(): Money {
    if (!this.id) throw new Error('Account id required for balance');
    return Money.add(this.baselineBalance, this.activityWindow.calculateBalance(this.id));
  }

  withdraw(money: Money, targetAccountId: AccountId): boolean {
    if (!this.id) throw new Error('Account id required');
    if (!this.mayWithdraw(money)) return false;
    const withdrawal = new Activity(null, this.id, this.id, targetAccountId, new Date(), money);
    this.activityWindow.addActivity(withdrawal);
    return true;
  }

  private mayWithdraw(money: Money): boolean {
    return Money.add(this.calculateBalance(), money.negate()).isPositiveOrZero();
  }

  deposit(money: Money, sourceAccountId: AccountId): boolean {
    if (!this.id) throw new Error('Account id required');
    const deposit = new Activity(null, this.id, sourceAccountId, this.id, new Date(), money);
    this.activityWindow.addActivity(deposit);
    return true;
  }
}
