import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Provider } from '@auth/core/providers';

export const { handle, signIn, signOut } = SvelteKitAuth({
	// This property is crucial for Cloudflare deployments. It tells Auth.js
	// to trust the host header provided by Cloudflare's proxy.
	trustHost: true,

	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
	] as Provider[],

	// The secret is used to encrypt the session cookie.
	secret: AUTH_SECRET,

	callbacks: {
		// For our public portfolio, we will allow any user with a valid Google
		// account to sign in. We will handle authorization (admin vs. viewer)
		// in a later phase inside our application logic.
		async signIn({ profile, account }) {
			if (account?.provider === 'google' && profile?.email) {
				console.log(`[auth.ts] Successful sign-in attempt by: ${profile.email}`);
				return true; // Allow any Google user to sign in
			}
			console.log('[auth.ts] Sign-in attempt failed or was not from Google.');
			return false; // Deny sign-in for other cases
		}
	},

	pages: {
		// We will redirect users to our custom login page.
		signIn: '/login'
	}
});