import 'reflect-metadata';
import path from 'path';

import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { AccountEntity } from '../../adapter/out/persistence/entity/accountEntity';
import { ActivityEntity } from '../../adapter/out/persistence/entity/activityEntity';
import { logger } from '../logging/logger';

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

/**
 * TypeORM DataSource 初期化。
 * - 冪等: 既に初期化済みなら再初期化しない
 * - 副作用: DB 接続確立 / 環境変数に基づきマイグレーション設定読み込み
 */
export async function initDataSource(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    logger.info('DataSource initialized');
  }
  return AppDataSource;
}
