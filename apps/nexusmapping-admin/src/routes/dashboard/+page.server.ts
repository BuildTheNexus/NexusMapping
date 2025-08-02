import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// This page's only job is to redirect to the default dashboard view.
	throw redirect(303, '/dashboard/map');
};