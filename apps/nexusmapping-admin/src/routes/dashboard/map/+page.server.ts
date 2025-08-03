import type { PageServerLoad } from './$types';
import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';
import { MAPTILER_API_KEY } from '$env/static/private';

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
			return {
				points: [],
				error: `API responded with status: ${response.status}`
			};
		}

		const data: ApiResponse = await response.json();

		if (!data.success || !data.points) {
			return { points: [], error: data.message || 'API error.' };
		}

		// --- KAI: ADD THIS SUMMARY CALCULATION LOGIC ---
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
		// --- END OF ADDITION ---

		return {
			points: data.points,
			maptilerKey: MAPTILER_API_KEY,
			summary // <-- Pass the calculated summary to the page
		};
	} catch (error) {
		return {
			points: [],
			error: 'Could not connect to the API worker. Is it running?'
		};
	}
};