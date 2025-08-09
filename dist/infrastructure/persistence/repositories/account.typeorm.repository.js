"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountTypeORMRepository = void 0;
const account_entity_1 = require("../../../domain/accounts/account.entity");
const account_orm_entity_1 = require("../entities/account.orm-entity");
class AccountTypeORMRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repository = this.dataSource.getRepository(account_orm_entity_1.AccountORMEntity);
    }
    async findById(id) {
        const accountEntity = await this.repository.findOne({ where: { id } });
        return accountEntity ? this.toDomain(accountEntity) : null;
    }
    async save(account) {
        const accountEntity = this.toORM(account);
        await this.repository.save(accountEntity);
    }
    toDomain(entity) {
        return new account_entity_1.Account(entity.id, Number(entity.balance));
    }
    toORM(account) {
        const entity = new account_orm_entity_1.AccountORMEntity();
        entity.id = account.getId();
        entity.balance = account.getBalance();
        return entity;
    }
}
exports.AccountTypeORMRepository = AccountTypeORMRepository;
