"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
class AccountController {
    constructor(transferMoneyUseCase) {
        this.transferMoneyUseCase = transferMoneyUseCase;
    }
    async transferMoney(req, res) {
        const transferMoneyDto = req.body;
        try {
            await this.transferMoneyUseCase.execute(transferMoneyDto);
            res.status(200).json({ message: 'Transfer successful' });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({ message });
        }
    }
}
exports.AccountController = AccountController;
