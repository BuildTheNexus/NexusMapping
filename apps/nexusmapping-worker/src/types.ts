import type { JWTPayload } from 'jose';

// Defines the Cloudflare environment bindings we expect to be available.
export interface Env {
  DB: D1Database;
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