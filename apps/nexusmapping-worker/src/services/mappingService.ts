import type { MapPoint, UpdatePayload, User, UserPayload, Env } from '../types';

export async function createMapPoint(
	db: D1Database,
	pointData: Omit<MapPoint, 'pointId' | 'timestamp' | 'status'>
): Promise<MapPoint> {
	const newPoint: MapPoint = {
		...pointData,
		pointId: `NEX-PT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
		timestamp: new Date().toISOString(),
		status: 'new'
	};

	const stmt = db.prepare(
		`INSERT INTO map_points (pointId, userId, timestamp, status, description, latitude, longitude, accuracy, address, photoId, adminNotes)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
	);

	await stmt
		.bind(
			newPoint.pointId,
			newPoint.userId,
			newPoint.timestamp,
			newPoint.status,
			newPoint.description,
			newPoint.latitude,
			newPoint.longitude,
			newPoint.accuracy,
			newPoint.address ?? null,
			newPoint.photoId,
			newPoint.adminNotes ?? null
		)
		.run();

	return newPoint;
}

export async function getAllMapPoints(db: D1Database): Promise<MapPoint[]> {
	try {
		const stmt = db.prepare('SELECT * FROM map_points ORDER BY timestamp DESC');
		const { results } = await stmt.all<MapPoint>();
		return results;
	} catch (error) {
		console.error('D1 Database Error in getAllMapPoints:', error);
		throw new Error('Failed to fetch map points from the database.');
	}
}

export async function getMapPointById(db: D1Database, pointId: string): Promise<MapPoint | null> {
	try {
		const stmt = db.prepare('SELECT * FROM map_points WHERE pointId = ?1');
		const result = await stmt.bind(pointId).first<MapPoint>();
		return result;
	} catch (error) {
		console.error(`D1 Database Error in getMapPointById for ID ${pointId}:`, error);
		throw new Error('Failed to fetch map point from the database.');
	}
}

export async function updateMapPoint(
	db: D1Database,
	pointId: string,
	payload: UpdatePayload
): Promise<{ success: boolean; message?: string }> {
	const fields = [];
	const values = [];
	let paramIndex = 1;

	if (payload.status) {
		fields.push(`status = ?${paramIndex}`);
		values.push(payload.status);
		paramIndex++;
	}

	if (payload.adminNotes !== undefined) {
		fields.push(`adminNotes = ?${paramIndex}`);
		values.push(payload.adminNotes);
		paramIndex++;
	}

	if (fields.length === 0) {
		return { success: false, message: 'No fields to update.' };
	}

	values.push(pointId);

	const sql = `UPDATE map_points SET ${fields.join(', ')} WHERE pointId = ?${paramIndex}`;

	try {
		const stmt = db.prepare(sql);
await stmt.bind(...values).run();
		return { success: true };
	} catch (error) {
		console.error(`D1 Database Error in updateMapPoint for ID ${pointId}:`, error);
		throw new Error('Failed to update map point in the database.');
	}
}

export async function seedDatabase(db: D1Database): Promise<{ count: number }> {
	const seedLocations = [
		{ name: 'Tenau Harbour Vicinity, Kupang', lat: -10.2, lon: 123.55 },
		{ name: 'Soe City Center', lat: -9.86, lon: 124.28 },
		{ name: 'Kefamenanu Town Square', lat: -9.44, lon: 124.47 },
		{ name: 'Atambua Main Market Area', lat: -9.1, lon: 124.89 }
	];

	const statuses: MapPoint['status'][] = ['new', 'in_progress', 'completed', 'rejected'];
	const pointsToInsert: MapPoint[] = [];

	for (const location of seedLocations) {
		for (let i = 0; i < 15; i++) {
			const latJitter = (Math.random() - 0.5) * 0.05;
			const lonJitter = (Math.random() - 0.5) * 0.05;

			const point: MapPoint = {
				pointId: `NEX-PT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
				userId: `user-seed-${crypto.randomUUID().slice(0, 4)}`,
				timestamp: new Date().toISOString(),
				status: statuses[Math.floor(Math.random() * statuses.length)],
				description: `Generated issue near ${location.name} #${i + 1}`,
				latitude: location.lat + latJitter,
				longitude: location.lon + lonJitter,
				accuracy: 5 + Math.random() * 10,
				address: 'Generated Address',
				photoId: `seed-photo-${crypto.randomUUID().slice(0, 8)}`,
				adminNotes: Math.random() > 0.7 ? 'Admin note added for this seed.' : undefined
			};
			pointsToInsert.push(point);
		}
	}

	try {
		await db.prepare('DELETE FROM map_points').run();

		const stmt = db.prepare(
			`INSERT INTO map_points (pointId, userId, timestamp, status, description, latitude, longitude, accuracy, address, photoId, adminNotes)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
		);

		const batch = pointsToInsert.map((p) =>
			stmt.bind(
				p.pointId,
				p.userId,
				p.timestamp,
				p.status,
				p.description,
				p.latitude,
				p.longitude,
				p.accuracy,
				p.address ?? null,
				p.photoId,
				p.adminNotes ?? null
			)
		);

		await db.batch(batch);

		return { count: pointsToInsert.length };
	} catch (error) {
		console.error('D1 Database Error in seedDatabase:', error);
		throw new Error('Failed to seed the database.');
	}
}

export async function syncUser(db: D1Database, env: Env, userPayload: UserPayload): Promise<User> {
	if (!userPayload.sub || !userPayload.email) {
		throw new Error('User payload is missing required fields (sub, email).');
	}

	const stmt = db.prepare('SELECT * FROM users WHERE id = ?1');
	const existingUser = await stmt.bind(userPayload.sub).first<User>();

	if (existingUser) {
		return existingUser;
	}

	const adminEmails = (env.ADMIN_EMAILS || '').split(',').map((e) => e.trim());
	const role = adminEmails.includes(userPayload.email) ? 'admin' : 'viewer';

	const newUser: Omit<User, 'created_at'> = {
		id: userPayload.sub,
		email: userPayload.email,
		name: (userPayload as any).name || null,
		role: role
	};

	const insertStmt = db.prepare(
		'INSERT INTO users (id, email, name, role) VALUES (?1, ?2, ?3, ?4) RETURNING *'
	);
	const createdUser = await insertStmt.bind(newUser.id, newUser.email, newUser.name, newUser.role).first<User>();

	if (!createdUser) {
		throw new Error('Failed to create user during sync operation.');
	}

	return createdUser;
}