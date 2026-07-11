import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp as buildTransferApp } from '../src/app';
import { createDb as createTransferDb } from '../src/db';
import { createInMemoryEventBus as createTransferEventBus } from '../src/event-bus';
import { registerTransferEventHandlers } from '../src/event-handlers';

import { buildApp as buildAccountApp } from '@null-bank/account-svc/src/app';
import { createDb as createAccountDb } from '@null-bank/account-svc/src/db';
import { createInMemoryEventBus as createAccountEventBus } from '@null-bank/account-svc/src/event-bus';
import { registerAccountEventHandlers } from '@null-bank/account-svc/src/event-handlers';

import { buildEnvelope, ROUTING_KEYS } from '@null-bank/shared-events';

describe('E2E: Full Transfer Flow', () => {
  const transferDb = createTransferDb();
  const accountDb = createAccountDb();
  const transferEventBus = createTransferEventBus();
  const accountEventBus = createAccountEventBus();

  registerTransferEventHandlers(transferDb, transferEventBus);
  registerAccountEventHandlers(accountDb, accountEventBus);

  const transferApp = buildTransferApp(transferDb, transferEventBus);
  const accountApp = buildAccountApp(accountDb);

  beforeAll(async () => {
    await transferApp.ready();
    await accountApp.ready();
  });

  afterAll(async () => {
    await transferApp.close();
    await accountApp.close();
    await transferEventBus.close();
    await accountEventBus.close();
    transferDb.close();
    accountDb.close();
  });

  beforeEach(() => {
    transferDb.exec('DELETE FROM transfers');
    accountDb.exec('DELETE FROM reservations');
    accountDb.exec('DELETE FROM accounts');
    transferEventBus.events.length = 0;
    accountEventBus.events.length = 0;
  });

  async function simulateEventFlow() {
    // Get all events from transfer-svc
    const transferEvents = transferEventBus.events;

    for (const { routingKey, event } of transferEvents) {
      await accountEventBus.dispatch(routingKey, event);
    }

    transferEventBus.events.length = 0;

    // Get all events from account-svc
    const accountEvents = accountEventBus.events;

    for (const { routingKey, event } of accountEvents) {
      await transferEventBus.dispatch(routingKey, event);
    }

    accountEventBus.events.length = 0;
  }

  it('completes a full transfer: accounts → reserve → settle → complete', async () => {
    // 1. Create source account with balance
    const sourceCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        cpfCnpj: '11111111111',
        password: 'pass123',
        initialBalance: 1000,
      },
    });
    expect(sourceCreateRes.statusCode).toBe(201);
    const sourceAccount = JSON.parse(sourceCreateRes.body);

    // 2. Create destination account
    const destCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        cpfCnpj: '22222222222',
        password: 'pass456',
        initialBalance: 500,
      },
    });
    expect(destCreateRes.statusCode).toBe(201);
    const destAccount = JSON.parse(destCreateRes.body);

    // 3. Initiate transfer via transfer-svc
    const transferRes = await transferApp.inject({
      method: 'POST',
      url: '/transfers',
      payload: {
        sourceAccountNumber: sourceAccount.accountNumber,
        destinationAccountNumber: destAccount.accountNumber,
        amount: 200,
      },
    });
    expect(transferRes.statusCode).toBe(201);
    const transfer = JSON.parse(transferRes.body);
    expect(transfer.status).toBe('pending');

    // 4. Simulate event flow: transfer-svc → account-svc (reserve)
    await simulateEventFlow();

    // 5. After reserve, transfer should be in reserved state, account-svc should have settled
    await simulateEventFlow();

    // 6. Check final transfer status
    const statusRes = await transferApp.inject({
      method: 'GET',
      url: `/transfers/${transfer.transferId}`,
    });
    expect(statusRes.statusCode).toBe(200);
    const status = JSON.parse(statusRes.body);
    expect(status.status).toBe('completed');

    // 7. Verify source account balance
    const sourceBalanceRes = await accountApp.inject({
      method: 'GET',
      url: `/accounts/${sourceAccount.accountNumber}/balance`,
    });
    const sourceBalance = JSON.parse(sourceBalanceRes.body);
    expect(sourceBalance.balance).toBe(800);

    // 8. Verify destination account balance
    const destBalanceRes = await accountApp.inject({
      method: 'GET',
      url: `/accounts/${destAccount.accountNumber}/balance`,
    });
    const destBalance = JSON.parse(destBalanceRes.body);
    expect(destBalance.balance).toBe(700);
  });

  it('handles insufficient funds: transfer fails and no balance changes', async () => {
    // 1. Create source account with low balance
    const sourceCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        cpfCnpj: '33333333333',
        password: 'pass789',
        initialBalance: 50,
      },
    });
    const sourceAccount = JSON.parse(sourceCreateRes.body);

    // 2. Create destination account
    const destCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: {
        cpfCnpj: '44444444444',
        password: 'pass012',
        initialBalance: 0,
      },
    });
    const destAccount = JSON.parse(destCreateRes.body);

    // 3. Initiate transfer for more than available
    const transferRes = await transferApp.inject({
      method: 'POST',
      url: '/transfers',
      payload: {
        sourceAccountNumber: sourceAccount.accountNumber,
        destinationAccountNumber: destAccount.accountNumber,
        amount: 500,
      },
    });
    const transfer = JSON.parse(transferRes.body);

    // 4. Simulate event flow
    await simulateEventFlow();

    // 5. Check transfer status - should be failed
    const statusRes = await transferApp.inject({
      method: 'GET',
      url: `/transfers/${transfer.transferId}`,
    });
    const status = JSON.parse(statusRes.body);
    expect(status.status).toBe('failed');

    // 6. Verify source account balance unchanged
    const sourceBalanceRes = await accountApp.inject({
      method: 'GET',
      url: `/accounts/${sourceAccount.accountNumber}/balance`,
    });
    expect(JSON.parse(sourceBalanceRes.body).balance).toBe(50);
  });

  it('returns transfer history for an account', async () => {
    // Create accounts
    const sourceCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: { cpfCnpj: '55555555555', password: 'pass345', initialBalance: 1000 },
    });
    const sourceAccount = JSON.parse(sourceCreateRes.body);

    const destCreateRes = await accountApp.inject({
      method: 'POST',
      url: '/accounts',
      payload: { cpfCnpj: '66666666666', password: 'pass678', initialBalance: 0 },
    });
    const destAccount = JSON.parse(destCreateRes.body);

    // Create two transfers
    await transferApp.inject({
      method: 'POST',
      url: '/transfers',
      payload: { sourceAccountNumber: sourceAccount.accountNumber, destinationAccountNumber: destAccount.accountNumber, amount: 100 },
    });

    await transferApp.inject({
      method: 'POST',
      url: '/transfers',
      payload: { sourceAccountNumber: sourceAccount.accountNumber, destinationAccountNumber: destAccount.accountNumber, amount: 200 },
    });

    // Get transfer history
    const historyRes = await transferApp.inject({
      method: 'GET',
      url: `/accounts/${sourceAccount.accountNumber}/transfers`,
    });
    expect(historyRes.statusCode).toBe(200);
    const history = JSON.parse(historyRes.body);
    expect(history).toHaveLength(2);
  });
});
