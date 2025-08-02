<!-- File: apps/nexusmapping-admin/src/routes/dashboard/data/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isModalOpen = $state(false);
	let selectedPoint = $state<MapPoint | null>(null);

	const statusDisplayMap: Record<MapPoint['status'], { label: string; class: string }> = {
		new: { label: 'New', class: 'bg-blue-500' },
		in_progress: { label: 'In Progress', class: 'bg-yellow-500' },
		completed: { label: 'Completed', class: 'bg-green-500' },
		rejected: { label: 'Rejected', class: 'bg-red-500' }
	};
	const points = data.points as MapPoint[];

	function openUpdateModal(point: MapPoint) {
		selectedPoint = point;
		isModalOpen = true;
	}
</script>

<!-- MODAL DIALOG FOR UPDATING STATUS -->
<Dialog.Root bind:open={isModalOpen}>
	<Dialog.Portal>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Update Status</Dialog.Title>
				<Dialog.Description>
					Updating status for point: <strong>{selectedPoint?.pointId}</strong>
				</Dialog.Description>
			</Dialog.Header>

			<form
				method="POST"
				action="?/updateStatus"
				class="mt-4 space-y-4"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							isModalOpen = false;
							await invalidateAll();
						}
					};
				}}
			>
				<input type="hidden" name="pointId" value={selectedPoint?.pointId} />

				<div>
					<label for="status" class="text-sm font-medium">New Status</label>
					<!-- KAI: DEFINITIVE FIX -->
					<Select.Root name="status" type="single" value={selectedPoint?.status}>
						<Select.Trigger class="w-full mt-1">
							<!-- Display the human-readable label of the selected status -->
							{selectedPoint ? statusDisplayMap[selectedPoint.status].label : 'Select a status'}
						</Select.Trigger>
						<Select.Content>
							{#each Object.entries(statusDisplayMap) as [key, { label }]}
								<Select.Item value={key}>{label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>

				<Dialog.Footer>
					<Button type="submit">Save Changes</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<!-- MAIN PAGE CONTENT -->
<div class="h-full w-full p-4 lg:p-6">
	<h1 class="mb-4 text-2xl font-bold">Data Management</h1>

	<!-- Display form submission feedback -->
	{#if form?.message}
		<div
			class="mb-4 rounded-lg p-3 text-sm {form.success
				? 'border-green-500/50 bg-green-500/10 text-green-300'
				: 'border-destructive/50 bg-destructive/10 text-red-400'}"
		>
			{form.message}
		</div>
	{/if}

	{#if data.error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-red-500">
			<h3 class="font-bold">Failed to Load Data</h3>
			<p>{data.error}</p>
		</div>
	{:else if points && points.length > 0}
		<div class="space-y-4">
			{#each points as point (point.pointId)}
				{@const status = statusDisplayMap[point.status]}
				<div class="flex items-center justify-between rounded-lg border p-4">
					<div>
						<p class="font-semibold">{point.description}</p>
						<div class="mt-1 flex items-center gap-2">
							<span class="text-sm text-muted-foreground">Status:</span>
							<span
								class="flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium text-white {status.class}"
							>
								<div class="h-2 w-2 rounded-full bg-white/50"></div>
								{status.label}
							</span>
						</div>
					</div>
					<div>
						<Button variant="outline" size="sm" onclick={() => openUpdateModal(point)}>
							Update
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="mt-8 text-center text-muted-foreground">No map points found.</p>
	{/if}
</div>