import { AccountRepositoryPort } from '../port/out/account-repository.port'; // 変更
import { NotFoundError } from '../../shared/errors/not-found.error';
import DomainError from '../../shared/errors/domain-error';
import { TransferMoneyCommand } from '../port/in/transfer-money.command';
import { TransferMoneyUseCase as TransferMoneyUseCaseInPort } from '../port/in/transfer-money.use-case';

export class TransferMoneyService implements TransferMoneyUseCaseInPort {
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

// TODO: rename this file to send-money.service.ts for buckpal alignment.
export class SendMoneyService extends TransferMoneyService {} // Temporary alias for transition
