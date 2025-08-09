import { TransferMoneyCommand } from './transfer-money.command';

export interface TransferMoneyUseCase {
  execute(command: TransferMoneyCommand): Promise<void>;
}
