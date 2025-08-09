"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountId = void 0;
class AccountId {
    constructor(value) {
        if (!this.isValid(value)) {
            throw new Error('Invalid account ID');
        }
        this.value = value;
    }
    isValid(value) {
        // Add validation logic for account ID (e.g., format, length)
        return typeof value === 'string' && value.length > 0;
    }
    getValue() {
        return this.value;
    }
}
exports.AccountId = AccountId;
