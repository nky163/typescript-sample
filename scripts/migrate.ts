import { AppDataSource, initDataSource } from '../src/shared/config/data-source';
import { logger } from '../src/shared/logging/logger';

const runMigrations = async () => {
  try {
    await initDataSource();
    logger.info('Data Source initialized for migration');
    await AppDataSource.runMigrations();
    logger.info('Migrations executed');
  } catch (error) {
    logger.error('Migration error', { error });
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  }
};

void runMigrations();
