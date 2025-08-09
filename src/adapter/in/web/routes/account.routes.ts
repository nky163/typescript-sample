import { Router } from 'express';
import { AccountController } from '../controllers/account.controller';
import { SendMoneyService } from '../../../../application/use-cases/send-money.service';
import { AccountTypeORMRepository } from '../../../out/persistence/repositories/account.typeorm.repository';
import AppDataSource, { initDataSource } from '../../../config/data-source';
import { z } from 'zod';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();

async function getRepository() {
  const ds = await initDataSource();
  return new AccountTypeORMRepository(ds);
}

const createAccountSchema = z.object({
  balance: z.number().nonnegative().optional(),
});

const transferSchema = z.object({
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  amount: z.number().positive(),
});

router.post('/transfer', validateBody(transferSchema), async (req, res, next) => {
  try {
    const repository = await getRepository();
    const transferMoneyUseCase = new SendMoneyService(repository);
    const accountController = new AccountController(transferMoneyUseCase);
    return await accountController.transferMoney(req, res);
  } catch (e) {
    next(e);
  }
});

router.post('/accounts', validateBody(createAccountSchema), async (req, res, next) => {
  const repository = await getRepository();
  const { balance } = req.body;
  try {
    const account = await repository.create(balance ?? 0);
    res.status(201).json({ id: account.getId(), balance: account.getBalance() });
  } catch (e) {
    next(e);
  }
});

router.get('/accounts', async (_req, res) => {
  const repository = await getRepository();
  const accounts = await repository.findAll();
  res.json(accounts.map((a: any) => ({ id: a.getId(), balance: a.getBalance() })));
});

export default router;
