// File: apps/nexusmapping-worker/src/index.ts
import { Hono } from 'hono';
import { mappingRoutes } from './routes/mappingRoutes';

const app = new Hono();

app.get('/', (c) => c.text('NexusMapping Worker API is running!'));

app.route('/', mappingRoutes);

export default app;