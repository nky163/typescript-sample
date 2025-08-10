import express from 'express';
import { z } from 'zod';

import { AccountId } from '../../../application/domain/model/account';
import { Money } from '../../../application/domain/model/money';
import { SendMoneyCommand } from '../../../application/port/in/sendMoneyCommand';
import { logger } from '../../../shared/logging/logger';

import type { SendMoneyUseCase } from '../../../application/port/in/sendMoneyUseCase';
import type { Request, Response, NextFunction } from 'express';

/** 送金エンドポイントルータ */
export function createSendMoneyRouter(sendMoneyUseCase: SendMoneyUseCase) {
  const router = express.Router();

  router.post(
    '/accounts/send/:sourceAccountId/:targetAccountId/:amount',
    (req: Request, res: Response, next: NextFunction) => {
      void (async () => {
        const paramsSchema = z.object({
          sourceAccountId: z.string().regex(/^[\d]+$/),
          targetAccountId: z.string().regex(/^[\d]+$/),
          amount: z
            .string()
            .regex(/^[\d]+$/)
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
          logger.warn('sendMoney failed', { message, sourceAccountId, targetAccountId });
          res.status(400).json({ error: message });
        }
      })().catch(next);
    },
  );

  return router;
}
