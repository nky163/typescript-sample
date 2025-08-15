import { Account, AccountId } from '../../../../src/application/domain/model/account';
import { ActivityWindow } from '../../../../src/application/domain/model/activity-window';
import { Money } from '../../../../src/application/domain/model/money';
import { MoneyTransferProperties } from '../../../../src/application/domain/service/money-transfer-properties';
import { SendMoneyService } from '../../../../src/application/domain/service/send-money-service';
import { SendMoneyCommand } from '../../../../src/application/port/in/send-money-command';

import type { AccountLock } from '../../../../src/application/port/out/account-lock';
import type { LoadAccountPort } from '../../../../src/application/port/out/load-account-port';
import type { UpdateAccountStatePort } from '../../../../src/application/port/out/update-account-state-port';

describe('SendMoneyService (interaction)', () => {
  const moneyTransferProperties = new MoneyTransferProperties(Money.of(Number.MAX_SAFE_INTEGER));

  function newAccount(id: number): Account {
    return Account.withId(new AccountId(id), Money.of(1000), new ActivityWindow([]));
  }

  function buildService(
    sourceAccount: Account,
    targetAccount: Account,
    overrides?: {
      withdrawReturn?: boolean;
      depositReturn?: boolean;
    },
  ) {
    // withdraw / deposit をモック化して成否を制御
    const withdrawMock = jest.fn().mockReturnValue(overrides?.withdrawReturn ?? true);
    const depositMock = jest.fn().mockReturnValue(overrides?.depositReturn ?? true);
    // プロトタイプメソッドを上書き
    (sourceAccount as any).withdraw = withdrawMock;
    (targetAccount as any).deposit = depositMock;

    const loadAccountPort: LoadAccountPort = {
      loadAccount: jest.fn(async (id) => {
        if (id.value === sourceAccount.getId()!.value) return sourceAccount;
        if (id.value === targetAccount.getId()!.value) return targetAccount;
        throw new Error('unexpected id');
      }),
    };

    const accountLock: AccountLock = {
      lockAccount: jest.fn(async () => {}),
      releaseAccount: jest.fn(async () => {}),
    };

    const updateAccountStatePort: UpdateAccountStatePort = {
      updateActivities: jest.fn(async () => {}),
    };

    const service = new SendMoneyService(
      loadAccountPort,
      accountLock,
      updateAccountStatePort,
      moneyTransferProperties,
    );
    return { service, withdrawMock, depositMock, accountLock, updateAccountStatePort };
  }

  it('given withdrawal fails then only source account is locked and released', async () => {
    const source = newAccount(41);
    const target = newAccount(42);
    const { service, withdrawMock, accountLock, depositMock, updateAccountStatePort } =
      buildService(source, target, {
        withdrawReturn: false,
        depositReturn: true,
      });

    const cmd = new SendMoneyCommand(source.getId()!, target.getId()!, Money.of(300));
    const success = await service.sendMoney(cmd);

    expect(success).toBe(false);
    // withdraw は呼ばれ deposit は呼ばれない
    expect(withdrawMock).toHaveBeenCalledTimes(1);
    expect(depositMock).not.toHaveBeenCalled();
    // ソースのみロック/解放
    expect((accountLock.lockAccount as jest.Mock).mock.calls).toEqual([[source.getId()!]]);
    expect((accountLock.releaseAccount as jest.Mock).mock.calls).toEqual([[source.getId()!]]);
    // ターゲットはロックされない
    expect(accountLock.lockAccount).not.toHaveBeenCalledWith(target.getId()!);
    // updateActivities は呼ばれない（失敗のため）
    expect(updateAccountStatePort.updateActivities).not.toHaveBeenCalled();
  });

  it('transaction succeeds', async () => {
    const source = newAccount(41);
    const target = newAccount(42);
    const { service, withdrawMock, depositMock, accountLock, updateAccountStatePort } =
      buildService(source, target, {
        withdrawReturn: true,
        depositReturn: true,
      });

    const money = Money.of(500);
    const cmd = new SendMoneyCommand(source.getId()!, target.getId()!, money);
    const success = await service.sendMoney(cmd);

    expect(success).toBe(true);

    const sourceId = source.getId()!;
    const targetId = target.getId()!;

    expect(accountLock.lockAccount).toHaveBeenCalledWith(sourceId);
    expect(withdrawMock).toHaveBeenCalledWith(money, targetId);
    expect(accountLock.releaseAccount).toHaveBeenCalledWith(sourceId);

    expect(accountLock.lockAccount).toHaveBeenCalledWith(targetId);
    expect(depositMock).toHaveBeenCalledWith(money, sourceId);
    expect(accountLock.releaseAccount).toHaveBeenCalledWith(targetId);

    // 2回 (source, target)
    expect(updateAccountStatePort.updateActivities).toHaveBeenCalledTimes(2);
    const updatedAccounts = (
      updateAccountStatePort.updateActivities as jest.MockedFunction<(a: Account) => void>
    ).mock.calls.map((c) => c[0].getId()!.value);
    expect(updatedAccounts).toContain(sourceId.value);
    expect(updatedAccounts).toContain(targetId.value);
  });
});
