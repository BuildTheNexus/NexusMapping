<script lang="ts">
	import Header from '$lib/components/layout/Header.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';

	let { children, data } = $props();
</script>

<div class="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
	<Header {data} />

	<main class="relative overflow-y-auto">
		<div class="p-4 sm:p-6">
			{@render children()}
		</div>
		<footer class="flex items-center justify-center p-4 sm:p-6">
			<Footer />
		</footer>
	</main>
</div>