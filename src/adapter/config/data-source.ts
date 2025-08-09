import { DataSource } from 'typeorm';
import { AccountORMEntity } from '../persistence/entities/account.orm-entity';
import env from './env';
import logger from '../logging/logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [AccountORMEntity],
  migrations: [__dirname + '/../persistence/migrations/*.{ts,js}'],
  subscribers: [],
});

let initializing: Promise<DataSource> | null = null;

export async function initDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return AppDataSource;
  if (!initializing) {
    initializing = AppDataSource.initialize()
      .then(ds => {
        logger.info('DataSource initialized');
        return ds;
      })
      .catch(err => {
        logger.error('DataSource initialization failed', { error: err instanceof Error ? err.message : err });
        initializing = null;
        throw err;
      });
  }
  return initializing;
}

export default AppDataSource;
