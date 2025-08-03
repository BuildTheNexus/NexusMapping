<!-- File: apps/nexusmapping-admin/src/routes/dashboard/+layout.svelte -->
<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<!-- 
  KAI: This is the definitive layout for our entire dashboard.
  The CSS Grid ensures the Header has its own space and the main content
  fills the rest of the screen without overlap.
-->
<div class="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
	<Header />

	<!-- The main content area where child pages like /map and /data will be rendered -->
	<main class="relative overflow-hidden">
		{@render children()}
	</main>
</div>