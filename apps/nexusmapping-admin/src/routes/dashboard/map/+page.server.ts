import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ locals }) => {
	// We get the session data that was loaded by our root layout.
	const session = await locals.auth();

	// If a session exists, the user is logged in.
	if (session) {
		// Redirect them to the primary user interface.
		throw redirect(303, '/dashboard/map');
	}

	// If no session exists, send them to the login page.
	throw redirect(303, '/login');
};