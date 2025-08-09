import { Money } from '../model/Money';

export class MoneyTransferProperties {
  constructor(public maximumTransferThreshold: Money = Money.of(1_000_000)) {}
}
