<!-- File: apps/nexusmapping-admin/src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	// --- KAI: 1. IMPORT THE `navigating` STORE ---
	import { navigating } from '$app/stores';

	let { children } = $props();
</script>

<!-- The ModeWatcher component now handles all theme-related logic automatically -->
<ModeWatcher defaultMode="dark" />

<!-- KAI: 2. ADD THE GLOBAL LOADING INDICATOR -->
{#if $navigating}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-8 w-8 animate-spin text-primary"
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	</div>
{/if}

{@render children()}