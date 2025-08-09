import { Account } from '../../../src/domain/accounts/account.entity';

describe('Accountエンティティ', () => {
  let account: Account;

  beforeEach(() => {
    account = new Account('1', 100);
  });

  it('指定したIDと残高でアカウントを生成できる', () => {
    expect(account.getId()).toBe('1');
    expect(account.getBalance()).toBe(100);
  });

  it('入金できる', () => {
    account.deposit(50);
    expect(account.getBalance()).toBe(150);
  });

  it('出金できる', () => {
    account.withdraw(30);
    expect(account.getBalance()).toBe(70);
  });

  it('残高を超える出金はエラーになる', () => {
    expect(() => account.withdraw(200)).toThrow('Insufficient balance');
  });
});
