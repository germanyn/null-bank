import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../src/app';
import { createDb } from '../src/db';
import { createInMemoryEventBus } from '../src/event-bus';
import { registerTransferEventHandlers } from '../src/event-handlers';
import { ROUTING_KEYS, buildEnvelope } from '@null-bank/shared-events';
import Database from 'better-sqlite3';

describe('Transfer Service', () => {
  const db = createDb();
  const eventBus = createInMemoryEventBus();
  registerTransferEventHandlers(db, eventBus);
  const app = buildApp(db, eventBus);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    await eventBus.close();
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM transfers');
    eventBus.events.length = 0;
  });

  describe('POST /transfers', () => {
    it('creates a transfer and publishes ReserveFunds event', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '0987654321',
          amount: 100,
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.transferId).toBeDefined();
      expect(body.status).toBe('pending');
      expect(body.amount).toBe(100);

      const reserveEvent = eventBus.events.find((e) => e.routingKey === ROUTING_KEYS.reserveFunds);
      expect(reserveEvent).toBeDefined();
      expect(reserveEvent!.event.eventType).toBe('ReserveFunds');
      expect((reserveEvent!.event as any).payload.sourceAccountNumber).toBe('1234567890');
      expect((reserveEvent!.event as any).payload.amount).toBe(100);
    });

    it('returns 400 when source and destination are the same', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '1234567890',
          amount: 100,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res.body).error).toContain('different');
    });

    it('returns 400 when amount is not positive', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '0987654321',
          amount: 0,
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /transfers/:transferId', () => {
    it('returns transfer details', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '0987654321',
          amount: 250,
        },
      });
      const { transferId } = JSON.parse(createRes.body);

      const res = await app.inject({
        method: 'GET',
        url: `/transfers/${transferId}`,
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.transferId).toBe(transferId);
      expect(body.amount).toBe(250);
      expect(body.status).toBe('pending');
    });

    it('returns 404 for non-existent transfer', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/transfers/non-existent-id',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Transfer lifecycle via events', () => {
    it('completes the full happy path: pending → reserved → completed', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1111111111',
          destinationAccountNumber: '2222222222',
          amount: 500,
        },
      });
      const { transferId } = JSON.parse(createRes.body);

      await eventBus.dispatch(ROUTING_KEYS.fundsReserved, buildEnvelope('FundsReserved', {
        transferId,
        sourceAccountNumber: '1111111111',
        reservationId: 'res-001',
        amount: 500,
      }));

      let transferRes = await app.inject({ method: 'GET', url: `/transfers/${transferId}` });
      expect(JSON.parse(transferRes.body).status).toBe('reserved');

      const settleEvent = eventBus.events.find(
        (e) => e.routingKey === ROUTING_KEYS.settleTransfer,
      );
      expect(settleEvent).toBeDefined();

      await eventBus.dispatch(ROUTING_KEYS.transferSettled, buildEnvelope('TransferSettled', {
        transferId,
        sourceAccountNumber: '1111111111',
        destinationAccountNumber: '2222222222',
      }));

      transferRes = await app.inject({ method: 'GET', url: `/transfers/${transferId}` });
      expect(JSON.parse(transferRes.body).status).toBe('completed');
    });

    it('marks transfer as failed when funds reservation fails', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1111111111',
          destinationAccountNumber: '2222222222',
          amount: 10000,
        },
      });
      const { transferId } = JSON.parse(createRes.body);

      await eventBus.dispatch(ROUTING_KEYS.fundsReserveFailed, buildEnvelope('FundsReserveFailed', {
        transferId,
        sourceAccountNumber: '1111111111',
        reason: 'Insufficient funds',
      }));

      const transferRes = await app.inject({ method: 'GET', url: `/transfers/${transferId}` });
      expect(JSON.parse(transferRes.body).status).toBe('failed');
    });

    it('marks transfer as failed and releases reservation when settlement fails', async () => {
      const createRes = await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1111111111',
          destinationAccountNumber: '2222222222',
          amount: 200,
        },
      });
      const { transferId } = JSON.parse(createRes.body);

      await eventBus.dispatch(ROUTING_KEYS.fundsReserved, buildEnvelope('FundsReserved', {
        transferId,
        sourceAccountNumber: '1111111111',
        reservationId: 'res-002',
        amount: 200,
      }));

      await eventBus.dispatch(ROUTING_KEYS.transferFailed, buildEnvelope('TransferFailed', {
        transferId,
        reason: 'Destination account closed',
      }));

      const transferRes = await app.inject({ method: 'GET', url: `/transfers/${transferId}` });
      expect(JSON.parse(transferRes.body).status).toBe('failed');

      const releaseEvent = eventBus.events.find(
        (e) => e.routingKey === ROUTING_KEYS.releaseReservation,
      );
      expect(releaseEvent).toBeDefined();
      expect((releaseEvent!.event as any).payload.reservationId).toBe('res-002');
    });
  });

  describe('GET /accounts/:accountNumber/transfers', () => {
    it('returns transfer history for an account', async () => {
      await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '1111111111',
          destinationAccountNumber: '2222222222',
          amount: 100,
        },
      });

      await app.inject({
        method: 'POST',
        url: '/transfers',
        payload: {
          sourceAccountNumber: '2222222222',
          destinationAccountNumber: '1111111111',
          amount: 50,
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/accounts/1111111111/transfers',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body).toHaveLength(2);
    });
  });
});
