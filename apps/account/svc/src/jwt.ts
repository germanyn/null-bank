import crypto from 'crypto';

const ALGORITHM = 'sha256';
const DEFAULT_EXPIRY_SECONDS = 86400;

function base64urlEncode(data: string | Buffer): string {
  const base64 = Buffer.isBuffer(data)
    ? data.toString('base64')
    : Buffer.from(data).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Buffer {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64');
}

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
}

export function signJwt(
  payload: { sub: string },
  secret: string,
  expiresInSec: number = DEFAULT_EXPIRY_SECONDS,
): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    sub: payload.sub,
    iat: now,
    exp: now + expiresInSec,
  };

  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac(ALGORITHM, secret).update(data).digest();
  const encodedSignature = base64urlEncode(signature);

  return `${data}.${encodedSignature}`;
}

export function verifyJwt(token: string, secret: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac(ALGORITHM, secret).update(data).digest();
  const actualSignature = base64urlDecode(encodedSignature);

  if (expectedSignature.length !== actualSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, actualSignature)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64urlDecode(encodedPayload).toString()) as JwtPayload;

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    throw new Error('Token expired');
  }

  return payload;
}
