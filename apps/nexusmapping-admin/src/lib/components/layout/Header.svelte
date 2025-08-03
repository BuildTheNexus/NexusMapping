<script lang="ts">
	import { page } from '$app/stores';
	import Menu from '@lucide/svelte/icons/menu';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { Button } from '$lib/components/ui/button';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { isMobileMenuOpen } from '$lib/stores/navigation';
	import { Separator } from '$lib/components/ui/separator';
	import Map from '@lucide/svelte/icons/map';
	import Table from '@lucide/svelte/icons/table-2';

	let { data } = $props();
</script>

<header
	class="flex h-14 flex-shrink-0 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6"
>
	<a href="/" class="flex items-center gap-2 font-semibold">
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
		<span class="hidden md:inline-block">Nexus Mapping</span>
	</a>

	<nav class="hidden md:flex md:gap-2">
		<Button
			variant={$page.url.pathname.startsWith('/dashboard/map') ? 'secondary' : 'link'}
			href="/dashboard/map"
			class="text-muted-foreground hover:text-foreground"
		>
			Map
		</Button>
		<Button
			variant={$page.url.pathname.startsWith('/dashboard/data') ? 'secondary' : 'link'}
			href="/dashboard/data"
			class="text-muted-foreground hover:text-foreground"
		>
			Data
		</Button>
	</nav>

	{#if data.session?.user}
		<div class="ml-auto flex items-center gap-2">
			<span class="hidden text-sm text-muted-foreground sm:inline-block"
				>{data.session.user.email}</span
			>
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

			<div class="md:hidden">
				<Button
					variant="ghost"
					size="icon"
					onclick={() => ($isMobileMenuOpen = !$isMobileMenuOpen)}
				>
					<Menu class="h-5 w-5" />
					<span class="sr-only">Toggle navigation menu</span>
				</Button>

				<Sheet.Root bind:open={$isMobileMenuOpen}>
					<Sheet.Content side="left" class="p-4">
						<div class="flex h-14 items-center justify-center">
							<a href="/" class="flex items-center justify-center gap-2 font-semibold">
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
								<span>Nexus Mapping</span>
							</a>
						</div>
						<Separator class="my-2" />
						<nav class="grid gap-2 text-lg font-medium">
							<a
								href="/dashboard/map"
								class="flex items-center gap-4 rounded-lg px-4 py-2 text-muted-foreground transition-all hover:text-primary"
								class:text-primary={$page.url.pathname.startsWith('/dashboard/map')}
								onclick={() => ($isMobileMenuOpen = false)}
							>
								<Map class="h-5 w-5" />
								Map</a
							>
							<a
								href="/dashboard/data"
								class="flex items-center gap-4 rounded-lg px-4 py-2 text-muted-foreground transition-all hover:text-primary"
								class:text-primary={$page.url.pathname.startsWith('/dashboard/data')}
								onclick={() => ($isMobileMenuOpen = false)}
							>
								<Table class="h-5 w-5" />
								Data</a
							>
						</nav>
					</Sheet.Content>
				</Sheet.Root>
			</div>
		</div>
	{/if}
</header>