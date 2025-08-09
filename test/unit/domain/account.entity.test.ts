import { Account } from '../../../src/domain/accounts/account.entity';

describe('Account Entity', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account('1', 100);
  });

  it('should create an account with the given id and balance', () => {
    expect(account.getId()).toBe('1');
    expect(account.getBalance()).toBe(100);
  });

  it('should deposit money to the account', () => {
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  it('should withdraw money from the account', () => {
    account.withdraw(30);
    expect(account.getBalance()).toBe(70);
  });

  it('should not withdraw more than the balance', () => {
    expect(() => account.withdraw(200)).toThrow('Insufficient balance');
  });
});
