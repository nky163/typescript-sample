import { Request, Response } from 'express';
import { TransferMoneyUseCase } from '../../../application/use-cases/transfer-money.usecase';
import { TransferMoneyDTO } from '../../../application/dto/transfer-money.dto';
import logger from '../../logging/logger';

export class AccountController {
  constructor(private transferMoneyUseCase: TransferMoneyUseCase) {}

  public async transferMoney(req: Request, res: Response): Promise<void> {
    const transferMoneyDto: TransferMoneyDTO = req.body;
    await this.transferMoneyUseCase.execute(transferMoneyDto);
    res.status(200).json({ message: 'Transfer successful' });
  }
}
