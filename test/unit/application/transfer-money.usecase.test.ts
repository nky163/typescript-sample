import { TransferMoneyService } from '../../../src/application/use-cases/transfer-money.usecase';
import { TransferMoneyCommand } from '../../../src/application/dto/transfer-money.command';
import { Account } from '../../../src/application/domain/model/account'; // 変更
import { AccountRepositoryPort } from '../../../src/application/port/out/account-repository.port'; // 変更

describe('送金ユースケース', () => {
  let transferMoneyUseCase: TransferMoneyService;
  let accountRepository: AccountRepositoryPort;

  beforeEach(() => {
    accountRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as unknown as AccountRepositoryPort;

    transferMoneyUseCase = new TransferMoneyService(accountRepository);
  });

  it('アカウント間で送金できる', async () => {
    const sender = new Account('1', 100);
    const receiver = new Account('2', 50);
    const command = new TransferMoneyCommand(sender.getId(), receiver.getId(), 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);

    await transferMoneyUseCase.execute(command);

    expect(sender.getBalance()).toBe(70);
    expect(receiver.getBalance()).toBe(80);
    expect(accountRepository.save).toHaveBeenCalledTimes(2);
  });

  it('送金元の残高が不足している場合はエラー', async () => {
    const sender = new Account('1', 20);
    const receiver = new Account('2', 50);
    const command = new TransferMoneyCommand(sender.getId(), receiver.getId(), 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(receiver);

    await expect(transferMoneyUseCase.execute(command)).rejects.toThrow(
      'Insufficient balance',
    );
  });

  it('送金元アカウントが存在しない場合はエラー', async () => {
    const command = new TransferMoneyCommand('non-existent-sender', '2', 30);

    accountRepository.findById = jest.fn().mockResolvedValueOnce(null);

    await expect(transferMoneyUseCase.execute(command)).rejects.toThrow(
      'Sender account not found',
    );
  });

  it('送金先アカウントが存在しない場合はエラー', async () => {
    const sender = new Account('1', 100);
    const command = new TransferMoneyCommand(sender.getId(), 'non-existent-receiver', 30);

    accountRepository.findById = jest
      .fn()
      .mockResolvedValueOnce(sender)
      .mockResolvedValueOnce(null);

    await expect(transferMoneyUseCase.execute(command)).rejects.toThrow(
      'Receiver account not found',
    );
  });
});
