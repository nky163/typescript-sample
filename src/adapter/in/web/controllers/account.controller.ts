import { Request, Response } from 'express';
import { TransferMoneyService } from '../../../application/use-cases/transfer-money.usecase';
import { TransferMoneyCommand } from '../../../application/port/in/transfer-money.command';
import logger from '../../logging/logger';

export class AccountController {
  constructor(private transferMoneyUseCase: TransferMoneyService) {}

  public async transferMoney(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, amount } = req.body;
    const command = new TransferMoneyCommand(senderId, receiverId, amount);
    await this.transferMoneyUseCase.execute(command);
    res.status(200).json({ message: 'Transfer successful' });
  }
}
