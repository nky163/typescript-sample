import { Account } from '../../../application/domain/model/Account';

export interface UpdateAccountStatePort {
  updateActivities(account: Account): Promise<void> | void;
}
