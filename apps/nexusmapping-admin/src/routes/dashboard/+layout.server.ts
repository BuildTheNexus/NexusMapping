import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth();

	// If there is no session, the user is not allowed in.
	// Kick them out to the login page.
	if (!session) {
		throw redirect(303, '/login');
	}

	// If a session exists, return it so all child pages
	// in the dashboard can access it.
	return { session };
};