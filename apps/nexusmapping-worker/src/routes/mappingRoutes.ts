import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import type { Env, Variables, MapPoint, UpdatePayload, User } from '../types';
import {
	createMapPoint,
	getAllMapPoints,
	getMapPointById,
	updateMapPoint,
	seedDatabase,
	syncUser
} from '../services/mappingService';
import { authMiddleware } from '../middleware/auth';

export const mappingRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const requests = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimiter: MiddlewareHandler = async (c, next) => {
	const ip = c.req.header('cf-connecting-ip') || 'unknown';
	const now = Date.now();
	const userRequests = requests.get(ip) || [];
	const recentRequests = userRequests.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
	if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
		return c.json({ success: false, message: 'Too many requests, please try again later.' }, 429);
	}
	requests.set(ip, [...recentRequests, now]);
	await next();
};

const adminOnly: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
	const user = c.get('user');
	if (user?.role !== 'admin') {
		return c.json({ success: false, message: 'Forbidden: Admin access required.' }, 403);
	}
	await next();
};

const secretKeyMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
	const secret = c.req.header('X-Admin-Secret');
	if (!c.env.DB_RESET_SECRET || secret !== c.env.DB_RESET_SECRET) {
		return c.json({ success: false, message: 'Forbidden: Invalid secret key.' }, 403);
	}
	await next();
};

mappingRoutes.use('/api/*', rateLimiter);

const toPublicMapPoint = (point: MapPoint) => ({
	pointId: point.pointId,
	timestamp: point.timestamp,
	status: point.status,
	description: point.description,
	latitude: point.latitude,
	longitude: point.longitude,
	photoId: point.photoId
});

mappingRoutes.post('/api/users/sync', authMiddleware, async (c) => {
	try {
		const userPayload = c.get('user');
		const user = await syncUser(c.env.DB, c.env, userPayload);
		return c.json({ success: true, user });
	} catch (error: any) {
		console.error('Error in POST /api/users/sync:', error);
		return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
	}
});

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

mappingRoutes.patch('/api/map-points/:pointId', authMiddleware, adminOnly, async (c) => {
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

mappingRoutes.post('/api/seed', authMiddleware, adminOnly, async (c) => {
	try {
		const result = await seedDatabase(c.env.DB);
		return c.json({ success: true, message: `Database seeded successfully with ${result.count} points.` });
	} catch (error: any) {
		console.error('Error in POST /api/seed:', error);
		return c.json({ success: false, message: 'Failed to seed database.' }, 500);
	}
});

mappingRoutes.get('/api/map-points', async (c) => {
	try {
		const points = await getAllMapPoints(c.env.DB);
		const publicPoints = points.map(toPublicMapPoint);
		return c.json({ success: true, points: publicPoints });
	} catch (error: any) {
		console.error('Error in GET /api/map-points:', error);
		return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
	}
});

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
		return c.json({ success: true, point: toPublicMapPoint(point) });
	} catch (error: any) {
		console.error(`Error in GET /api/map-points/${c.req.param('pointId')}:`, error);
		return c.json({ success: false, message: 'An internal server error occurred.' }, 500);
	}
});

mappingRoutes.post('/api/admin/reset-db', secretKeyMiddleware, async (c) => {
	try {
		const result = await seedDatabase(c.env.DB);
		return c.json({ success: true, message: `Sandbox reset successfully with ${result.count} points.` });
	} catch (error: any) {
		console.error('Error in POST /api/admin/reset-db:', error);
		return c.json({ success: false, message: 'Failed to reset sandbox database.' }, 500);
	}
});

mappingRoutes.post('/api/admin/test-cron', secretKeyMiddleware, async (c) => {
	try {
		const result = await seedDatabase(c.env.DB);
		console.log(`Manual cron test successful. Seeded ${result.count} points.`);
		return c.json({ success: true, message: `Manual cron test successful. Seeded ${result.count} points.` });
	} catch (error: any) {
		console.error('Error during manual cron test:', error);
		return c.json({ success: false, message: 'Failed to run manual cron test.' }, 500);
	}
});