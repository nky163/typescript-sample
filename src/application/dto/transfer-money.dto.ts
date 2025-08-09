export class TransferMoneyDTO {
  senderId: string;
  receiverId: string;
  amount: number;

  constructor(senderId: string, receiverId: string, amount: number) {
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.amount = amount;
  }
}
