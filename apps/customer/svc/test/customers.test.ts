import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { buildApp } from '../src/app';
import { createDb } from '../src/db';
import Database from 'better-sqlite3';

describe('Customer Service', () => {
  const db = createDb();
  const app = buildApp(db);

  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    db.close();
  });

  beforeEach(() => {
    db.exec('DELETE FROM customers');
  });

  describe('POST /customers', () => {
    it('registers an individual customer with CPF', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.cpfCnpj).toBe('12345678901');
      expect(body.name).toBe('João Silva');
      expect(body.address).toBe('Rua das Flores, 123');
      expect(body.type).toBe('INDIVIDUAL');
      expect(body.id).toBeDefined();
    });

    it('registers a legal entity customer with CNPJ', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '11222333000181',
          name: 'Empresa LTDA',
          address: 'Av. Paulista, 1000',
          type: 'LEGAL_ENTITY',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.cpfCnpj).toBe('11222333000181');
      expect(body.type).toBe('LEGAL_ENTITY');
    });

    it('returns 409 when CPF/CNPJ already exists', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      const res = await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'Outro João',
          address: 'Rua Augusta, 456',
          type: 'INDIVIDUAL',
        },
      });

      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res.body).error).toBe('Customer already exists with this CPF/CNPJ');
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
        },
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /customers/:cpfCnpj', () => {
    it('returns customer details for an existing CPF', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/customers/12345678901',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.cpfCnpj).toBe('12345678901');
      expect(body.name).toBe('João Silva');
      expect(body.address).toBe('Rua das Flores, 123');
      expect(body.type).toBe('INDIVIDUAL');
    });

    it('returns customer details for an existing CNPJ', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '11222333000181',
          name: 'Empresa LTDA',
          address: 'Av. Paulista, 1000',
          type: 'LEGAL_ENTITY',
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/customers/11222333000181',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.name).toBe('Empresa LTDA');
    });

    it('returns 404 for non-existent CPF/CNPJ', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/customers/99999999999',
      });

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res.body).error).toBe('Customer not found');
    });
  });

  describe('GET /customers?search=...', () => {
    it('searches customers by name', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '11222333000181',
          name: 'Empresa LTDA',
          address: 'Av. Paulista, 1000',
          type: 'LEGAL_ENTITY',
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/customers?search=João',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.customers).toHaveLength(1);
      expect(body.customers[0].cpfCnpj).toBe('12345678901');
    });

    it('searches customers by CPF/CNPJ', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/customers?search=12345678901',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.customers).toHaveLength(1);
      expect(body.customers[0].name).toBe('João Silva');
    });

    it('returns empty array when no matches found', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/customers?search=nonexistent',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.customers).toHaveLength(0);
    });

    it('returns all customers when no search param', async () => {
      await app.inject({
        method: 'POST',
        url: '/customers',
        payload: {
          cpfCnpj: '12345678901',
          name: 'João Silva',
          address: 'Rua das Flores, 123',
          type: 'INDIVIDUAL',
        },
      });

      const res = await app.inject({
        method: 'GET',
        url: '/customers',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.customers).toHaveLength(1);
    });
  });
});
