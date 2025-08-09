import { Request, Response } from 'express';
import { SendMoneyService } from '../../../../application/use-cases/send-money.service';
import { TransferMoneyCommand } from '../../../../application/port/in/transfer-money.command';
import { WebAdapter } from '../../../../application/common/decorators';

@WebAdapter()
export class AccountController {
  constructor(private transferMoneyUseCase: SendMoneyService) {}

  public async transferMoney(req: Request, res: Response): Promise<void> {
    const { senderId, receiverId, amount } = req.body;
    const command = new TransferMoneyCommand(senderId, receiverId, amount);
    await this.transferMoneyUseCase.execute(command);
    res.status(200).json({ message: 'Transfer successful' });
  }
}
