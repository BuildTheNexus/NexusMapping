import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { MapPoint, UpdatePayload } from '../../../../../nexusmapping-worker/src/types';
import { triggerSeed } from '$lib/server/seeding';

const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
	try {
		const response = await fetch(WORKER_API_URL);
		if (!response.ok) {
			return { points: [], error: `API responded with status: ${response.status}` };
		}
		const data: ApiResponse = await response.json();
		if (!data.success || !data.points) {
			return { points: [], error: data.message || 'API error occurred.' };
		}

		const searchQuery = url.searchParams.get('q') || '';
		const statusFilter = url.searchParams.get('status') || '';

		const filteredPoints = data.points.filter((point) => {
			const searchMatch =
				searchQuery.length === 0 ||
				point.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
				point.pointId.toLowerCase().includes(searchQuery.toLowerCase()) ||
				point.address?.toLowerCase().includes(searchQuery.toLowerCase());

			const statusMatch =
				statusFilter.length === 0 || point.status.toLowerCase() === statusFilter.toLowerCase();

			return searchMatch && statusMatch;
		});

		const page = parseInt(url.searchParams.get('page') ?? '1', 10);
		const pageSize = 10;
		const totalItems = filteredPoints.length;
		const totalPages = Math.ceil(totalItems / pageSize);
		const paginatedPoints = filteredPoints.slice((page - 1) * pageSize, page * pageSize);

		return {
			points: paginatedPoints,
			pagination: {
				currentPage: page,
				totalPages,
				totalItems
			},
			searchQuery,
			statusFilter
		};
	} catch (error) {
		return {
			points: [],
			pagination: { currentPage: 1, totalPages: 1, totalItems: 0 },
			error: 'Could not connect to the API worker. Is it running?'
		};
	}
};

export const actions: Actions = {
	updateStatus: async ({ locals, request, fetch }) => {
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
	seed: async ({ locals }) => {
		return await triggerSeed(locals);
	}
};