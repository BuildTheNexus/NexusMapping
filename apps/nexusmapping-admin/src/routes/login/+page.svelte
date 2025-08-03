<!-- File: apps/nexusmapping-admin/src/routes/login/+page.svelte -->
<script lang="ts">
	import Google from "@lucide/svelte/icons/log-in";
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
</script>

<!-- KAI: Use the same background as the main app for consistency -->
<div class="flex min-h-screen w-full items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header class="space-y-2 text-center">
			<Card.Title class="text-2xl">NexusMapping Admin</Card.Title>
			<Card.Description>Sign in to continue</Card.Description>
		</Card.Header>
		<Card.Content>
			<form action="/auth/signin/google" method="POST" class="mt-2">
				<Button type="submit" class="w-full" variant="outline">
					<Google class="mr-2 h-4 w-4" />
					Sign In with Google
				</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>