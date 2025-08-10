import { Money } from '../model/money';

export class MoneyTransferProperties {
  constructor(public maximumTransferThreshold: Money = Money.of(1_000_000)) {}
}
