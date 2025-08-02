import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Get the session from the root layout server load function.
	const session = await locals.auth();

	// If there is no session, the user is not authenticated.
	// Immediately redirect them to the login page.
	if (!session?.user) {
		throw redirect(303, '/login');
	}

	// If there is a session, we don't need to return anything here,
	// because the root layout already makes the session available.
	// The primary purpose of this file is simply to run the check above.
};