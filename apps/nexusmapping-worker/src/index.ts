import { Hono } from 'hono';
import { mappingRoutes } from './routes/mappingRoutes';
import { seedDatabase } from './services/mappingService';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.text('Nexus Mapping Worker API is running!'));

app.route('/', mappingRoutes);

export default {
	fetch: app.fetch,

	async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
		console.log(`Cron trigger fired at ${new Date(event.scheduledTime)}`);
		try {
			const result = await seedDatabase(env.DB);
			console.log(
				`Successfully reset sandbox database via cron trigger. Seeded ${result.count} points.`
			);
		} catch (error) {
			console.error('Error during scheduled database seed:', error);
		}
	}
};