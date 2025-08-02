import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// By calling `event.locals.auth()`, we use the handler we configured in `auth.ts`
	// to securely load the session from the request's cookies.
	// This session object is then passed down to all child layouts and pages.
	return {
		session: await event.locals.auth()
	};
};