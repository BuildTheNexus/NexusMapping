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
			authorization: {
				params: {
					scope: 'openid email profile'
				}
			}
		})
	] as Provider[],
	secret: AUTH_SECRET,

	// --- KAI: THIS BLOCK IS NOW FILLED WITH DIAGNOSTIC LOGS ---
	callbacks: {
		// This callback is used to add the id_token from the provider to the JWT.
		async jwt({ token, account }) {
			console.log('--- JWT CALLBACK ---');
			console.log('Initial token:', token);
			// The `account` object is only available on the initial sign-in.
			console.log('Account object (available on sign-in only):', account);

			if (account?.id_token) {
				console.log('✅ id_token FOUND in account object. Adding to JWT.');
				token.id_token = account.id_token;
			} else {
				console.log('❌ id_token NOT FOUND in account object.');
			}
			console.log('Final token:', token);
			console.log('--- END JWT CALLBACK ---');
			return token;
		},
		// This callback is used to add the id_token from the JWT to the session object.
		async session({ session, token }) {
			console.log('--- SESSION CALLBACK ---');
			console.log('Token received by session callback:', token);
			if (token.id_token && typeof token.id_token === 'string') {
				console.log('✅ id_token FOUND in token. Adding to session.');
				session.id_token = token.id_token;
			} else {
				console.log('❌ id_token NOT FOUND in token.');
			}
			console.log('Final session object:', session);
			console.log('--- END SESSION CALLBACK ---');
			return session;
		},
		async signIn({ profile, account }) {
			console.log(`[auth.ts] signIn callback triggered for: ${profile?.email}`);
			return true;
		}
	},
	// --- END OF MODIFICATION ---

	pages: {
		signIn: '/login'
	}
});