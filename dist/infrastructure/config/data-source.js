"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const account_orm_entity_1 = require("../persistence/entities/account.orm-entity");
const env_1 = __importDefault(require("./env"));
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: env_1.default.DB_HOST,
    port: Number(env_1.default.DB_PORT),
    username: env_1.default.DB_USERNAME,
    password: env_1.default.DB_PASSWORD,
    database: env_1.default.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [account_orm_entity_1.AccountORMEntity],
    migrations: [],
    subscribers: [],
});
exports.default = AppDataSource;
