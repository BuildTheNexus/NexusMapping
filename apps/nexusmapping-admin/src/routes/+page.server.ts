import type { PageServerLoad } from './$types';
import type { MapPoint } from '../../../nexusmapping-worker/src/types';

// The URL of our running worker API
const WORKER_API_URL = 'http://127.0.0.1:8788/api/map-points';

interface ApiResponse {
	success: boolean;
	points?: MapPoint[];
	message?: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	// First, check if a session exists. This was loaded by the root layout.
	const session = await locals.auth();

	// If there is no session, the user is not logged in.
	// We simply return an empty state. We DO NOT redirect here.
	if (!session) {
		return {
			points: [],
			session: null
		};
	}

	// If a session DOES exist, we proceed to fetch the map data.
	try {
		console.log('Session found, fetching map points for the dashboard...');
		const response = await fetch(WORKER_API_URL);

		if (!response.ok) {
			console.error(`API Error: ${response.status} ${response.statusText}`);
			return {
				points: [],
				session,
				error: `Failed to load map data. Server responded with status: ${response.status}`
			};
		}

		const data: ApiResponse = await response.json();

		if (!data.success || !data.points) {
			return { points: [], session, error: data.message || 'API returned an unsuccessful response.' };
		}

		console.log(`Successfully fetched ${data.points.length} map points.`);
		return {
			points: data.points,
			session
		};
	} catch (error) {
		console.error('Network Error fetching map points:', error);
		return {
			points: [],
			session,
			error: 'Could not connect to the API worker. Is it running?'
		};
	}
};