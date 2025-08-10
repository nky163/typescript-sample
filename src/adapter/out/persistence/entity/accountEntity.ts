import { Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 *
 */
@Entity('account')
export class AccountEntity {
  @PrimaryGeneratedColumn()
  id!: number;
}
