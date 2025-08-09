import { AccountId as _AccountId } from '../../domain/model/Account';
import { Money as _Money } from '../../domain/model/Money';
import { z } from 'zod';

// Money型判定 + 正数チェック用ヘルパ (any排除)
const hasFunction = (obj: unknown, name: string): boolean =>
  typeof obj === 'object' &&
  obj !== null &&
  name in obj &&
  typeof (obj as Record<string, unknown>)[name] === 'function';

const isPositiveMoney = (val: unknown): val is _Money =>
  hasFunction(val, 'getAmount') &&
  hasFunction(val, 'isPositive') &&
  // 型ガード後にキャストしてメソッド呼び出し
  (val as _Money).isPositive();

// 強化されたZodスキーマ: 型と値の整合性チェック
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
