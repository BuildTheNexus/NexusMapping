import type { Env } from '../types';

export class RateLimiter {
	state: DurableObjectState;
	limit: number;
	windowMs: number;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.limit = 30;
		this.windowMs = 60 * 1000;
	}

	async fetch(request: Request): Promise<Response> {
		const timestamps: number[] = (await this.state.storage.get('timestamps')) || [];

		const now = Date.now();

		const validTimestamps = timestamps.filter((ts) => now - ts < this.windowMs);

		if (validTimestamps.length >= this.limit) {
			return new Response('Too many requests', { status: 429 });
		}

		validTimestamps.push(now);

		await this.state.storage.put('timestamps', validTimestamps);

		return new Response('OK', { status: 200 });
	}
}