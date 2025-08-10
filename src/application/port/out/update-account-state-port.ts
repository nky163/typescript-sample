import type { Account } from '../../../application/domain/model/account';

export interface UpdateAccountStatePort {
  updateActivities(account: Account): Promise<void> | void;
}
