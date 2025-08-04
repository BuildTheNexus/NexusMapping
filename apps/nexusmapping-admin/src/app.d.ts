import type { Session as OriginalSession, User as OriginalUser } from '@auth/core/types';

declare module '@auth/core/types' {
	interface Session extends OriginalSession {
		id_token?: string;
		user?: {
			id?: string | null;
			role?: 'admin' | 'viewer' | null;
		} & OriginalUser;
	}

	interface User extends OriginalUser {
		role?: 'admin' | 'viewer' | null;
	}
}

declare global {
	namespace App {
		interface Locals {
			getSession(): Promise<Session | null>;
		}

		// v-- ADD THIS ENTIRE INTERFACE --v
		interface Platform {
			env: {
				nexusmapping_worker: Fetcher;
			};
			context: {
				waitUntil(promise: Promise<any>): void;
			};
			caches: CacheStorage & { default: Cache };
		}
	}
}

export {};