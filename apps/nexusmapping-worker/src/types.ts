// File: apps/nexusmapping-worker/src/types.ts
import type { JWTPayload } from 'jose';

// Defines the Cloudflare environment bindings we expect to be available.
export interface Env {
	DB: D1Database;
	// ADD THIS LINE
	ADMIN_APP_GOOGLE_CLIENT_ID: string;
}

// Defines the shape of an authenticated user. (For future use)
export interface UserPayload extends JWTPayload {
	uid: string;
	email?: string;
}

// Defines the variables passed between middleware. (For future use)
export type Variables = {
	user: UserPayload;
};

// Defines the structure of a report object for our database.
export interface MapPoint {
	pointId: string; // Renamed from reportId
	userId: string;
	timestamp: string;
	status: 'new' | 'in_progress' | 'completed' | 'rejected';
	description: string;
	latitude: number;
	longitude: number;
	accuracy: number;
	address?: string;
	photoId: string; // The ID of the associated image/data
	adminNotes?: string;
}

// ADD THIS NEW TYPE
// Defines the shape of the data for updating a map point.
export interface UpdatePayload {
	status?: MapPoint['status'];
	adminNotes?: string;
}