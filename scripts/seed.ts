import { initDataSource } from '../src/shared/config/data-source';
import { logger } from '../src/shared/logging/logger';
import { AccountEntity } from '../src/adapter/out/persistence/entity/AccountEntity';

const seedDatabase = async () => {
  const ds = await initDataSource();
  const accountRepository = ds.getRepository(AccountEntity);

  const accounts = [{}, {}, {}];
  await accountRepository.save(accounts.map(() => accountRepository.create({})));
  logger.info('Database seeded with initial accounts');
  await ds.destroy();
};

seedDatabase().catch((error) => {
  logger.error('Error seeding database', { error });
  throw error;
});
