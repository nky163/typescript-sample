"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferMoneyUseCase = void 0;
class TransferMoneyUseCase {
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async execute(dto) {
        const senderAccount = await this.accountRepository.findById(dto.senderId);
        const receiverAccount = await this.accountRepository.findById(dto.receiverId);
        if (!senderAccount || !receiverAccount) {
            throw new Error('Account not found');
        }
        if (senderAccount.getBalance() < dto.amount) {
            throw new Error('Insufficient funds');
        }
        senderAccount.withdraw(dto.amount);
        receiverAccount.deposit(dto.amount);
        await this.accountRepository.save(senderAccount);
        await this.accountRepository.save(receiverAccount);
    }
}
exports.TransferMoneyUseCase = TransferMoneyUseCase;
