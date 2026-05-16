import { FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function verifyTMAAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, telegramId: string };
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
}

export function validateTelegramInitData(initData: string): boolean {
  if (!BOT_TOKEN) return false;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

  return calculatedHash === hash;
}

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      telegramId: string;
    };
  }
}
