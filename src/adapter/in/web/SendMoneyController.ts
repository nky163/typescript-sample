import express, { Request, Response } from 'express';
import { z } from 'zod';
import { SendMoneyUseCase } from '../../../application/port/in/SendMoneyUseCase';
import { SendMoneyCommand } from '../../../application/port/in/SendMoneyCommand';
import { AccountId } from '../../../application/domain/model/Account';
import { Money } from '../../../application/domain/model/Money';

export function createSendMoneyRouter(sendMoneyUseCase: SendMoneyUseCase) {
  const router = express.Router();

  router.post(
    '/accounts/send/:sourceAccountId/:targetAccountId/:amount',
    async (req: Request, res: Response) => {
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
        return res.status(400).json({ errors: parseResult.error.issues });
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
    },
  );

  return router;
}
