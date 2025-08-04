<script lang="ts">
	import * as Card from '$lib/components/ui/card';
</script>

<div class="container mx-auto max-w-4xl p-4 py-8 sm:p-8">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-3xl">Privacy Policy</Card.Title>
			<Card.Description>Last Updated: August 4, 2025</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4 text-muted-foreground">
			<p>
				Welcome to Nexus Mapping ("we," "our," or "us"). We are committed to protecting your
				privacy. This Privacy Policy explains how we collect, use, and safeguard your information
				when you use our application.
			</p>

			<h2 class="pt-4 text-xl font-semibold text-foreground">1. Information We Collect</h2>
			<p>
				When you sign in to our application using Google OAuth, we collect and store the following
				Personally Identifiable Information (PII):
			</p>
			<ul class="list-disc space-y-1 pl-6">
				<li><strong>Email Address:</strong> Your primary Google account email.</li>
				<li><strong>Full Name:</strong> The name associated with your Google account.</li>
				<li><strong>Google Account ID:</strong> A unique, non-public identifier for your account.</li>
			</ul>
			<p>
				We may also collect data related to your usage of the application, such as features used and
				actions taken, for analytics purposes.
			</p>

			<h2 class="pt-4 text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
			<p>We use the information we collect for the following purposes:</p>
			<ul class="list-disc space-y-1 pl-6">
				<li>To create and manage your user account.</li>
				<li>To understand how our application is being used in order to improve it.</li>
				<li>
					For potential future marketing and communication purposes, such as notifying you of new
					features or related products.
				</li>
			</ul>

			<h2 class="pt-4 text-xl font-semibold text-foreground">3. Data Security and Sharing</h2>
			<p>
				We take the security of your data seriously. We will not sell, trade, or rent your personal
				information to third parties. Your data is stored securely using Cloudflare's D1 database
				service.
			</p>

			<h2 class="pt-4 text-xl font-semibold text-foreground">4. Your Rights and Data Deletion</h2>
			<p>
				You have the right to request the deletion of your personal information from our systems at
				any time. To do so, please send a request to
				<a href="mailto:privacy@aitiglobal.link" class="underline hover:text-primary"
					>privacy@aitiglobal.link</a
				>.
			</p>

			<h2 class="pt-4 text-xl font-semibold text-foreground">5. Changes to This Policy</h2>
			<p>
				We may update this Privacy Policy from time to time. We will notify you of any changes by
				posting the new policy on this page.
			</p>
		</Card.Content>
	</Card.Root>
</div>