import { z } from 'zod';

import { AccountId as _AccountId } from '../../domain/model/account';

import type { Money as _Money } from '../../domain/model/money';
const hasFunction = (obj: unknown, name: string): boolean =>
  typeof obj === 'object' &&
  obj !== null &&
  name in obj &&
  typeof (obj as Record<string, unknown>)[name] === 'function';
const isPositiveMoney = (val: unknown): val is _Money =>
  hasFunction(val, 'getAmount') && hasFunction(val, 'isPositive') && (val as _Money).isPositive();
export const sendMoneyCommandSchema = z.object({
  sourceAccountId: z.instanceof(_AccountId, { message: 'sourceAccountId must be AccountId' }),
  targetAccountId: z.instanceof(_AccountId, { message: 'targetAccountId must be AccountId' }),
  money: z.custom<_Money>(isPositiveMoney, 'Money must be positive'),
});
export class SendMoneyCommand {
  constructor(
    public readonly sourceAccountId: _AccountId,
    public readonly targetAccountId: _AccountId,
    public readonly money: _Money,
  ) {
    sendMoneyCommandSchema.parse({ sourceAccountId, targetAccountId, money });
  }
}
