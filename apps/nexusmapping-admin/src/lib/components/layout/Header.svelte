<script lang="ts">
	import { page } from '$app/stores';
	import Menu from 'lucide-svelte/icons/menu';
	import LogOut from 'lucide-svelte/icons/log-out';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte'; // Import the new component

	const { session } = $page.data;
</script>

<header
	class="flex h-14 flex-shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6"
>
	<a href="/" class="flex items-center gap-2 font-semibold">
		<!-- ... (logo svg remains the same) ... -->
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="h-6 w-6"
		>
			<path d="M12 2L2 7l10 5 10-5-10-5z" />
			<path d="M2 17l10 5 10-5" />
			<path d="M2 12l10 5 10-5" />
		</svg>
		<span>NexusMapping</span>
	</a>

	{#if session?.user}
		<div class="ml-auto flex items-center gap-2">
			<!-- Gap is reduced from gap-4 to gap-2 for a tighter fit -->
			<span class="hidden text-sm text-muted-foreground sm:inline-block">{session.user.email}</span>

			<!-- ADD THE THEME TOGGLE COMPONENT HERE -->
			<ThemeToggle />

			<form action="/auth/signout" method="POST">
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					class="h-9 w-9 text-muted-foreground transition-colors hover:text-foreground"
					title="Logout"
				>
					<LogOut class="h-5 w-5" />
				</Button>
			</form>

			<button class="rounded-full border w-8 h-8 flex items-center justify-center md:hidden">
				<Menu class="h-5 w-5" />
				<span class="sr-only">Toggle navigation menu</span>
			</button>
		</div>
	{/if}
</header>