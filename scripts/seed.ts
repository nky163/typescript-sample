import { AccountEntity } from '../src/adapter/out/persistence/entity/account-entity';
import { initDataSource } from '../src/shared/config/data-source';
import { logger } from '../src/shared/logging/logger';

const seedDatabase = async () => {
  const ds = await initDataSource();
  const accountRepository = ds.getRepository(AccountEntity);

  const accounts = [{}, {}, {}];
  await accountRepository.save(accounts.map(() => accountRepository.create({})));
  logger.info('Database seeded with initial accounts');
  await ds.destroy();
};

seedDatabase().catch((error: unknown) => {
  const errObj = error as Error;
  logger.error('Error seeding database', {
    message: errObj.message,
    stack: errObj.stack,
  });
  throw error;
});
