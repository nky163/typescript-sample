"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitAccountTable0001 = void 0;
const typeorm_1 = require("typeorm");
class InitAccountTable0001 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'accounts',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'balance',
                    type: 'decimal',
                    precision: 10,
                    scale: 2,
                    default: 0,
                },
                {
                    name: 'created_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('accounts');
    }
}
exports.InitAccountTable0001 = InitAccountTable0001;
