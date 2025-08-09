/* eslint-disable n/no-unpublished-import */
import request from 'supertest';
import AppDataSource from '../../src/infrastructure/config/data-source';
import { app } from '../../src/infrastructure/web/server';
import { AccountORMEntity } from '../../src/infrastructure/persistence/entities/account.orm-entity';

describe('送金 統合テスト', () => {
  const repo = () => AppDataSource.getRepository(AccountORMEntity);

  beforeEach(async () => {
    await repo().clear();
  });

  it('アカウント間で送金に成功する', async () => {
    const senderEntity = repo().create({ balance: 100 });
    const receiverEntity = repo().create({ balance: 50 });
    await repo().save([senderEntity, receiverEntity]);

    const transferResponse = await request(app)
      .post('/api/transfer')
      .send({ senderId: senderEntity.id, receiverId: receiverEntity.id, amount: 50 });

    expect(transferResponse.status).toBe(200);
    expect(transferResponse.body).toHaveProperty('message', 'Transfer successful');

    const updatedSender = await repo().findOne({ where: { id: senderEntity.id } });
    const updatedReceiver = await repo().findOne({ where: { id: receiverEntity.id } });
    expect(updatedSender).not.toBeNull();
    expect(updatedReceiver).not.toBeNull();
    expect(Number(updatedSender!.balance)).toBe(50);
    expect(Number(updatedReceiver!.balance)).toBe(100);
  });

  it('送金元の残高不足の場合エラーを返す', async () => {
    const senderEntity = repo().create({ balance: 30 });
    const receiverEntity = repo().create({ balance: 50 });
    await repo().save([senderEntity, receiverEntity]);

    const transferResponse = await request(app)
      .post('/api/transfer')
      .send({ senderId: senderEntity.id, receiverId: receiverEntity.id, amount: 50 });

    expect(transferResponse.status).toBe(422);
    expect(transferResponse.body).toHaveProperty('message');
  });
});
