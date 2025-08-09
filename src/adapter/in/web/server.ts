import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import { AccountEntity } from '../../out/persistence/entity/AccountEntity';
import { ActivityEntity } from '../../out/persistence/entity/ActivityEntity';
import { AccountMapper } from '../../out/persistence/AccountMapper';
import { AccountPersistenceAdapter } from '../../out/persistence/AccountPersistenceAdapter';
import { NoOpAccountLock } from '../../out/persistence/NoOpAccountLock';
import { MoneyTransferProperties } from '../../../application/domain/service/MoneyTransferProperties';
import { SendMoneyService } from '../../../application/domain/service/SendMoneyService';
import { createSendMoneyRouter } from './SendMoneyController';
import { GetAccountBalanceService } from '../../../application/domain/service/GetAccountBalanceService';
import { GetAccountBalanceQuery } from '../../../application/port/in/GetAccountBalanceUseCase';
import { AccountId } from '../../../application/domain/model/Account';
import { Money } from '../../../application/domain/model/Money';

const app = express();

const TRANSFER_THRESHOLD = process.env.TRANSFER_THRESHOLD
  ? Number(process.env.TRANSFER_THRESHOLD)
  : 1_000_000;

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'buckpal',
  entities: [AccountEntity, ActivityEntity],
  synchronize: true,
});

async function bootstrap() {
  await dataSource.initialize();
  const mapper = new AccountMapper();
  const persistenceAdapter = new AccountPersistenceAdapter(dataSource, mapper);
  const accountLock = new NoOpAccountLock();
  const moneyTransferProps = new MoneyTransferProperties(Money.of(TRANSFER_THRESHOLD));
  const sendMoneyService = new SendMoneyService(
    persistenceAdapter,
    accountLock,
    persistenceAdapter,
    moneyTransferProps,
  );
  const getBalanceService = new GetAccountBalanceService(persistenceAdapter);

  app.use(express.json());
  app.use(createSendMoneyRouter(sendMoneyService));

  // Simple balance endpoint
  app.get('/accounts/:id/balance', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: 'id must be number' });
      }
      const money = await getBalanceService.getAccountBalance(
        new GetAccountBalanceQuery(new AccountId(id)),
      );
      res.json({ balance: money.getAmount() });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'unknown error';
      res.status(400).json({ error: message });
    }
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server', err);
  throw err; // avoid process.exit for lint rule
});
