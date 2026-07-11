import Database from 'better-sqlite3';
import { buildEnvelope, ROUTING_KEYS } from '@null-bank/shared-events';
import { EventBus } from './event-bus';

export function registerAccountEventHandlers(db: Database.Database, eventBus: EventBus): void {
  eventBus.subscribe(ROUTING_KEYS.reserveFunds, async (msg) => {
    const { transferId, sourceAccountNumber, amount } = msg.payload as {
      transferId: string;
      sourceAccountNumber: string;
      amount: number;
    };

    const account = db.prepare('SELECT * FROM accounts WHERE account_number = ?').get(sourceAccountNumber) as any;
    if (!account) {
      const failEvent = buildEnvelope('FundsReserveFailed', {
        transferId,
        sourceAccountNumber,
        reason: 'Account not found',
      });
      eventBus.publish(ROUTING_KEYS.fundsReserveFailed, failEvent);
      return;
    }

    const availableBalance = account.balance - account.reserved_balance;
    if (availableBalance < amount) {
      const failEvent = buildEnvelope('FundsReserveFailed', {
        transferId,
        sourceAccountNumber,
        reason: 'Insufficient funds',
      });
      eventBus.publish(ROUTING_KEYS.fundsReserveFailed, failEvent);
      return;
    }

    const reservationId = crypto.randomUUID();
    db.prepare('INSERT INTO reservations (id, account_number, amount) VALUES (?, ?, ?)').run(
      reservationId,
      sourceAccountNumber,
      amount,
    );
    db.prepare('UPDATE accounts SET reserved_balance = reserved_balance + ? WHERE account_number = ?').run(
      amount,
      sourceAccountNumber,
    );

    const okEvent = buildEnvelope('FundsReserved', {
      transferId,
      sourceAccountNumber,
      reservationId,
      amount,
    });
    eventBus.publish(ROUTING_KEYS.fundsReserved, okEvent);
  });

  eventBus.subscribe(ROUTING_KEYS.settleTransfer, async (msg) => {
    const { transferId, sourceAccountNumber, destinationAccountNumber, reservationId, amount } = msg.payload as {
      transferId: string;
      sourceAccountNumber: string;
      destinationAccountNumber: string;
      reservationId: string;
      amount: number;
    };

    try {
      db.prepare('BEGIN TRANSACTION').run();

      db.prepare('UPDATE accounts SET balance = balance - ?, reserved_balance = reserved_balance - ? WHERE account_number = ?').run(
        amount,
        amount,
        sourceAccountNumber,
      );

      const destAccount = db.prepare('SELECT id FROM accounts WHERE account_number = ?').get(destinationAccountNumber);
      if (!destAccount) {
        throw new Error('Destination account not found');
      }

      db.prepare('UPDATE accounts SET balance = balance + ? WHERE account_number = ?').run(
        amount,
        destinationAccountNumber,
      );

      db.prepare('DELETE FROM reservations WHERE id = ?').run(reservationId);

      db.prepare('COMMIT').run();

      const settledEvent = buildEnvelope('TransferSettled', {
        transferId,
        sourceAccountNumber,
        destinationAccountNumber,
      });
      eventBus.publish(ROUTING_KEYS.transferSettled, settledEvent);
    } catch (err) {
      db.prepare('ROLLBACK').run();
      const failEvent = buildEnvelope('TransferFailed', {
        transferId,
        reason: err instanceof Error ? err.message : 'Settlement failed',
      });
      eventBus.publish(ROUTING_KEYS.transferFailed, failEvent);
    }
  });

  eventBus.subscribe(ROUTING_KEYS.releaseReservation, async (msg) => {
    const { transferId, sourceAccountNumber, reservationId, amount } = msg.payload as {
      transferId: string;
      sourceAccountNumber: string;
      reservationId: string;
      amount: number;
    };

    db.prepare('DELETE FROM reservations WHERE id = ?').run(reservationId);
    db.prepare('UPDATE accounts SET reserved_balance = reserved_balance - ? WHERE account_number = ?').run(
      amount,
      sourceAccountNumber,
    );
  });
}
