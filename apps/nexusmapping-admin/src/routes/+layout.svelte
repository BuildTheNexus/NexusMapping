<script lang="ts">
	import '../app.css'; // This imports our Tailwind CSS styles
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen w-full flex-col">
	<Header />
	<main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
		{@render children()}
	</main>
</div>