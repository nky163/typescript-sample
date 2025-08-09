import { Decimal } from 'decimal.js';

export class Money {
  public static ZERO = Money.of(0);

  private constructor(private readonly amount: Decimal) {}

  static of(value: number | string | Decimal): Money {
    return new Money(new Decimal(value));
  }

  getAmount(): number {
    return this.amount.toNumber();
  }

  isPositiveOrZero(): boolean {
    return this.amount.greaterThanOrEqualTo(0);
  }
  isNegative(): boolean {
    return this.amount.lessThan(0);
  }
  isPositive(): boolean {
    return this.amount.greaterThan(0);
  }
  isGreaterThanOrEqualTo(other: Money): boolean {
    return this.amount.greaterThanOrEqualTo(other.amount);
  }
  isGreaterThan(other: Money): boolean {
    return this.amount.greaterThan(other.amount);
  }

  static add(a: Money, b: Money): Money {
    return new Money(a.amount.plus(b.amount));
  }
  static subtract(a: Money, b: Money): Money {
    return new Money(a.amount.minus(b.amount));
  }

  plus(money: Money): Money {
    return new Money(this.amount.plus(money.amount));
  }
  minus(money: Money): Money {
    return new Money(this.amount.minus(money.amount));
  }
  negate(): Money {
    return new Money(this.amount.negated());
  }

  toString(): string {
    return this.amount.toString();
  }
}
