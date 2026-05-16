import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from './lib/prisma';
import { validateTelegramInitData, verifyTMAAuth } from './middleware/auth';

dotenv.config();

const server = fastify({ logger: true });
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
const BOT_TOKEN = process.env.BOT_TOKEN;

server.register(cors, { origin: true });

// --- Background Generation Logic ---
async function processImageGeneration(taskId: string, templateId: string, imageUrl: string) {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'PROCESSING' },
    });

    const template = await prisma.template.findUnique({ where: { id: templateId } });
    if (!template) throw new Error('Template not found');

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // В реальной жизни здесь будет запрос к Imagen 3
    const outputUrl = `https://generated-images.com/result-${taskId}.jpg`;

    await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: 'COMPLETED',
        outputUrl,
      },
    });

    console.log(`Task ${taskId} finished successfully!`);
  } catch (error: any) {
    console.error(`Error in background task ${taskId}:`, error.message);
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'FAILED', errorMessage: error.message },
    });
  }
}

// --- Endpoints ---

server.post('/api/auth', async (request, reply) => {
  const { initData } = request.body as { initData: string };
  if (!validateTelegramInitData(initData)) return reply.status(403).send({ error: 'Invalid initData' });

  const urlParams = new URLSearchParams(initData);
  const userRaw = urlParams.get('user');
  if (!userRaw) return reply.status(400).send({ error: 'No user data' });

  const tgUser = JSON.parse(userRaw);
  const telegramId = BigInt(tgUser.id);

  let user = await prisma.user.findUnique({ where: { telegramId } });
  if (!user) {
    const startParam = urlParams.get('start_param');
    let referredBy: bigint | null = null;
    if (startParam && startParam.startsWith('ref_')) referredBy = BigInt(startParam.replace('ref_', ''));

    user = await prisma.user.create({
      data: { telegramId, username: tgUser.username, referredBy, tokens: 3 },
    });
  }

  const token = jwt.sign({ id: user.id, telegramId: user.telegramId.toString() }, JWT_SECRET, { expiresIn: '7d' });
  return { token, user: { ...user, telegramId: user.telegramId.toString() } };
});

server.get('/api/templates', async () => {
  return await prisma.template.findMany({ where: { isActive: true } });
});

server.post('/api/generate/create-task', { preHandler: [verifyTMAAuth] }, async (request, reply) => {
  const { templateId, imageUrl } = request.body as { templateId: string, imageUrl: string };
  const userId = request.user!.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.tokens <= 0) return reply.status(403).send({ error: 'Insufficient tokens' });

  await prisma.user.update({ where: { id: userId }, data: { tokens: { decrement: 1 } } });

  const task = await prisma.task.create({
    data: { userId, templateId, inputUrl: imageUrl, status: 'PENDING' },
  });

  processImageGeneration(task.id, templateId, imageUrl);

  return { taskId: task.id, status: 'PENDING' };
});

server.post('/api/webhooks/telegram', async (request) => {
  const body = request.body as any;

  // Ответ на команду /start
  if (body.message?.text === '/start') {
    const chatId = body.message.chat.id;
    const miniAppUrl = 'https://record-most-educator.ngrok-free.dev';
    
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: 'Привет! Добро пожаловать в PicCreate — генератор твоих идеальных фото! 📸\n\nНажми кнопку ниже, чтобы запустить приложение и создать свой первый шедевр.',
      reply_markup: {
        inline_keyboard: [[
          { text: '🚀 Запустить PicCreate', web_app: { url: miniAppUrl } }
        ]]
      }
    });
  }

  if (body.message?.successful_payment) {
    const payload = JSON.parse(body.message.successful_payment.invoice_payload);
    await prisma.user.update({
      where: { telegramId: BigInt(body.message.from.id) },
      data: { tokens: { increment: payload.tokens } },
    });
  }
  return { ok: true };
});

server.get('/api/health', async () => ({ status: 'ok' }));

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000');
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
