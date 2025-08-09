import { initDataSource } from '../src/shared/config/data-source';
import { logger } from '../src/shared/logging/logger';
import { AccountORMEntity } from '../src/adapter/out/persistence/entities/account.orm-entity';

const seedDatabase = async () => {
  const ds = await initDataSource();

  const accountRepository = ds.getRepository(AccountORMEntity);

  const accounts = [{ balance: 1000 }, { balance: 2000 }, { balance: 3000 }];

  await accountRepository.save(accounts.map((a) => accountRepository.create(a)));

  logger.info('Database seeded with initial accounts');

  await ds.destroy();
};

seedDatabase().catch((error) => {
  logger.error('Error seeding database', { error });
  throw error; // Let caller process exit naturally
});
