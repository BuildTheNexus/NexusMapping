// This file exports the authentication handler from our auth.ts configuration.
// SvelteKit automatically runs this code for every request made to the server,
// effectively making our authentication system active across the entire application.
export { handle } from './auth';