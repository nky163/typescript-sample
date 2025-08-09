"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferMoneyDTO = void 0;
class TransferMoneyDTO {
    constructor(senderId, receiverId, amount) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.amount = amount;
    }
}
exports.TransferMoneyDTO = TransferMoneyDTO;
