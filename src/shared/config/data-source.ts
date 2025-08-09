import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AccountEntity } from '../../adapter/out/persistence/entity/AccountEntity';
import { ActivityEntity } from '../../adapter/out/persistence/entity/ActivityEntity';
import { logger } from '../logging/logger';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'buckpal',
  entities: [AccountEntity, ActivityEntity],
  // Migrations compiled to dist; ts-node execution can point to src
  migrations: [path.join(__dirname, '../../../migrations/*.{ts,js}')],
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  logging: process.env.TYPEORM_LOGGING === 'true',
});

export async function initDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('DataSource initialized');
  }
  return AppDataSource;
}
