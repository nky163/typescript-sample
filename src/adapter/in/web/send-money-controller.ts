import express from 'express';
import { z } from 'zod';

import { AccountId } from '../../../application/domain/model/account';
import { Money } from '../../../application/domain/model/money';
import { SendMoneyCommand } from '../../../application/port/in/send-money-command';

import type { SendMoneyUseCase } from '../../../application/port/in/send-money-use-case';
import type { Request, Response, NextFunction } from 'express';

export function createSendMoneyRouter(sendMoneyUseCase: SendMoneyUseCase) {
  const router = express.Router();

  router.post(
    '/accounts/send/:sourceAccountId/:targetAccountId/:amount',
    (req: Request, res: Response, next: NextFunction) => {
      // 非同期処理をラップし Promise を呼び出し元に返さない (no-misused-promises 回避)
      void (async () => {
        const paramsSchema = z.object({
          sourceAccountId: z.string().regex(/^\d+$/),
          targetAccountId: z.string().regex(/^\d+$/),
          amount: z
            .string()
            .regex(/^\d+$/)
            .refine((v) => Number(v) > 0, 'amount must be > 0'),
        });

        const parseResult = paramsSchema.safeParse(req.params);
        if (!parseResult.success) {
          res.status(400).json({ errors: parseResult.error.issues });
          return;
        }

        const { sourceAccountId, targetAccountId, amount } = parseResult.data;

        try {
          const command = new SendMoneyCommand(
            new AccountId(Number(sourceAccountId)),
            new AccountId(Number(targetAccountId)),
            Money.of(Number(amount)),
          );

          await sendMoneyUseCase.sendMoney(command);
          res.status(204).send();
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'unknown error';
          res.status(400).json({ error: message });
        }
      })().catch(next);
    },
  );

  return router;
}
