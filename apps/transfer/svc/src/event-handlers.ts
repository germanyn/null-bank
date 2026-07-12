import Database from 'better-sqlite3';
import { buildEnvelope, ROUTING_KEYS, FundsReserved, FundsReserveFailed, TransferSettled, TransferFailed } from '@null-bank/shared-events';
import { EventBus } from './event-bus';

export function registerTransferEventHandlers(db: Database.Database, eventBus: EventBus): void {
  eventBus.subscribe(ROUTING_KEYS.fundsReserved, async (msg) => {
    const { transferId, sourceAccountNumber, reservationId, amount } = msg.payload as FundsReserved['payload'];

    db.prepare(`
      UPDATE transfers
      SET status = 'reserved', reservation_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(reservationId, transferId);

    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId) as any;

    const event = buildEnvelope('SettleTransfer', {
      transferId,
      sourceAccountNumber,
      destinationAccountNumber: transfer.destination_account_number,
      reservationId,
      amount,
    });
    eventBus.publish(ROUTING_KEYS.settleTransfer, event);
  });

  eventBus.subscribe(ROUTING_KEYS.fundsReserveFailed, async (msg) => {
    const { transferId, reason } = msg.payload as FundsReserveFailed['payload'];

    db.prepare(`
      UPDATE transfers
      SET status = 'failed', updated_at = datetime('now')
      WHERE id = ?
    `).run(transferId);
  });

  eventBus.subscribe(ROUTING_KEYS.transferSettled, async (msg) => {
    const { transferId } = msg.payload as TransferSettled['payload'];

    db.prepare(`
      UPDATE transfers
      SET status = 'completed', updated_at = datetime('now')
      WHERE id = ?
    `).run(transferId);
  });

  eventBus.subscribe(ROUTING_KEYS.transferFailed, async (msg) => {
    const { transferId, reason } = msg.payload as TransferFailed['payload'];

    const transfer = db.prepare('SELECT * FROM transfers WHERE id = ?').get(transferId) as any;
    if (!transfer) return;

    db.prepare(`
      UPDATE transfers
      SET status = 'failed', updated_at = datetime('now')
      WHERE id = ?
    `).run(transferId);

    if (transfer.reservation_id) {
      const releaseEvent = buildEnvelope('ReleaseReservation', {
        transferId,
        sourceAccountNumber: transfer.source_account_number,
        reservationId: transfer.reservation_id,
        amount: transfer.amount,
      });
      eventBus.publish(ROUTING_KEYS.releaseReservation, releaseEvent);
    }
  });
}
