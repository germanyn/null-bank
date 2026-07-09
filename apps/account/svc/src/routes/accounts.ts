import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function generateAccountNumber(): string {
  return crypto.randomInt(1_000_000_000, 10_000_000_000).toString();
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function accountRoutes(app: FastifyInstance) {
  const db = app.db;

  app.post<{ Body: { cpfCnpj: string; password: string; initialBalance?: number } }>('/accounts', async (request, reply) => {
    const { cpfCnpj, password, initialBalance } = request.body;

    const existing = db.prepare('SELECT id FROM accounts WHERE cpf_cnpj = ?').get(cpfCnpj);
    if (existing) {
      return reply.status(409).send({ error: 'Account already exists for this CPF/CNPJ' });
    }

    const accountNumber = generateAccountNumber();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO accounts (account_number, cpf_cnpj, password_hash, balance)
      VALUES (?, ?, ?, ?)
    `).run(accountNumber, cpfCnpj, passwordHash, initialBalance ?? 0);

    const account = db.prepare('SELECT * FROM accounts WHERE account_number = ?').get(accountNumber) as any;

    return reply.status(201).send({
      accountNumber: account.account_number,
      cpfCnpj: account.cpf_cnpj,
      balance: account.balance,
      createdAt: account.created_at,
    });
  });

  app.get<{ Params: { accountNumber: string } }>('/accounts/:accountNumber/balance', async (request, reply) => {
    const { accountNumber } = request.params;

    const account = db.prepare('SELECT account_number, balance FROM accounts WHERE account_number = ?').get(accountNumber) as any;
    if (!account) {
      return reply.status(404).send({ error: 'Account not found' });
    }

    return reply.status(200).send({
      accountNumber: account.account_number,
      balance: account.balance,
    });
  });

  app.post<{ Body: { accountNumber: string; password: string } }>('/login', async (request, reply) => {
    const { accountNumber, password } = request.body;

    const account = db.prepare('SELECT * FROM accounts WHERE account_number = ?').get(accountNumber) as any;
    if (!account) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, account.password_hash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = generateToken();
    db.prepare('UPDATE accounts SET token = ? WHERE id = ?').run(token, account.id);

    return reply.status(200).send({
      accountNumber: account.account_number,
      token,
    });
  });
}
