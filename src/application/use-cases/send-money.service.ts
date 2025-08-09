import { AccountRepositoryPort } from '../port/out/account-repository.port';
import { NotFoundError } from '../../shared/errors/not-found.error';
import DomainError from '../../shared/errors/domain-error';
import { TransferMoneyCommand } from '../port/in/transfer-money.command';
import { TransferMoneyUseCase } from '../port/in/transfer-money.use-case';
import { UseCase } from '../common/decorators';

@UseCase()
export class SendMoneyService implements TransferMoneyUseCase {
  constructor(private accountRepository: AccountRepositoryPort) {}

  async execute(command: TransferMoneyCommand): Promise<void> {
    if (command.amount <= 0) {
      throw new DomainError('Transfer amount must be positive');
    }
    const run = async () => {
      const senderAccount = await this.accountRepository.findById(command.senderId);
      if (!senderAccount) {
        throw new NotFoundError('Sender account not found');
      }
      const receiverAccount = await this.accountRepository.findById(command.receiverId);
      if (!receiverAccount) {
        throw new NotFoundError('Receiver account not found');
      }

      if (senderAccount.getBalance() < command.amount) {
        throw new DomainError('Insufficient balance');
      }

      senderAccount.withdraw(command.amount);
      receiverAccount.deposit(command.amount);

      await this.accountRepository.save(senderAccount);
      await this.accountRepository.save(receiverAccount);
    };

    if (this.accountRepository.runInTransaction) {
      await this.accountRepository.runInTransaction(run);
    } else {
      await run();
    }
  }
}

// Backward compatibility during transition
export class TransferMoneyService extends SendMoneyService {}
