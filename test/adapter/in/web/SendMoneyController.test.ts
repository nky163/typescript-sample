/* eslint-disable n/no-unpublished-import */
import request from 'supertest';
import express from 'express';
import { createSendMoneyRouter } from '../../../../src/adapter/in/web/SendMoneyController';
import { SendMoneyUseCase } from '../../../../src/application/port/in/SendMoneyUseCase';
import { SendMoneyCommand } from '../../../../src/application/port/in/SendMoneyCommand';

class MockSendMoneyUseCase implements SendMoneyUseCase {
  lastCommand?: SendMoneyCommand;
  async sendMoney(command: SendMoneyCommand): Promise<boolean> {
    this.lastCommand = command;
    return true;
  }
}

describe('SendMoneyControllerTest', () => {
  it('testSendMoney', async () => {
    const useCase = new MockSendMoneyUseCase();
    const app = express();
    app.use(createSendMoneyRouter(useCase));

    await request(app)
      .post('/accounts/send/41/42/500')
      .set('Content-Type', 'application/json')
      .expect(204);

    expect(useCase.lastCommand).toBeDefined();
    expect(useCase.lastCommand!.sourceAccountId.value).toBe(41);
    expect(useCase.lastCommand!.targetAccountId.value).toBe(42);
    expect(useCase.lastCommand!.money.getAmount()).toBe(500);
  });
});
