import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// This function runs for every page. It securely loads the session
	// from the request's cookies using our Auth.js handler.
	// The returned session (or null) is made available to all pages.
	return {
		session: await event.locals.auth()
	};
};