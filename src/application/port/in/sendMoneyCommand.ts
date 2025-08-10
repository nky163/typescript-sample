import { z } from 'zod';

import { AccountId } from '../../domain/model/account';

import type { Money } from '../../domain/model/money';
const hasFunction = (obj: unknown, name: string): boolean =>
  typeof obj === 'object' &&
  obj !== null &&
  name in obj &&
  typeof (obj as Record<string, unknown>)[name] === 'function';
const isPositiveMoney = (val: unknown): val is Money =>
  hasFunction(val, 'getAmount') && hasFunction(val, 'isPositive') && (val as Money).isPositive();
export const sendMoneyCommandSchema = z.object({
  sourceAccountId: z.instanceof(AccountId, { message: 'sourceAccountId must be AccountId' }),
  targetAccountId: z.instanceof(AccountId, { message: 'targetAccountId must be AccountId' }),
  money: z.custom<Money>(isPositiveMoney, 'Money must be positive'),
});
export class SendMoneyCommand {
  constructor(
    public readonly sourceAccountId: AccountId,
    public readonly targetAccountId: AccountId,
    public readonly money: Money,
  ) {
    sendMoneyCommandSchema.parse({ sourceAccountId, targetAccountId, money });
  }
}
