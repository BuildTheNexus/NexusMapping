<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<!-- The ModeWatcher component now handles all theme-related logic automatically -->
<ModeWatcher defaultMode="dark" />

{@render children()}