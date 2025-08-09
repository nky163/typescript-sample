import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AccountPersistenceAdapter } from '../../../../src/adapter/out/persistence/AccountPersistenceAdapter';
import { AccountMapper } from '../../../../src/adapter/out/persistence/AccountMapper';
import { AccountEntity } from '../../../../src/adapter/out/persistence/entity/AccountEntity';
import { ActivityEntity } from '../../../../src/adapter/out/persistence/entity/ActivityEntity';
import { AccountId } from '../../../../src/application/domain/model/Account';
import { Money } from '../../../../src/application/domain/model/Money';
import { Activity } from '../../../../src/application/domain/model/Activity';

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USER || process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'sample_db',
    entities: [AccountEntity, ActivityEntity],
    synchronize: true,
  });
  await dataSource.initialize();
});

beforeEach(async () => {
  await dataSource.getRepository(ActivityEntity).clear();
  await dataSource.getRepository(AccountEntity).clear();
  await dataSource.getRepository(AccountEntity).save([{ id: 1 }, { id: 2 }]);
  const repo = dataSource.getRepository(ActivityEntity);
  const mk = (
    id: number,
    ts: string,
    owner: number,
    source: number,
    target: number,
    amount: number,
  ) => {
    const e = new ActivityEntity();
    e.id = id;
    e.timestamp = new Date(ts);
    e.ownerAccountId = owner;
    e.sourceAccountId = source;
    e.targetAccountId = target;
    e.amount = amount;
    return e;
  };
  await repo.save([
    mk(1, '2018-08-08T08:00:00Z', 1, 1, 2, 500),
    mk(2, '2018-08-08T08:00:00Z', 2, 1, 2, 500),
    mk(3, '2018-08-09T10:00:00Z', 1, 2, 1, 1000),
    mk(4, '2018-08-09T10:00:00Z', 2, 2, 1, 1000),
    mk(5, '2019-08-09T09:00:00Z', 1, 1, 2, 1000),
    mk(6, '2019-08-09T09:00:00Z', 2, 1, 2, 1000),
    mk(7, '2019-08-09T10:00:00Z', 1, 2, 1, 1000),
    mk(8, '2019-08-09T10:00:00Z', 2, 2, 1, 1000),
  ]);
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('AccountPersistenceAdapterTest', () => {
  it('loadsAccount', async () => {
    const adapter = new AccountPersistenceAdapter(dataSource, new AccountMapper());
    const account = await adapter.loadAccount(new AccountId(1), new Date('2018-08-10T00:00:00Z'));
    expect(account.activityWindow.getActivities().length).toBe(2); // activities after baselineDate
    expect(account.calculateBalance().getAmount()).toBe(500); // matches java test
  });

  it('updatesActivities', async () => {
    const adapter = new AccountPersistenceAdapter(dataSource, new AccountMapper());
    const acc = await adapter.loadAccount(new AccountId(1), new Date('2025-01-01T00:00:00Z'));
    acc.activityWindow.addActivity(
      new Activity(
        null,
        new AccountId(1),
        new AccountId(1),
        new AccountId(2),
        new Date(),
        Money.of(1),
      ),
    );
    await adapter.updateActivities(acc);
    const count = await dataSource.getRepository(ActivityEntity).count();
    expect(count).toBeGreaterThan(8); // new activity persisted
  });
});
