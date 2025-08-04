import type { Context, Next } from 'hono';
import * as jose from 'jose';
import type { Env, Variables, User, ContextUser } from '../types';

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUER = 'https://accounts.google.com';

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ success: false, message: 'Unauthorized: Missing or invalid token.' }, 401);
	}
	const idToken = authHeader.split('Bearer ')[1];

	try {
		const JWKS = jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

		if (!c.env.ADMIN_APP_GOOGLE_CLIENT_ID) {
			console.error('CRITICAL: ADMIN_APP_GOOGLE_CLIENT_ID is not set in the worker environment.');
			return c.json({ success: false, message: 'Server configuration error.' }, 500);
		}

		const { payload } = await jose.jwtVerify(idToken, JWKS, {
			issuer: GOOGLE_ISSUER,
			audience: c.env.ADMIN_APP_GOOGLE_CLIENT_ID
		});

		if (!payload.sub || typeof payload.email !== 'string') {
			return c.json({ success: false, message: 'Forbidden: Token is missing or has invalid user identifier.' }, 403);
		}

		const stmt = c.env.DB.prepare('SELECT id, email, role FROM users WHERE id = ?1');
		const dbUser = await stmt.bind(payload.sub).first<User>();

		const userContext: ContextUser = {
			...payload,
			uid: payload.sub,
			email: payload.email,
			role: dbUser?.role || 'viewer'
		};

		c.set('user', userContext);
		await next();
	} catch (error: any) {
		console.error('Token verification failed:', error.code || error.message);
		let message = 'Forbidden: Invalid token.';
		if (error.code === 'ERR_JWT_EXPIRED') message = 'Forbidden: Token has expired.';
		if (error.code === 'ERR_JWKS_NO_MATCHING_KEY')
			message = 'Forbidden: Token signature is invalid.';
		return c.json({ success: false, message: message }, 403);
	}
};