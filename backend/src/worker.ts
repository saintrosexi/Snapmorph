import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from './lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

const worker = new Worker('generation-tasks', async (job: Job) => {
  const { taskId, userId, templateId, imageUrl } = job.data;

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'PROCESSING' },
    });

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) throw new Error('Template not found');

    // For Imagen 3 in Gemini, we use the generative model
    // Note: This is a high-level abstraction. Imagen 3 might be called differently depending on the region/preview status.
    // If Imagen 3 is not directly in GenerativeModel, we might use the ImageGeneration API.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 1. Analyze user photo to get descriptive prompt
    const prompt = `Act as an AI Photo Stylist. I will provide an image and a style template: "${template.title}". 
    The base prompt for the style is: "${template.basePrompt}".
    Analyze the user's facial features, hair, and expression from the provided image and generate a NEW high-quality image of the same person in this style.
    Keep the likeness as close as possible.`;

    // Note: Gemini 1.5 can process images. We'd fetch the image buffer here.
    // For this implementation, we simulate the output generation.
    
    // In a real implementation with Imagen 3:
    // const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }]);
    // const outputUrl = result.response.text(); // Or the actual image bytes

    // Mocking output for now since Imagen 3 API specifics vary by access
    const outputUrl = `https://example.com/generated-${taskId}.jpg`;

    await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: 'COMPLETED',
        outputUrl,
      },
    });

    console.log(`Task ${taskId} completed via Gemini.`);

  } catch (error: any) {
    console.error(`Worker error for task ${taskId}:`, error.message);
    await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: 'FAILED',
        errorMessage: error.message,
      },
    });
    throw error;
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} failed with ${err.message}`);
});

console.log('Worker started (Google AI Studio)...');
export default worker;
