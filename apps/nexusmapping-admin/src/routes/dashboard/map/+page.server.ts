import type { PageServerLoad } from './$types';
import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';
import { MAPTILER_API_KEY } from '$env/static/private';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	try {
		if (!platform?.env.nexusmapping_worker) {
			throw new Error('API service binding not found.');
		}

		const response = await platform.env.nexusmapping_worker.fetch('https://api.internal/api/map-points');

		if (!response.ok) {
			return {
				points: [],
				error: `API responded with status: ${response.status}`
			};
		}

		const data: ApiResponse = await response.json();

		if (!data.success || !data.points) {
			return { points: [], error: data.message || 'API error.' };
		}

		const summary: Record<string, number> = {
			new: 0,
			in_progress: 0,
			completed: 0,
			rejected: 0
		};

		for (const point of data.points) {
			if (point.status in summary) {
				summary[point.status]++;
			}
		}

		return {
			points: data.points,
			maptilerKey: MAPTILER_API_KEY,
			summary
		};
	} catch (error: any) {
		return {
			points: [],
			error: error.message || 'Could not connect to the API worker.'
		};
	}
};