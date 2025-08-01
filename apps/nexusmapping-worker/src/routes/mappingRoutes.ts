// File: apps/nexusmapping-worker/src/routes/mappingRoutes.ts

import { Hono } from 'hono';
import type { Env, Variables, MapPoint } from '../types';
import { createMapPoint, getAllMapPoints, getMapPointById } from '../services/mappingService'; // <-- 1. IMPORT new functions

export const mappingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// --- CREATE ---
// (This is your existing, working POST route)
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

// --- READ (ALL) ---
// 2. ADD this new route to get all map points.
mappingRoutes.get('/api/map-points', async (c) => {
  try {
    const points = await getAllMapPoints(c.env.DB);
    return c.json({ success: true, points: points });
  } catch (error: any) {
    console.error('Error in GET /api/map-points:', error);
    return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
  }
});

// --- READ (ONE) ---
// 3. ADD this new route to get a single map point by its ID.
mappingRoutes.get('/api/map-points/:pointId', async (c) => {
  try {
    const { pointId } = c.req.param();
    if (!pointId) {
      return c.json({ success: false, message: 'Point ID is required.' }, 400);
    }

    const point = await getMapPointById(c.env.DB, pointId);

    if (!point) {
      return c.json({ success: false, message: `Map point with ID ${pointId} not found.` }, 404);
    }

    return c.json({ success: true, point: point });
  } catch (error: any) {
    console.error(`Error in GET /api/map-points/${c.req.param('pointId')}:`, error);
    return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
  }
});