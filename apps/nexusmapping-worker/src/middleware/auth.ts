// File: apps/nexusmapping-worker/src/middleware/auth.ts
import type { Context, Next } from 'hono';
import * as jose from 'jose';
import type { Env, Variables, UserPayload } from '../types';

// This is the public key endpoint for standard Google OIDC tokens.
const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

// This is the issuer for standard Google OIDC tokens.
const GOOGLE_ISSUER = 'https://accounts.google.com';

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return c.json({ success: false, message: 'Unauthorized: Missing or invalid token.' }, 401);
	}
	const idToken = authHeader.split('Bearer ')[1];

	try {
		// Create a JWKS (JSON Web Key Set) from Google's public endpoint.
		// This is used to verify the signature of the token.
		const JWKS = jose.createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

		// We must validate that the token was intended for our specific application.
		// This is done by checking the 'audience' (aud) claim in the token.
		if (!c.env.ADMIN_APP_GOOGLE_CLIENT_ID) {
			console.error('CRITICAL: ADMIN_APP_GOOGLE_CLIENT_ID is not set in the worker environment.');
			return c.json({ success: false, message: 'Server configuration error.' }, 500);
		}

		// Verify the token's signature, issuer, and audience.
		const { payload } = await jose.jwtVerify(idToken, JWKS, {
			issuer: GOOGLE_ISSUER,
			audience: c.env.ADMIN_APP_GOOGLE_CLIENT_ID,
		});

		// Ensure the token contains a user identifier.
		if (!payload.sub) {
			return c.json({ success: false, message: 'Forbidden: Token is missing user identifier.' }, 403);
		}

		// Create a user object from the token's payload.
		const user: UserPayload = {
			uid: payload.sub,
			email: (payload as any).email,
			...payload
		};

		// Set the user object in the context for downstream routes to use.
		c.set('user', user);
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