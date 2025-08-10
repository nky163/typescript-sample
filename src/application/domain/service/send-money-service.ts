import { ThresholdExceededException } from './threshold-exceeded-exception';

import type { MoneyTransferProperties } from './money-transfer-properties';
import type { SendMoneyCommand } from '../../port/in/send-money-command';
import type { SendMoneyUseCase } from '../../port/in/send-money-use-case';
import type { AccountLock } from '../../port/out/account-lock';
import type { LoadAccountPort } from '../../port/out/load-account-port';
import type { UpdateAccountStatePort } from '../../port/out/update-account-state-port';

export class SendMoneyService implements SendMoneyUseCase {
  constructor(
    private readonly loadAccountPort: LoadAccountPort,
    private readonly accountLock: AccountLock,
    private readonly updateAccountStatePort: UpdateAccountStatePort,
    private readonly moneyTransferProperties: MoneyTransferProperties,
  ) {}

  async sendMoney(command: SendMoneyCommand): Promise<boolean> {
    this.checkThreshold(command);

    const baselineDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const sourceAccount = await this.loadAccountPort.loadAccount(
      command.sourceAccountId,
      baselineDate,
    );

    const targetAccount = await this.loadAccountPort.loadAccount(
      command.targetAccountId,
      baselineDate,
    );

    const sourceAccountId = sourceAccount.getId();
    const targetAccountId = targetAccount.getId();
    if (!sourceAccountId || !targetAccountId) {
      throw new Error('expected account IDs not to be empty');
    }

    await this.accountLock.lockAccount(sourceAccountId);
    if (!sourceAccount.withdraw(command.money, targetAccountId)) {
      await this.accountLock.releaseAccount(sourceAccountId);
      return false;
    }

    await this.accountLock.lockAccount(targetAccountId);
    if (!targetAccount.deposit(command.money, sourceAccountId)) {
      await this.accountLock.releaseAccount(sourceAccountId);
      await this.accountLock.releaseAccount(targetAccountId);
      return false;
    }

    await this.updateAccountStatePort.updateActivities(sourceAccount);
    await this.updateAccountStatePort.updateActivities(targetAccount);

    await this.accountLock.releaseAccount(sourceAccountId);
    await this.accountLock.releaseAccount(targetAccountId);
    return true;
  }

  private checkThreshold(command: SendMoneyCommand) {
    if (command.money.isGreaterThan(this.moneyTransferProperties.maximumTransferThreshold)) {
      throw new ThresholdExceededException(
        this.moneyTransferProperties.maximumTransferThreshold,
        command.money,
      );
    }
  }
}
