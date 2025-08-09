import { AccountRepositoryPort } from '../../domain/accounts/account.repository.port';
import { TransferMoneyDTO } from '../dto/transfer-money.dto';
import { NotFoundError } from '../../shared/errors/not-found.error';
import DomainError from '../../shared/errors/domain-error';

export class TransferMoneyUseCase {
  constructor(private accountRepository: AccountRepositoryPort) {}

  async execute(dto: TransferMoneyDTO): Promise<void> {
    if (dto.amount <= 0) {
      throw new DomainError('Transfer amount must be positive');
    }
    const run = async () => {
      const senderAccount = await this.accountRepository.findById(dto.senderId);
      if (!senderAccount) {
        throw new NotFoundError('Sender account not found');
      }
      const receiverAccount = await this.accountRepository.findById(dto.receiverId);
      if (!receiverAccount) {
        throw new NotFoundError('Receiver account not found');
      }

      if (senderAccount.getBalance() < dto.amount) {
        throw new DomainError('Insufficient balance');
      }

      senderAccount.withdraw(dto.amount);
      receiverAccount.deposit(dto.amount);

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
