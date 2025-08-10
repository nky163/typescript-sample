import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 *
 */
@Entity('activity')
export class ActivityEntity {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column({ type: 'timestamptz' })
  timestamp!: Date;
  @Column('bigint')
  ownerAccountId!: number;
  @Column('bigint')
  sourceAccountId!: number;
  @Column('bigint')
  targetAccountId!: number;
  @Column('bigint')
  amount!: number;
}
