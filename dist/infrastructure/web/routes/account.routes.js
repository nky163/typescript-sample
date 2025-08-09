"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const transfer_money_usecase_1 = require("../../../application/use-cases/transfer-money.usecase");
const account_typeorm_repository_1 = require("../../persistence/repositories/account.typeorm.repository");
const data_source_1 = __importDefault(require("../../config/data-source"));
const router = (0, express_1.Router)();
// DI 準備 (DataSource初期化後でないと実際は利用不可だが簡易化)
const repository = new account_typeorm_repository_1.AccountTypeORMRepository(data_source_1.default);
const transferMoneyUseCase = new transfer_money_usecase_1.TransferMoneyUseCase(repository);
const accountController = new account_controller_1.AccountController(transferMoneyUseCase);
router.post('/transfer', accountController.transferMoney.bind(accountController));
exports.default = router;
