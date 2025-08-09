import { SendMoneyUseCase } from '../../port/in/SendMoneyUseCase';
import { SendMoneyCommand } from '../../port/in/SendMoneyCommand';
import { LoadAccountPort } from '../../port/out/LoadAccountPort';
import { AccountLock } from '../../port/out/AccountLock';
import { UpdateAccountStatePort } from '../../port/out/UpdateAccountStatePort';
import { MoneyTransferProperties } from './MoneyTransferProperties';
import { ThresholdExceededException } from './ThresholdExceededException';

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
