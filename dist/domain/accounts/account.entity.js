"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account = void 0;
class Account {
    constructor(id, balance = 0) {
        this.id = id;
        this.balance = balance;
    }
    getId() {
        return this.id;
    }
    getBalance() {
        return this.balance;
    }
    deposit(amount) {
        if (amount <= 0) {
            throw new Error("Deposit amount must be positive");
        }
        this.balance += amount;
    }
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error("Withdrawal amount must be positive");
        }
        if (amount > this.balance) {
            throw new Error("Insufficient balance");
        }
        this.balance -= amount;
    }
}
exports.Account = Account;
