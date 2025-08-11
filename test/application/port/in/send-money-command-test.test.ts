import { AccountId } from '../../../../src/application/domain/model/account';
import { Money } from '../../../../src/application/domain/model/money';
import { SendMoneyCommand } from '../../../../src/application/port/in/send-money-command';

describe('SendMoneyCommandTest', () => {
  it('validationOk', () => {
    expect(
      () => new SendMoneyCommand(new AccountId(42), new AccountId(43), Money.of(10)),
    ).not.toThrow();
  });
  it('moneyValidationFails', () => {
    expect(
      () => new SendMoneyCommand(new AccountId(42), new AccountId(43), Money.of(-10)),
    ).toThrow();
  });
  it('accountIdValidationFails', () => {
    // @ts-expect-error intentional invalid targetAccountId
    expect(() => new SendMoneyCommand(new AccountId(42), null, Money.of(10))).toThrow();
  });
});
