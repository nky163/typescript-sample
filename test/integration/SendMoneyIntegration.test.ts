import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AccountEntity } from '../../src/adapter/out/persistence/entity/AccountEntity';
import { ActivityEntity } from '../../src/adapter/out/persistence/entity/ActivityEntity';
import { AccountMapper } from '../../src/adapter/out/persistence/AccountMapper';
import { AccountPersistenceAdapter } from '../../src/adapter/out/persistence/AccountPersistenceAdapter';
import { NoOpAccountLock } from '../../src/adapter/out/persistence/NoOpAccountLock';
import { MoneyTransferProperties } from '../../src/application/domain/service/MoneyTransferProperties';
import { SendMoneyService } from '../../src/application/domain/service/SendMoneyService';
import { SendMoneyCommand } from '../../src/application/port/in/SendMoneyCommand';
import { AccountId } from '../../src/application/domain/model/Account';
import { Money } from '../../src/application/domain/model/Money';
import { Client } from 'pg';

let dataSource: DataSource;

beforeAll(async () => {
  const dbName = (process.env.DB_NAME || 'sample_db') + '_it';
  // DB 作成 (存在しない場合)
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: 'postgres',
  });
  await adminClient.connect();
  const result = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (result.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE "${dbName}"`);
  }
  await adminClient.end();

  dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: dbName,
    entities: [AccountEntity, ActivityEntity],
    synchronize: true,
    name: 'integration',
  });
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('SendMoney integration (persistence adapter + service)', () => {
  beforeEach(async () => {
    // 完全クリア
    await dataSource.getRepository(ActivityEntity).clear();
    await dataSource.getRepository(AccountEntity).clear();
    // アカウント作成
    await dataSource.getRepository(AccountEntity).save([{ id: 100 }, { id: 200 }]);
    // ベースライン(10日前よりさらに1日前=11日前)の入金 (ウィンドウには含まれない, baselineBalance に反映)
    const baselineDeposit = new ActivityEntity();
    baselineDeposit.timestamp = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000);
    baselineDeposit.ownerAccountId = 100;
    baselineDeposit.sourceAccountId = 999;
    baselineDeposit.targetAccountId = 100;
    baselineDeposit.amount = 1000;
    await dataSource.getRepository(ActivityEntity).save(baselineDeposit);
  });

  it('persists activities and updates balances', async () => {
    const mapper = new AccountMapper();
    const adapter = new AccountPersistenceAdapter(dataSource, mapper);
    const lock = new NoOpAccountLock();
    const service = new SendMoneyService(
      adapter,
      lock,
      adapter,
      new MoneyTransferProperties(Money.of(10_000)),
    );

    const sourceId = new AccountId(100);
    const targetId = new AccountId(200);

    const command = new SendMoneyCommand(sourceId, targetId, Money.of(500));
    const result = await service.sendMoney(command);
    expect(result).toBe(true);

    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    const sourceAccount = await adapter.loadAccount(sourceId, baselineDate);
    const targetAccount = await adapter.loadAccount(targetId, baselineDate);

    expect(sourceAccount.calculateBalance().getAmount()).toBe(500);
    expect(targetAccount.calculateBalance().getAmount()).toBe(500);

    const activities = await dataSource.getRepository(ActivityEntity).find();
    expect(activities.length).toBe(3);
    expect(sourceAccount.activityWindow.getActivities().length).toBe(1);
  });
});
