// File: apps/nexusmapping-admin/src/lib/server/seeding.ts
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from '../../routes/$types'; // A way to get the Locals type

const SEED_API_URL = 'http://127.0.0.1:8788/api/seed';

/**
 * A dedicated function to trigger the database seed process.
 * It encapsulates the logic of authenticating and calling the worker API.
 * @param locals - The SvelteKit locals object, containing the session.
 * @returns A result object indicating success or failure.
 */
export async function triggerSeed(locals: App.Locals) {
	const session = await locals.auth();
	if (!session?.user || !session.id_token) {
		return fail(401, {
			success: false,
			message: 'Unauthorized. The session token is missing. Please log out and log in again.'
		});
	}

	try {
		const response = await fetch(SEED_API_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${session.id_token}`
			}
		});

		if (!response.ok) {
			const errorBody = (await response.json()) as { message?: string };
			return fail(response.status, {
				success: false,
				message: `Seeding failed: ${errorBody.message || 'Unknown API error'}`
			});
		}

		const result = (await response.json()) as { message?: string };
		return { success: true, message: result.message || 'Database seeded!' };
	} catch (error) {
		console.error('Error in triggerSeed function:', error);
		return fail(500, { success: false, message: 'A network error occurred.' });
	}
}