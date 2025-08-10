import type { SendMoneyCommand } from './send-money-command';

export interface SendMoneyUseCase {
  sendMoney(command: SendMoneyCommand): Promise<boolean> | boolean;
}
