import amqplib, { ChannelModel, Channel, ConsumeMessage } from 'amqplib';
import {
  EXCHANGE,
} from '@null-bank/shared-events';

export interface EventBus {
  publish(routingKey: string, event: Record<string, unknown>): void;
  subscribe(routingKey: string, handler: (msg: Record<string, unknown>) => void | Promise<void>): void;
  close(): Promise<void>;
}

export async function connectEventBus(url: string): Promise<EventBus> {
  const connection: ChannelModel = await amqplib.connect(url);
  const channel: Channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE, 'topic', { durable: true });

  const subscriptions = new Map<string, (msg: Record<string, unknown>) => void | Promise<void>>();

  return {
    publish(routingKey: string, event: Record<string, unknown>) {
      const payload = Buffer.from(JSON.stringify(event));
      channel.publish(EXCHANGE, routingKey, payload, { persistent: true, contentType: 'application/json' });
    },

    subscribe(routingKey: string, handler: (msg: Record<string, unknown>) => void | Promise<void>) {
      const queue = `null-bank.transfer-svc.${routingKey}`;
      channel.assertQueue(queue, { durable: true });
      channel.bindQueue(queue, EXCHANGE, routingKey);

      subscriptions.set(routingKey, handler);

      channel.consume(queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          const handlerFn = subscriptions.get(msg.fields.routingKey);
          if (handlerFn) {
            await handlerFn(content);
          }
          channel.ack(msg);
        } catch {
          channel.nack(msg, false, true);
        }
      });
    },

    async close() {
      await channel.close();
      await connection.close();
    },
  };
}

export interface InMemoryEventBus extends EventBus {
  events: Array<{ routingKey: string; event: Record<string, unknown> }>;
  dispatch(routingKey: string, event: Record<string, unknown>): Promise<void>;
}

export function createInMemoryEventBus(): InMemoryEventBus {
  const events: Array<{ routingKey: string; event: Record<string, unknown> }> = [];
  const handlers = new Map<string, (msg: Record<string, unknown>) => void | Promise<void>>();

  return {
    events,
    publish(routingKey: string, event: Record<string, unknown>) {
      events.push({ routingKey, event });
    },
    subscribe(routingKey: string, handler: (msg: Record<string, unknown>) => void | Promise<void>) {
      handlers.set(routingKey, handler);
    },
    async close() {},
    async dispatch(routingKey: string, event: Record<string, unknown>) {
      const handler = handlers.get(routingKey);
      if (handler) {
        await handler(event);
      }
    },
  };
}
