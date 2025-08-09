export class SendMoneyCommand {
  constructor(
    public readonly senderId: string,
    public readonly receiverId: string,
    public readonly amount: number,
  ) {}
}
