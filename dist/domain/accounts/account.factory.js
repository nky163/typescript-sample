"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountFactory = void 0;
class AccountFactory {
    static createAccount(id, initialBalance) {
        // Logic to create a new account instance
        return {
            id,
            balance: initialBalance,
            deposit(amount) {
                this.balance += amount;
            },
            withdraw(amount) {
                if (amount > this.balance) {
                    throw new Error('Insufficient funds');
                }
                this.balance -= amount;
            },
        };
    }
}
exports.AccountFactory = AccountFactory;
