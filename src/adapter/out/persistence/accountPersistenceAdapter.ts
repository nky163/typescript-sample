import { AccountEntity } from './entity/accountEntity';
import { ActivityEntity } from './entity/activityEntity';

import type { AccountMapper } from './accountMapper';
import type { Account, AccountId } from '../../../application/domain/model/account';
import type { LoadAccountPort } from '../../../application/port/out/loadAccountPort';
import type { UpdateAccountStatePort } from '../../../application/port/out/updateAccountStatePort';
import type { DataSource, Repository } from 'typeorm';

export class AccountPersistenceAdapter implements LoadAccountPort, UpdateAccountStatePort {
  private accountRepo: Repository<AccountEntity>;
  private activityRepo: Repository<ActivityEntity>;
  constructor(
    private dataSource: DataSource,
    private mapper: AccountMapper,
  ) {
    this.accountRepo = this.dataSource.getRepository(AccountEntity);
    this.activityRepo = this.dataSource.getRepository(ActivityEntity);
  }
  async loadAccount(accountId: AccountId, baselineDate: Date): Promise<Account> {
    const account = await this.accountRepo.findOneByOrFail({ id: accountId.value });
    const windowActivities = await this.activityRepo
      .createQueryBuilder('a')
      .where('a.ownerAccountId = :id', { id: accountId.value })
      .andWhere('a.timestamp >= :baseline', { baseline: baselineDate })
      .getMany();
    const withdrawalBalance = await this.activityRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount),0)', 'sum')
      .where('a.sourceAccountId = :id', { id: accountId.value })
      .andWhere('a.ownerAccountId = :id', { id: accountId.value })
      .andWhere('a.timestamp < :until', { until: baselineDate })
      .getRawOne<{ sum: string }>();
    const depositBalance = await this.activityRepo
      .createQueryBuilder('a')
      .select('COALESCE(SUM(a.amount),0)', 'sum')
      .where('a.targetAccountId = :id', { id: accountId.value })
      .andWhere('a.ownerAccountId = :id', { id: accountId.value })
      .andWhere('a.timestamp < :until', { until: baselineDate })
      .getRawOne<{ sum: string }>();
    return this.mapper.mapToDomainEntity(
      account,
      windowActivities,
      Number(withdrawalBalance?.sum ?? 0),
      Number(depositBalance?.sum ?? 0),
    );
  }
  async updateActivities(account: Account): Promise<void> {
    for (const activity of account.activityWindow.getActivities()) {
      if (!activity.id) {
        await this.activityRepo.save(this.mapper.mapToEntity(activity));
      }
    }
  }
}
