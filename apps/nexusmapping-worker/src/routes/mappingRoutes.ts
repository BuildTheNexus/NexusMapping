// File: apps/nexusmapping-worker/src/routes/mappingRoutes.ts

import { Hono } from 'hono';
import type { Env, Variables, MapPoint, UpdatePayload } from '../types'; // <-- 1. IMPORT UpdatePayload
import {
	createMapPoint,
	getAllMapPoints,
	getMapPointById,
	updateMapPoint, // <-- 2. IMPORT updateMapPoint
} from '../services/mappingService';
import { authMiddleware } from '../middleware/auth'; // <-- 3. IMPORT authMiddleware

export const mappingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// --- CREATE ---
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

// 4. ADD THIS ENTIRE NEW ROUTE
// --- UPDATE ---
mappingRoutes.patch('/api/map-points/:pointId', authMiddleware, async (c) => {
	try {
		const { pointId } = c.req.param();
		if (!pointId) {
			return c.json({ success: false, message: 'Point ID is required.' }, 400);
		}

		const payload = await c.req.json<UpdatePayload>();
		if (!payload.status && payload.adminNotes === undefined) {
			return c.json(
				{ success: false, message: 'At least a status or adminNotes must be provided.' },
				400
			);
		}

		const result = await updateMapPoint(c.env.DB, pointId, payload);

		if (!result.success) {
			return c.json({ success: false, message: result.message || 'Update failed.' }, 500);
		}

		return c.json({ success: true, message: `Point ${pointId} updated.` });
	} catch (error: any) {
		console.error(`Error in PATCH /api/map-points/${c.req.param('pointId')}:`, error);
		return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
	}
});

// --- READ (ALL) ---
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