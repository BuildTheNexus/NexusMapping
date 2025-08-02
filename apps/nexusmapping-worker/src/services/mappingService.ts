// File: apps/nexusmapping-worker/src/services/mappingService.ts
import type { MapPoint, UpdatePayload } from '../types'; // <-- 1. IMPORT UpdatePayload

export async function createMapPoint(
  db: D1Database,
  pointData: Omit<MapPoint, 'pointId' | 'timestamp' | 'status'>
): Promise<MapPoint> {
  const newPoint: MapPoint = {
    ...pointData,
    pointId: `NEX-PT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, // New prefix
    timestamp: new Date().toISOString(),
    status: 'new',
  };

  const stmt = db.prepare(
    // Updated table name to map_points and column pointId
    `INSERT INTO map_points (pointId, userId, timestamp, status, description, latitude, longitude, accuracy, address, photoId, adminNotes) 
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`
  );

  await stmt.bind(
    newPoint.pointId, newPoint.userId, newPoint.timestamp, newPoint.status,
    newPoint.description, newPoint.latitude, newPoint.longitude,
    newPoint.accuracy, newPoint.address ?? null, newPoint.photoId,
    newPoint.adminNotes ?? null
  ).run();

  return newPoint;
}

/**
 * Retrieves all map points from the database.
 * @param db The D1Database instance.
 * @returns A promise that resolves to an array of MapPoint objects.
 */
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

/**
 * Retrieves a single map point by its ID.
 * @param db The D1Database instance.
 * @param pointId The ID of the point to retrieve.
 * @returns A promise that resolves to a MapPoint object, or null if not found.
 */
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

// 2. ADD THIS ENTIRE NEW FUNCTION
/**
 * Updates a map point in the database.
 * @param db The D1Database instance.
 * @param pointId The ID of the point to update.
 * @param payload The data to update (status and/or adminNotes).
 * @returns A promise that resolves to a success indicator.
 */
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

	values.push(pointId); // For the WHERE clause

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