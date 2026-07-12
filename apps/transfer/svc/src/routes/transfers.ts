import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { buildEnvelope, ROUTING_KEYS } from '@null-bank/shared-events';
import { EventBus } from '../event-bus';

declare module 'fastify' {
  interface FastifyInstance {
    db: import('better-sqlite3').Database;
    eventBus: EventBus;
  }
}

export async function transferRoutes(app: FastifyInstance) {
  const db = app.db;
  const eventBus = app.eventBus;

  app.post<{
    Body: {
      sourceAccountNumber: string;
      destinationAccountNumber: string;
      amount: number;
    };
  }>('/transfers', async (request, reply) => {
    const { sourceAccountNumber, destinationAccountNumber, amount } = request.body;

    if (sourceAccountNumber === destinationAccountNumber) {
      return reply.status(400).send({ error: 'Source and destination accounts must be different' });
    }

    if (!amount || amount <= 0) {
      return reply.status(400).send({ error: 'Amount must be a positive number' });
    }

    const transferId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO transfers (id, source_account_number, destination_account_number, amount, status)
      VALUES (?, ?, ?, ?, 'pending')
    `).run(transferId, sourceAccountNumber, destinationAccountNumber, amount);

    const event = buildEnvelope('ReserveFunds', {
      transferId,
      sourceAccountNumber,
      amount,
    });
    eventBus.publish(ROUTING_KEYS.reserveFunds, event);

    return reply.status(201).send({
      transferId,
      sourceAccountNumber,
      destinationAccountNumber,
      amount,
      status: 'pending',
    });
  });

  app.get<{ Params: { transferId: string } }>('/transfers/:transferId', async (request, reply) => {
    const { transferId } = request.params;

    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId) as any;
    if (!transfer) {
      return reply.status(404).send({ error: 'Transfer not found' });
    }

    return reply.status(200).send({
      transferId: transfer.id,
      sourceAccountNumber: transfer.source_account_number,
      destinationAccountNumber: transfer.destination_account_number,
      amount: transfer.amount,
      status: transfer.status,
      reservationId: transfer.reservation_id,
      createdAt: transfer.created_at,
      updatedAt: transfer.updated_at,
    });
  });

  app.get<{ Params: { accountNumber: string } }>('/accounts/:accountNumber/transfers', async (request, reply) => {
    const { accountNumber } = request.params;

    const transfers = db.prepare(`
      SELECT * FROM transfers
      WHERE source_account_number = ? OR destination_account_number = ?
      ORDER BY created_at DESC
    `).all(accountNumber, accountNumber) as any[];

    return reply.status(200).send(
      transfers.map((t) => ({
        transferId: t.id,
        sourceAccountNumber: t.source_account_number,
        destinationAccountNumber: t.destination_account_number,
        amount: t.amount,
        status: t.status,
        createdAt: t.created_at,
      })),
    );
  });
}
