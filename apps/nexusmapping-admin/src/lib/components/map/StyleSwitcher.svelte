<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export type MapStyle = {
		name: string;
		url: string;
	};

	let {
		styles,
		currentStyleUrl
	}: { styles: MapStyle[]; currentStyleUrl: string } = $props();

	const dispatch = createEventDispatcher<{ styleChange: string }>();

	function selectStyle(url: string) {
		dispatch('styleChange', url);
	}
</script>

<div
	class="absolute top-2.5 left-2.5 z-10 flex rounded-md border border-border bg-background/80 p-0.5 shadow-lg backdrop-blur-sm"
>
	{#each styles as style}
		<button
			onclick={() => selectStyle(style.url)}
			class="px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
			class:bg-primary={currentStyleUrl === style.url}
			class:text-primary-foreground={currentStyleUrl === style.url}
			class:text-foreground={currentStyleUrl !== style.url}
			class:hover:bg-muted={currentStyleUrl !== style.url}
			class:rounded-md={styles.length === 1}
			class:first:rounded-l-md={styles.length > 1}
			class:last:rounded-r-md={styles.length > 1}
		>
			{style.name}
		</button>
	{/each}
</div>