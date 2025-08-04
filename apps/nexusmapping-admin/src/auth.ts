import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import type { Provider } from '@auth/core/providers';
import { env as privateEnv } from '$env/dynamic/private';

const WORKER_URL = privateEnv.WORKER_URL || 'http://127.0.0.1:8788';

interface SyncUserResponse {
	success: boolean;
	user?: {
		id: string;
		role: 'admin' | 'viewer';
	};
	message?: string;
}

function isSyncUserResponse(data: unknown): data is SyncUserResponse {
	return (
		typeof data === 'object' &&
		data !== null &&
		'success' in data &&
		(data as SyncUserResponse).success === true &&
		'user' in data &&
		typeof (data as SyncUserResponse).user === 'object'
	);
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			authorization: { params: { scope: 'openid email profile' } }
		})
	] as Provider[],
	secret: AUTH_SECRET,
	callbacks: {
		async jwt({ token, account }) {
			if (account?.id_token) {
				token.id_token = account.id_token;

				try {
					const response = await fetch(`${WORKER_URL}/api/users/sync`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${account.id_token}`
						}
					});

					if (!response.ok) {
						throw new Error(`API responded with status: ${response.status}`);
					}

					const responseData = await response.json();

					if (isSyncUserResponse(responseData) && responseData.user) {
						token.role = responseData.user.role;
						token.uid = responseData.user.id;
					} else {
						throw new Error('Invalid response structure from sync API.');
					}
				} catch (error) {
					console.error('Error syncing user:', error);
					token.role = 'viewer';
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (token.id_token && typeof token.id_token === 'string') {
				session.id_token = token.id_token;
			}
			if (session.user) {
				session.user.role = (token.role as 'admin' | 'viewer') || 'viewer';
				session.user.id = token.uid as string;
			}
			return session;
		}
	},
	pages: {
		signIn: '/login'
	}
});