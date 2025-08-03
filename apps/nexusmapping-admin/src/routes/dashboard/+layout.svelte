<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<div class="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
	<Header />

	<main class="relative overflow-y-auto">
		{@render children()}
	</main>
</div>