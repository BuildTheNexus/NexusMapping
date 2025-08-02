// File: apps/nexusmapping-admin/src/routes/dashboard/data/+page.server.ts
import { fail } from '@sveltejs/kit'; // <-- 1. IMPORT fail
import type { PageServerLoad, Actions } from './$types'; // <-- 2. IMPORT Actions
import type { MapPoint, UpdatePayload } from '../../../../../nexusmapping-worker/src/types';

const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async () => {
	try {
		const response = await fetch(WORKER_API_URL);
		if (!response.ok) {
			return { points: [], error: `API responded with status: ${response.status}` };
		}
		const data: ApiResponse = await response.json();
		if (!data.success || !data.points) {
			return { points: [], error: data.message || 'API error occurred.' };
		}
		return { points: data.points };
	} catch (error) {
		return { points: [], error: 'Could not connect to the API worker. Is it running?' };
	}
};

// 3. ADD THIS ENTIRE `actions` EXPORT
export const actions: Actions = {
	updateStatus: async ({ locals, request }) => {
		const session = await locals.auth();
		// Our middleware in the worker will do the heavy lifting, but we can do a preliminary check here.
		if (!session?.user) {
			return fail(401, { success: false, message: 'Unauthorized' });
		}

		const formData = await request.formData();
		const pointId = formData.get('pointId');
		const status = formData.get('status');

		if (!pointId || !status) {
			return fail(400, { success: false, message: 'Point ID and status are required.' });
		}

		try {
			const payload: UpdatePayload = { status: status as MapPoint['status'] };

			const response = await fetch(`${WORKER_API_URL}/${pointId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					// We forward the user's ID token to the worker for secure authentication.
					Authorization: `Bearer ${session.id_token}`
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				// KAI: FIX - We now safely cast the unknown error body to a known shape.
				const errorBody = (await response.json()) as { message?: string };
				return fail(response.status, { success: false, message: errorBody.message || 'An unknown API error occurred.' });
			}


			// On success, return a success message. SvelteKit will make this available to the UI.
			return { success: true, message: 'Status updated successfully!' };
		} catch (error) {
			console.error('Error in updateStatus action:', error);
			return fail(500, { success: false, message: 'A network error occurred.' });
		}
	}
};