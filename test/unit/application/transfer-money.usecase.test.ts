import { TransferMoneyUseCase } from '../../../src/application/use-cases/transfer-money.usecase';
import { TransferMoneyDTO } from '../../../src/application/dto/transfer-money.dto';
import { Account } from '../../../src/domain/accounts/account.entity';
import { AccountRepositoryPort } from '../../../src/domain/accounts/account.repository.port';

describe('送金ユースケース', () => {
  let transferMoneyUseCase: TransferMoneyUseCase;
  let accountRepository: AccountRepositoryPort;

  beforeEach(() => {
    accountRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as AccountRepositoryPort;

    transferMoneyUseCase = new TransferMoneyUseCase(accountRepository);
  });

  it('アカウント間で送金できる', async () => {
    const sender = new Account('1', 100);
    const receiver = new Account('2', 50);
    const transferMoneyDTO = new TransferMoneyDTO(sender.getId(), receiver.getId(), 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);

    await transferMoneyUseCase.execute(transferMoneyDTO);

    expect(sender.getBalance()).toBe(70);
    expect(receiver.getBalance()).toBe(80);
    expect(accountRepository.save).toHaveBeenCalledTimes(2);
  });

  it('送金元の残高が不足している場合はエラー', async () => {
    const sender = new Account('1', 20);
    const receiver = new Account('2', 50);
    const transferMoneyDTO = new TransferMoneyDTO(sender.getId(), receiver.getId(), 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);

    await expect(transferMoneyUseCase.execute(transferMoneyDTO)).rejects.toThrow(
      'Insufficient balance',
    );
  });

  it('送金元アカウントが存在しない場合はエラー', async () => {
    const transferMoneyDTO = new TransferMoneyDTO('non-existent-sender', '2', 30);

    accountRepository.findById = jest.fn().mockResolvedValueOnce(null);

    await expect(transferMoneyUseCase.execute(transferMoneyDTO)).rejects.toThrow(
      'Sender account not found',
    );
  });

  it('送金先アカウントが存在しない場合はエラー', async () => {
    const sender = new Account('1', 100);
    const transferMoneyDTO = new TransferMoneyDTO(sender.getId(), 'non-existent-receiver', 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(null);

    await expect(transferMoneyUseCase.execute(transferMoneyDTO)).rejects.toThrow(
      'Receiver account not found',
    );
  });
});
