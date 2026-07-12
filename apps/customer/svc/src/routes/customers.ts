import { FastifyInstance } from 'fastify';

export async function customerRoutes(app: FastifyInstance) {
  const db = app.db;

  app.post<{
    Body: { cpfCnpj: string; name: string; address: string; type: string };
  }>('/customers', async (request, reply) => {
    const { cpfCnpj, name, address, type } = request.body;

    if (!cpfCnpj || !name || !address || !type) {
      return reply.status(400).send({ error: 'Missing required fields: cpfCnpj, name, address, type' });
    }

    if (type !== 'INDIVIDUAL' && type !== 'LEGAL_ENTITY') {
      return reply.status(400).send({ error: 'Type must be INDIVIDUAL or LEGAL_ENTITY' });
    }

    const existing = db.prepare('SELECT id FROM customers WHERE cpf_cnpj = ?').get(cpfCnpj);
    if (existing) {
      return reply.status(409).send({ error: 'Customer already exists with this CPF/CNPJ' });
    }

    const result = db.prepare(`
      INSERT INTO customers (cpf_cnpj, name, address, type)
      VALUES (?, ?, ?, ?)
    `).run(cpfCnpj, name, address, type);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid) as any;

    return reply.status(201).send({
      id: customer.id,
      cpfCnpj: customer.cpf_cnpj,
      name: customer.name,
      address: customer.address,
      type: customer.type,
      createdAt: customer.created_at,
    });
  });

  app.get<{ Params: { cpfCnpj: string } }>('/customers/:cpfCnpj', async (request, reply) => {
    const { cpfCnpj } = request.params;

    const customer = db.prepare('SELECT * FROM customers WHERE cpf_cnpj = ?').get(cpfCnpj) as any;
    if (!customer) {
      return reply.status(404).send({ error: 'Customer not found' });
    }

    return reply.status(200).send({
      id: customer.id,
      cpfCnpj: customer.cpf_cnpj,
      name: customer.name,
      address: customer.address,
      type: customer.type,
      createdAt: customer.created_at,
    });
  });

  app.get<{ Querystring: { search?: string } }>('/customers', async (request, reply) => {
    const { search } = request.query;

    let customers;
    if (search) {
      customers = db.prepare(
        'SELECT * FROM customers WHERE name LIKE ? OR cpf_cnpj LIKE ?'
      ).all(`%${search}%`, `%${search}%`) as any[];
    } else {
      customers = db.prepare('SELECT * FROM customers').all() as any[];
    }

    return reply.status(200).send({
      customers: customers.map((c) => ({
        id: c.id,
        cpfCnpj: c.cpf_cnpj,
        name: c.name,
        address: c.address,
        type: c.type,
        createdAt: c.created_at,
      })),
    });
  });
}
