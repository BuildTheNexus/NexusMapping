import type { PageServerLoad } from './$types';
import type { MapPoint } from '../../../nexusmapping-worker/src/types'; // We can share types!

// The URL of our running worker API
const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async () => {
	console.log('Fetching map points for the admin dashboard...');
	try {
		const response = await fetch(WORKER_API_URL);

		if (!response.ok) {
			console.error(`API Error: ${response.status} ${response.statusText}`);
			return {
				error: `Failed to load map data. Server responded with status: ${response.status}`
			};
		}

		const data: ApiResponse = await response.json();

		if (!data.success || !data.points) {
			return { error: data.message || 'API returned an unsuccessful response.' };
		}

		console.log(`Successfully fetched ${data.points.length} map points.`);
		return {
			points: data.points
		};
	} catch (error) {
		console.error('Network Error fetching map points:', error);
		// This error is crucial for development, as it tells us if the worker isn't running.
		return {
			error: 'Could not connect to the API worker. Is it running?'
		};
	}
};