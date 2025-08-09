// Domain Model (buckpal style)
export class Account {
  constructor(private id: string, private balance: number = 0) {}

  getId(): string {
    return this.id;
  }
  getBalance(): number {
    return this.balance;
  }
  deposit(amount: number): void {
    if (amount <= 0) throw new Error('Deposit amount must be positive');
    this.balance += amount;
  }
  withdraw(amount: number): void {
    if (amount <= 0) throw new Error('Withdrawal amount must be positive');
    if (amount > this.balance) throw new Error('Insufficient balance');
    this.balance -= amount;
  }
}
