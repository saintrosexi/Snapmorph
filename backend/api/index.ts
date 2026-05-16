import { FastifyInstance } from 'fastify';
import app from '../src/index_serverless';

export default async (req: any, res: any) => {
  const server = await app();
  await server.ready();
  server.server.emit('request', req, res);
};
