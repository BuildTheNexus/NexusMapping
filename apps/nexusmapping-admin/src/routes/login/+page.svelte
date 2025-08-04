<script lang="ts">
	import Google from '@lucide/svelte/icons/log-in';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';

	let videoEl: HTMLVideoElement;

	onMount(() => {
		if (videoEl) {
			const source = videoEl.getAttribute('data-src');
			if (source) {
				videoEl.src = source;
			}
		}
	});
</script>

<div class="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
	<!-- Login Panel -->
	<div class="flex items-center justify-center p-8 lg:py-16">
		<Card.Root class="w-full max-w-sm">
			<Card.Header class="space-y-2 text-center">
				<Card.Title class="text-2xl">Admin Login</Card.Title>
				<Card.Description>
					Mapping Insights, Driving Decisions.
					<br class="hidden sm:block" />
					
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form action="/auth/signin/google" method="POST" class="mt-2">
					<Button type="submit" class="w-full" variant="outline">
						<Google class="mr-2 h-4 w-4" />
						Sign In with Google
					</Button>
				</form>
				<p class="mt-4 px-8 text-center text-xs text-muted-foreground">
					By signing in, you agree to our
					<a href="/privacy" target="_blank" class="underline hover:text-primary">Privacy Policy</a>
					and allow data collection.
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Showcase Panel -->
	<div class="flex flex-col items-center justify-center gap-8 bg-showcase p-12">
		<a href="/" class="flex items-center gap-3 font-semibold text-foreground">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-7 w-7"
			>
				<path d="M12 2L2 7l10 5 10-5-10-5z" />
				<path d="M2 17l10 5 10-5" />
				<path d="M2 12l10 5 10-5" />
			</svg>
			<span class="text-xl">Nexus Mapping</span>
		</a>
		<div
			class="relative w-64 overflow-hidden rounded-2xl shadow-2xl aspect-[9/16] border"
		>
			<video
				bind:this={videoEl}
				data-src="/showcase-nexus-mapping.webm"
				class="absolute inset-0 h-full w-full object-contain"
				autoplay
				loop
				muted
				playsinline
				preload="metadata"
			>
				Your browser does not support the video tag.
			</video>
		</div>
	</div>
</div>