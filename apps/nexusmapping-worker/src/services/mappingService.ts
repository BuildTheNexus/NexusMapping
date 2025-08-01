// File: apps/nexusmapping-worker/src/services/mappingService.ts
import type { MapPoint } from '../types';

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