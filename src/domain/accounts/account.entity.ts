export class Account {
  private id: string;
  private balance: number;

  constructor(id: string, balance = 0) {
    this.id = id;
    this.balance = balance;
  }

  public getId(): string {
    return this.id;
  }

  public getBalance(): number {
    return this.balance;
  }

  public deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
  }

  public withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (amount > this.balance) {
      throw new Error('Insufficient balance');
    }
    this.balance -= amount;
  }
}
