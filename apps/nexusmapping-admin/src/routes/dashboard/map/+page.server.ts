import type { PageServerLoad } from './$types';
import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';

const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async () => {
	// We don't need to check for a session here, the layout guard handles it.
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

		return { points: data.points };
	} catch (error) {
		return {
			points: [],
			error: 'Could not connect to the API worker. Is it running?'
		};
	}
};