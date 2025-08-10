import { Account, AccountId } from '../../../application/domain/model/account';
import { Activity, ActivityId } from '../../../application/domain/model/activity';
import { ActivityWindow } from '../../../application/domain/model/activity-window';
import { Money } from '../../../application/domain/model/money';

import { ActivityEntity } from './entity/activity-entity';

import type { AccountEntity } from './entity/account-entity';

export class AccountMapper {
  mapToDomainEntity(
    account: AccountEntity,
    activities: ActivityEntity[],
    withdrawalBalance: number,
    depositBalance: number,
  ): Account {
    const baselineBalance = Money.subtract(Money.of(depositBalance), Money.of(withdrawalBalance));

    return Account.withId(
      new AccountId(account.id),
      baselineBalance,
      this.mapToActivityWindow(activities),
    );
  }

  mapToActivityWindow(activities: ActivityEntity[]): ActivityWindow {
    const mapped = activities.map(
      (a) =>
        new Activity(
          new ActivityId(a.id),
          new AccountId(Number(a.ownerAccountId)),
          new AccountId(Number(a.sourceAccountId)),
          new AccountId(Number(a.targetAccountId)),
          a.timestamp,
          Money.of(Number(a.amount)),
        ),
    );
    return new ActivityWindow(mapped);
  }

  mapToEntity(activity: Activity): ActivityEntity {
    const entity = new ActivityEntity();
    if (activity.id) entity.id = activity.id.value;
    entity.timestamp = activity.timestamp;
    entity.ownerAccountId = activity.ownerAccountId.value;
    entity.sourceAccountId = activity.sourceAccountId.value;
    entity.targetAccountId = activity.targetAccountId.value;
    entity.amount = activity.money.getAmount();
    return entity;
  }
}
