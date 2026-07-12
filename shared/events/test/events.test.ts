import { describe, it, expect } from 'vitest';
import {
  ReserveFunds,
  FundsReserved,
  FundsReserveFailed,
  SettleTransfer,
  TransferSettled,
  TransferFailed,
  ReleaseReservation,
  buildEnvelope,
} from '../src/index';

describe('Event Schemas — Contract Tests', () => {
  const eventId = '550e8400-e29b-41d4-a716-446655440000';
  const occurredAt = '2026-07-11T00:00:00.000Z';
  const transferId = '660e8400-e29b-41d4-a716-446655440001';

  describe('ReserveFunds (transfer-svc → account-svc)', () => {
    it('validates a well-formed ReserveFunds event', () => {
      const event = {
        eventId,
        eventType: 'ReserveFunds',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          amount: 100,
        },
      };

      const result = ReserveFunds.safeParse(event);
      expect(result.success).toBe(true);
    });

    it('rejects event with missing fields', () => {
      const event = {
        eventId,
        eventType: 'ReserveFunds',
        occurredAt,
        version: 1,
        payload: {
          transferId,
        },
      };

      const result = ReserveFunds.safeParse(event);
      expect(result.success).toBe(false);
    });

    it('rejects event with negative amount', () => {
      const event = {
        eventId,
        eventType: 'ReserveFunds',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          amount: -50,
        },
      };

      const result = ReserveFunds.safeParse(event);
      expect(result.success).toBe(false);
    });
  });

  describe('FundsReserved (account-svc → transfer-svc)', () => {
    it('validates a well-formed FundsReserved event', () => {
      const event = {
        eventId,
        eventType: 'FundsReserved',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          reservationId: 'res-001',
          amount: 100,
        },
      };

      const result = FundsReserved.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('FundsReserveFailed (account-svc → transfer-svc)', () => {
    it('validates a well-formed FundsReserveFailed event', () => {
      const event = {
        eventId,
        eventType: 'FundsReserveFailed',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          reason: 'Insufficient funds',
        },
      };

      const result = FundsReserveFailed.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('SettleTransfer (transfer-svc → account-svc)', () => {
    it('validates a well-formed SettleTransfer event', () => {
      const event = {
        eventId,
        eventType: 'SettleTransfer',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '0987654321',
          reservationId: 'res-001',
          amount: 100,
        },
      };

      const result = SettleTransfer.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('TransferSettled (account-svc → transfer-svc)', () => {
    it('validates a well-formed TransferSettled event', () => {
      const event = {
        eventId,
        eventType: 'TransferSettled',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          destinationAccountNumber: '0987654321',
        },
      };

      const result = TransferSettled.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('TransferFailed (account-svc → transfer-svc)', () => {
    it('validates a well-formed TransferFailed event', () => {
      const event = {
        eventId,
        eventType: 'TransferFailed',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          reason: 'Destination account closed',
        },
      };

      const result = TransferFailed.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('ReleaseReservation (transfer-svc → account-svc)', () => {
    it('validates a well-formed ReleaseReservation event', () => {
      const event = {
        eventId,
        eventType: 'ReleaseReservation',
        occurredAt,
        version: 1,
        payload: {
          transferId,
          sourceAccountNumber: '1234567890',
          reservationId: 'res-001',
          amount: 100,
        },
      };

      const result = ReleaseReservation.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('buildEnvelope helper', () => {
    it('creates a valid envelope with UUID and ISO timestamp', () => {
      const envelope = buildEnvelope('ReserveFunds', {
        transferId,
        sourceAccountNumber: '1234567890',
        amount: 100,
      });

      expect(envelope.eventId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(envelope.eventType).toBe('ReserveFunds');
      expect(envelope.occurredAt).toBeDefined();
      expect(envelope.version).toBe(1);
      expect((envelope.payload as any).transferId).toBe(transferId);
    });
  });
});
