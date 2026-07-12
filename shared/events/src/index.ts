import { z } from 'zod';

// ── Base event envelope ───────────────────────────────────────

export const EventEnvelope = z.object({
  eventId: z.string().uuid(),
  eventType: z.string(),
  occurredAt: z.string().datetime(),
  version: z.literal(1),
});
export type EventEnvelope = z.infer<typeof EventEnvelope>;

// ── ReserveFunds ──────────────────────────────────────────────
// transfer-svc → account-svc (source)

export const ReserveFundsPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  amount: z.number().positive(),
});
export type ReserveFundsPayload = z.infer<typeof ReserveFundsPayload>;

export const ReserveFunds = EventEnvelope.extend({
  eventType: z.literal('ReserveFunds'),
  payload: ReserveFundsPayload,
});
export type ReserveFunds = z.infer<typeof ReserveFunds>;

// ── FundsReserved ─────────────────────────────────────────────
// account-svc → transfer-svc (confirmation)

export const FundsReservedPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  reservationId: z.string(),
  amount: z.number().positive(),
});
export type FundsReservedPayload = z.infer<typeof FundsReservedPayload>;

export const FundsReserved = EventEnvelope.extend({
  eventType: z.literal('FundsReserved'),
  payload: FundsReservedPayload,
});
export type FundsReserved = z.infer<typeof FundsReserved>;

// ── FundsReserveFailed ────────────────────────────────────────
// account-svc → transfer-svc (rejection)

export const FundsReserveFailedPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  reason: z.string(),
});
export type FundsReserveFailedPayload = z.infer<typeof FundsReserveFailedPayload>;

export const FundsReserveFailed = EventEnvelope.extend({
  eventType: z.literal('FundsReserveFailed'),
  payload: FundsReserveFailedPayload,
});
export type FundsReserveFailed = z.infer<typeof FundsReserveFailed>;

// ── SettleTransfer ────────────────────────────────────────────
// transfer-svc → account-svc (execute both sides)

export const SettleTransferPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  destinationAccountNumber: z.string(),
  reservationId: z.string(),
  amount: z.number().positive(),
});
export type SettleTransferPayload = z.infer<typeof SettleTransferPayload>;

export const SettleTransfer = EventEnvelope.extend({
  eventType: z.literal('SettleTransfer'),
  payload: SettleTransferPayload,
});
export type SettleTransfer = z.infer<typeof SettleTransfer>;

// ── TransferSettled ───────────────────────────────────────────
// account-svc → transfer-svc (confirmation)

export const TransferSettledPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  destinationAccountNumber: z.string(),
});
export type TransferSettledPayload = z.infer<typeof TransferSettledPayload>;

export const TransferSettled = EventEnvelope.extend({
  eventType: z.literal('TransferSettled'),
  payload: TransferSettledPayload,
});
export type TransferSettled = z.infer<typeof TransferSettled>;

// ── TransferFailed ────────────────────────────────────────────
// account-svc → transfer-svc (settlement failure)

export const TransferFailedPayload = z.object({
  transferId: z.string().uuid(),
  reason: z.string(),
});
export type TransferFailedPayload = z.infer<typeof TransferFailedPayload>;

export const TransferFailed = EventEnvelope.extend({
  eventType: z.literal('TransferFailed'),
  payload: TransferFailedPayload,
});
export type TransferFailed = z.infer<typeof TransferFailed>;

// ── ReleaseReservation ────────────────────────────────────────
// transfer-svc → account-svc (rollback)

export const ReleaseReservationPayload = z.object({
  transferId: z.string().uuid(),
  sourceAccountNumber: z.string(),
  reservationId: z.string(),
  amount: z.number().positive(),
});
export type ReleaseReservationPayload = z.infer<typeof ReleaseReservationPayload>;

export const ReleaseReservation = EventEnvelope.extend({
  eventType: z.literal('ReleaseReservation'),
  payload: ReleaseReservationPayload,
});
export type ReleaseReservation = z.infer<typeof ReleaseReservation>;

// ── Union type ────────────────────────────────────────────────

export const TransferEvent = z.discriminatedUnion('eventType', [
  ReserveFunds,
  FundsReserved,
  FundsReserveFailed,
  SettleTransfer,
  TransferSettled,
  TransferFailed,
  ReleaseReservation,
]);
export type TransferEvent = z.infer<typeof TransferEvent>;

// ── Exchange / routing constants ──────────────────────────────

export const EXCHANGE = 'null-bank.transfers';

export const ROUTING_KEYS = {
  reserveFunds: 'transfer.reserve-funds',
  fundsReserved: 'transfer.funds-reserved',
  fundsReserveFailed: 'transfer.funds-reserve-failed',
  settleTransfer: 'transfer.settle-transfer',
  transferSettled: 'transfer.transfer-settled',
  transferFailed: 'transfer.transfer-failed',
  releaseReservation: 'transfer.release-reservation',
} as const;

// ── Helpers ───────────────────────────────────────────────────

export function createEventId(): string {
  return crypto.randomUUID();
}

export function createOccurredAt(): string {
  return new Date().toISOString();
}

export function buildEnvelope<K extends string>(
  eventType: K,
  payload: Record<string, unknown>,
): { eventId: string; eventType: K; occurredAt: string; version: 1; payload: Record<string, unknown> } {
  return {
    eventId: createEventId(),
    eventType,
    occurredAt: createOccurredAt(),
    version: 1,
    payload,
  };
}
