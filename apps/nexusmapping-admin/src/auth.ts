// File: apps/nexusmapping-admin/src/auth.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Provider } from '@auth/core/providers';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			// KAI: ADDITION - Ensure we request the id_token scope
			authorization: {
				params: {
					scope: 'openid email profile'
				}
			}
		})
	] as Provider[],
	secret: AUTH_SECRET,

	// --- KAI: ADD THIS ENTIRE `callbacks` BLOCK ---
	callbacks: {
		// This callback is used to add the id_token from the provider to the JWT.
		async jwt({ token, account }) {
			if (account?.id_token) {
				token.id_token = account.id_token;
			}
			return token;
		},
		// This callback is used to add the id_token from the JWT to the session object.
		async session({ session, token }) {
			if (token.id_token && typeof token.id_token === 'string') {
				session.id_token = token.id_token;
			}
			return session;
		},
		// This signIn callback is correct and can remain.
		async signIn({ profile, account }) {
			if (account?.provider === 'google' && profile?.email) {
				console.log(`[auth.ts] Successful sign-in attempt by: ${profile.email}`);
				return true;
			}
			console.log('[auth.ts] Sign-in attempt failed or was not from Google.');
			return false;
		}
	},
	// --- END OF ADDITION ---

	pages: {
		signIn: '/login'
	}
});