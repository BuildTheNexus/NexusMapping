// File: apps/nexusmapping-admin/src/app.d.ts
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// --- KAI: ADD THIS ENTIRE BLOCK ---
import type { Session as OriginalSession } from '@auth/core/types';

declare module '@auth/core/types' {
	interface Session extends OriginalSession {
		id_token?: string;
	}
}
// --- END OF ADDITION ---

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			getSession(): Promise<{
				user?: {
					name?: string | null;
					email?: string | null;
					image?: string | null;
				};
				expires: string;
			} | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};