// File: apps/nexusmapping-worker/src/routes/mappingRoutes.ts
import { Hono } from 'hono';
import type { Env, Variables, MapPoint } from '../types';
import { createMapPoint } from '../services/mappingService';

export const mappingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

mappingRoutes.post('/api/map-points', async (c) => {
  try {
    const body = await c.req.json<Omit<MapPoint, 'pointId' | 'timestamp' | 'status'>>();
    if (!body.userId || !body.description || !body.photoId) {
      return c.json({ success: false, message: 'Missing required fields.' }, 400);
    }
    const newPoint = await createMapPoint(c.env.DB, body);
    return c.json({ success: true, point: newPoint }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
  }
});