import type { JWTPayload } from 'jose';

export interface Env {
	DB: D1Database;
	RATE_LIMITER: DurableObjectNamespace;
	ADMIN_APP_GOOGLE_CLIENT_ID: string;
	ADMIN_EMAILS: string;
	DB_RESET_SECRET: string;
}

export interface UserPayload extends JWTPayload {
	uid: string;
	email?: string;
}

export interface ContextUser extends UserPayload {
	role: 'admin' | 'viewer';
}

export type Variables = {
	user: ContextUser;
};

export interface MapPoint {
	pointId: string;
	userId: string;
	timestamp: string;
	status: 'new' | 'in_progress' | 'completed' | 'rejected';
	description: string;
	latitude: number;
	longitude: number;
	accuracy: number;
	address?: string;
	photoId: string;
	adminNotes?: string;
}

export interface UpdatePayload {
	status?: MapPoint['status'];
	adminNotes?: string;
}

export interface User {
	id: string;
	email: string;
	name?: string | null;
	role: 'admin' | 'viewer';
	created_at: string;
}