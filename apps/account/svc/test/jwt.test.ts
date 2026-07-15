import { describe, it, expect } from 'vitest';
import { signJwt, verifyJwt } from '../src/jwt';

const SECRET = 'test-secret-key';

describe('JWT Utilities', () => {
  describe('signJwt', () => {
    it('returns a valid three-part JWT string', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET);
      const parts = token.split('.');
      expect(parts).toHaveLength(3);
    });

    it('sets sub, iat, and exp in the payload', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET);
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

      expect(payload.sub).toBe('1234567890');
      expect(payload.iat).toBeTypeOf('number');
      expect(payload.exp).toBeTypeOf('number');
      expect(payload.exp).toBeGreaterThan(payload.iat);
    });

    it('defaults to 24h expiry', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET);
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

      expect(payload.exp - payload.iat).toBe(86400);
    });

    it('respects custom expiry', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET, 3600);
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());

      expect(payload.exp - payload.iat).toBe(3600);
    });
  });

  describe('verifyJwt', () => {
    it('returns the payload for a valid token', () => {
      const token = signJwt({ sub: '9876543210' }, SECRET);
      const payload = verifyJwt(token, SECRET);

      expect(payload.sub).toBe('9876543210');
      expect(payload.iat).toBeTypeOf('number');
      expect(payload.exp).toBeTypeOf('number');
    });

    it('throws for a token signed with a different secret', () => {
      const token = signJwt({ sub: '1234567890' }, 'wrong-secret');
      expect(() => verifyJwt(token, SECRET)).toThrow('Invalid token signature');
    });

    it('throws for a malformed token', () => {
      expect(() => verifyJwt('not-a-jwt', SECRET)).toThrow('Invalid token format');
    });

    it('throws for an expired token', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET, -1);
      expect(() => verifyJwt(token, SECRET)).toThrow('Token expired');
    });

    it('throws when a payload field is tampered with', () => {
      const token = signJwt({ sub: '1234567890' }, SECRET);
      const [header, payload, sig] = token.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ sub: 'HACKED', iat: 0, exp: 9999999999 }),
      ).toString('base64url');
      const tampered = `${header}.${tamperedPayload}.${sig}`;

      expect(() => verifyJwt(tampered, SECRET)).toThrow('Invalid token signature');
    });
  });
});
