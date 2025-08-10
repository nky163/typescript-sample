import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1733875200000 implements MigrationInterface {
  name = 'CreateInitialTables1733875200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE IF NOT EXISTS "account" ("id" SERIAL PRIMARY KEY)');
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "activity" (
      "id" SERIAL PRIMARY KEY,
      "timestamp" TIMESTAMPTZ NOT NULL,
      "ownerAccountId" BIGINT NOT NULL,
      "sourceAccountId" BIGINT NOT NULL,
      "targetAccountId" BIGINT NOT NULL,
      "amount" BIGINT NOT NULL
    )`);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_activity_owner ON "activity" ("ownerAccountId")',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON "activity" ("timestamp")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "activity"');
    await queryRunner.query('DROP TABLE IF EXISTS "account"');
  }
}
