import { AccountEntity } from './entity/account-entity';
import { ActivityEntity } from './entity/activity-entity';

import type { AccountMapper } from './account-mapper';
import type { Account, AccountId } from '../../../application/domain/model/account';
import type { LoadAccountPort } from '../../../application/port/out/load-account-port';
import type { UpdateAccountStatePort } from '../../../application/port/out/update-account-state-port';
import type { DataSource, Repository } from 'typeorm';

/**
 * 永続化アダプタ: アカウント読み取り / 活動履歴更新担当。
 * - クエリ: 基準日以前の入出金を SUM 集計し差分から baselineBalance 再構築
 * - 性能前提: 1 アカウント活動件数 < 5k
 * - トランザクション境界開始責務: 上位サービス
 */
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
