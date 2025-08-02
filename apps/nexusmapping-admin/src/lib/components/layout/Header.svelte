<script lang="ts">
	import { page } from '$app/stores';
	import Menu from 'lucide-svelte/icons/menu';
	import LogOut from 'lucide-svelte/icons/log-out';
	import { Button } from '$lib/components/ui/button'; // Assuming you will port this component

	// The session data is passed down from the root +layout.server.ts
	// to all pages, and is available here via the page store.
	const { session } = $page.data;
</script>

<header class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
	<a href="/" class="flex items-center gap-2 font-semibold">
		<!-- Replace with a real logo later -->
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

	<!-- Hamburger menu will be here for mobile navigation -->
	<div class="ml-auto flex items-center gap-4">
		{#if session?.user}
			<span class="hidden text-sm text-muted-foreground sm:inline-block"
				>{session.user.email}</span
			>
			<form action="/auth/signout" method="POST">
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					class="h-9 w-9 text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Logout"
					title="Logout"
				>
					<LogOut class="h-5 w-5" />
				</Button>
			</form>
		{:else}
			<a href="/login">
				<Button variant="outline">Sign In</Button>
			</a>
		{/if}

		<button class="rounded-full border w-8 h-8 flex items-center justify-center md:hidden">
			<Menu class="h-5 w-5" />
			<span class="sr-only">Toggle navigation menu</span>
		</button>
	</div>
</header>