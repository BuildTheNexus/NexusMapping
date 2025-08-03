// File: apps/nexusmapping-admin/src/routes/dashboard/data/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { MapPoint, UpdatePayload } from '../../../../../nexusmapping-worker/src/types';
import { triggerSeed } from '$lib/server/seeding'; // <-- KAI: IMPORT THE NEW MODULE

const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
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

export const actions: Actions = {
	updateStatus: async ({ locals, request }) => {
		const session = await locals.auth();
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
					Authorization: `Bearer ${session.id_token}`
				},
				body: JSON.stringify(payload)
			});
			if (!response.ok) {
				const errorBody = (await response.json()) as { message?: string };
				return fail(response.status, {
					success: false,
					message: errorBody.message || 'An unknown API error occurred.'
				});
			}
			return { success: true, message: 'Status updated successfully!' };
		} catch (error) {
			console.error('Error in updateStatus action:', error);
			return fail(500, { success: false, message: 'A network error occurred.' });
		}
	},

	// --- KAI: THIS ACTION IS NOW CLEAN AND REFACTORED ---
	seed: async ({ locals }) => {
		return await triggerSeed(locals);
	}
};