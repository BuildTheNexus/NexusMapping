import { createAuthHelpers } from './auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => {
	const workerFetcher = event.platform?.env.nexusmapping_worker;
	const { handle: authHandle } = createAuthHelpers(workerFetcher);
	return authHandle({ event, resolve });
};