export class DomainEvent {
  constructor(
    public readonly eventName: string,
    public readonly data: unknown,
  ) {}
}
