import { SendMoneyCommand } from './SendMoneyCommand';

export interface SendMoneyUseCase {
  sendMoney(command: SendMoneyCommand): Promise<boolean> | boolean;
}
