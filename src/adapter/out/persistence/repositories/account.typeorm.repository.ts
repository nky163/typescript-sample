import { DataSource, Repository } from 'typeorm';
import { Account } from '../../../../application/domain/model/account'; // 修正: 階層の見直し
import { AccountRepositoryPort } from '../../../../application/port/out/account-repository.port';
import { AccountORMEntity } from '../entities/account.orm-entity';
import logger from '../../../logging/logger'; // 修正: infrastructure -> logging

export class AccountTypeORMRepository implements AccountRepositoryPort {
  private readonly repository: Repository<AccountORMEntity>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(AccountORMEntity);
  }

  async findById(id: string): Promise<Account | null> {
    const accountEntity = await this.repository.findOne({ where: { id } });
    return accountEntity ? this.toDomain(accountEntity) : null;
  }

  async save(account: Account): Promise<void> {
    const accountEntity = this.toORM(account);
    await this.repository.save(accountEntity);
  }

  async create(initialBalance: number): Promise<Account> {
    const entity = this.repository.create({ balance: initialBalance });
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAll(): Promise<Account[]> {
    const entities = await this.repository.find();
    return entities.map((e) => this.toDomain(e));
  }

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const originalRepo = this.repository;
    try {
      // swap to transactional repository
      (this as any).repository = queryRunner.manager.getRepository(AccountORMEntity);
      const result = await work();
      await queryRunner.commitTransaction();
      logger.info('Transaction committed');
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      logger.error('Transaction rolled back', { error: e instanceof Error ? e.message : e });
      throw e;
    } finally {
      (this as any).repository = originalRepo; // restore
      await queryRunner.release();
    }
  }

  private toDomain(entity: AccountORMEntity): Account {
    return new Account(entity.id, Number(entity.balance));
  }

  private toORM(account: Account): AccountORMEntity {
    const entity = new AccountORMEntity();
    entity.id = account.getId();
    entity.balance = account.getBalance();
    return entity;
  }
}
