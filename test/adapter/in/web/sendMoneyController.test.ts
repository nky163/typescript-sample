/* eslint-disable n/no-unpublished-import */
import express from 'express';
import request from 'supertest';

import { createSendMoneyRouter } from '../../../../src/adapter/in/web/sendMoneyController';

import type { SendMoneyCommand } from '../../../../src/application/port/in/sendMoneyCommand';
import type { SendMoneyUseCase } from '../../../../src/application/port/in/sendMoneyUseCase';

class MockSendMoneyUseCase implements SendMoneyUseCase {
  lastCommand?: SendMoneyCommand;
  sendMoney(command: SendMoneyCommand): Promise<boolean> {
    this.lastCommand = command;
    return Promise.resolve(true);
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
