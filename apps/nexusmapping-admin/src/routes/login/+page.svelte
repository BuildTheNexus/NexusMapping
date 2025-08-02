<script lang="ts">
	
	import Google from 'lucide-svelte/icons/log-in';
</script>

<div class="flex min-h-screen w-full items-center justify-center bg-muted/40">
	<div
		class="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm"
	>
		<div class="flex flex-col space-y-2 text-center">
			<h1 class="text-2xl font-semibold tracking-tight">NexusMapping Admin</h1>
			<p class="text-sm text-muted-foreground">Sign in to continue</p>
		</div>

		<form action="/auth/signin/google" method="POST" class="mt-6">
			<button
				type="submit"
				class="inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
			>
				<Google class="h-4 w-4" />
				Sign In with Google
			</button>
		</form>
	</div>
</div>