import { Account } from './account.entity';

export interface AccountRepositoryPort {
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
  create(initialBalance: number): Promise<Account>;
  findAll(): Promise<Account[]>;
  runInTransaction?<T>(work: () => Promise<T>): Promise<T>;
  // Add other methods as needed
}
