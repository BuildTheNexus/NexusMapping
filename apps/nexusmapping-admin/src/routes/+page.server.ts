import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	if (!session) {
		// If the user is not logged in, send them to the dedicated login page.
		throw redirect(303, '/login');
	}

	// If the user IS logged in, send them to the main dashboard.
	// The dashboard's own routing will handle where they land inside.
	throw redirect(303, '/dashboard');
};