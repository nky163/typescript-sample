import { Account } from '../../domain/model/account';

export interface LoadAccountPort {
  findById(id: string): Promise<Account | null>;
}

export interface UpdateAccountStatePort {
  save(account: Account): Promise<void>;
}

export interface CreateAccountPort {
  create(initialBalance: number): Promise<Account>;
}

export interface ListAccountsPort {
  findAll(): Promise<Account[]>;
}

export interface AccountRepositoryPort extends LoadAccountPort, UpdateAccountStatePort, CreateAccountPort, ListAccountsPort {
  runInTransaction?<T>(work: () => Promise<T>): Promise<T>;
}
