// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
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