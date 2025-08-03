<script lang="ts">
	import Sun from "@lucide/svelte/icons/sun";
	import Moon from "@lucide/svelte/icons/moon";
	import { Button } from '$lib/components/ui/button';
	import { toggleMode, mode } from 'mode-watcher';

	// The `mode` object is reactive, but not a store. We access its
	// value via the `.current` property.
</script>

<Button
	onclick={toggleMode}
	variant="ghost"
	size="icon"
	class="h-9 w-9 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
	aria-label="Toggle theme"
	title="Toggle theme"
>

	{#if mode.current === 'light'}
		<Sun class="h-5 w-5" />
	{:else}
		<Moon class="h-5 w-5" />
	{/if}
</Button>