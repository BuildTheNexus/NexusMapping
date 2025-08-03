<!-- File: apps/nexusmapping-admin/src/routes/dashboard/data/+page.svelte -->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';
	import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { navigating } from '$app/stores';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isUpdateModalOpen = $state(false);
	// --- KAI: ADDED STATE FOR THE NEW SEED DIALOG ---
	let isSeedModalOpen = $state(false);

	let selectedPoint = $state<MapPoint | null>(null);
	let selectedStatus = $state<MapPoint['status'] | undefined>(undefined);
	let seeding = $state(false);

	const statusDisplayMap: Record<MapPoint['status'], { label: string; className: string }> = {
		new: {
			label: 'New',
			className: 'bg-blue-500/20 text-blue-400 border-transparent hover:bg-blue-500/30'
		},
		in_progress: {
			label: 'In Progress',
			className: 'bg-yellow-500/20 text-yellow-400 border-transparent hover:bg-yellow-500/30'
		},
		completed: {
			label: 'Completed',
			className: 'bg-green-500/20 text-green-400 border-transparent hover:bg-green-500/30'
		},
		rejected: {
			label: 'Rejected',
			className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent'
		}
	};

	const statusOptions: { value: MapPoint['status']; label: string }[] = [
		{ value: 'new', label: 'New' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'rejected', label: 'Rejected' }
	];

	const points = $derived(data.points as MapPoint[]);

	function openUpdateModal(point: MapPoint) {
		selectedPoint = point;
		selectedStatus = point.status;
		isUpdateModalOpen = true;
	}
</script>

<!-- MODAL DIALOG FOR UPDATING STATUS -->
<Dialog.Root bind:open={isUpdateModalOpen}>
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
						isUpdateModalOpen = false;
						await invalidateAll();
					}
				};
			}}
		>
			<input type="hidden" name="pointId" value={selectedPoint?.pointId} />
			<input type="hidden" name="status" value={selectedStatus} />
			<div>
				<label for="status" class="text-sm font-medium">New Status</label>
				<Select.Root type="single" bind:value={selectedStatus}>
					<Select.Trigger class="w-full mt-1">
						{selectedStatus ? statusDisplayMap[selectedStatus].label : 'Select a status'}
					</Select.Trigger>
					<Select.Content>
						{#each statusOptions as option (option.value)}
							<Select.Item value={option.value}>{option.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!selectedStatus}>Save Changes</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- --- KAI: ADDED THIS ENTIRE NEW DIALOG FOR SEEDING --- -->
<Dialog.Root bind:open={isSeedModalOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Confirm Database Seed</Dialog.Title>
			<Dialog.Description>
				This will delete all existing map points and replace them with a new set of 60
				island-wide demo points. This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer class="mt-4">
			<Button variant="outline" onclick={() => (isSeedModalOpen = false)}>Cancel</Button>
			<form
				method="POST"
				action="?/seed"
				use:enhance={() => {
					seeding = true;
					return async ({ result }) => {
						if (result.type === 'success' || result.type === 'failure') {
							await invalidateAll();
						}
						isSeedModalOpen = false;
						seeding = false;
					};
				}}
			>
				<Button type="submit" disabled={seeding}>Confirm Seed</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- MAIN PAGE CONTENT -->
<div class="h-full w-full p-4 lg:p-6">
	<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<h1 class="text-2xl font-bold">Data Management</h1>
		<!-- --- KAI: REPLACED THE FORM WITH A SIMPLE BUTTON --- -->
		<Button variant="outline" onclick={() => (isSeedModalOpen = true)} disabled={!!$navigating}>
			Seed Island-Wide Data
		</Button>
	</div>

	{#if form?.message}
		<div
			class="mb-4 rounded-lg p-3 text-sm {form.success
				? 'border-green-500/50 bg-green-500/10 text-green-300'
				: 'border-destructive/50 bg-destructive/10 text-red-400'}"
			role="alert"
		>
			<span class="font-bold">{form.success ? 'Success:' : 'Error:'}</span>
			{form.message}
		</div>
	{/if}

	{#if data.error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-red-500" role="alert">
			<h3 class="font-bold">Failed to Load Data</h3>
			<p>{data.error}</p>
		</div>
	{:else if points && points.length > 0}
		<!-- Desktop and Mobile Views -->
		<div class="hidden rounded-md border lg:block">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[200px]">Point ID</Table.Head>
						<Table.Head>Description</Table.Head>
						<Table.Head class="w-[150px]">Status</Table.Head>
						<Table.Head class="w-[120px] text-right">Action</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each points as point (point.pointId)}
						{@const status = statusDisplayMap[point.status]}
						<Table.Row>
							<Table.Cell class="font-mono text-xs">{point.pointId}</Table.Cell>
							<Table.Cell class="font-medium">{point.description}</Table.Cell>
							<Table.Cell>
								<Badge class="{status.className} capitalize">{status.label}</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="outline" size="sm" onclick={() => openUpdateModal(point)}>
									Update
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
		<div class="space-y-4 lg:hidden">
			{#each points as point (point.pointId)}
				{@const status = statusDisplayMap[point.status]}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-base">{point.description}</Card.Title>
						<Card.Description class="font-mono text-xs pt-1">{point.pointId}</Card.Description>
					</Card.Header>
					<Card.Content class="flex items-center justify-between">
						<div>
							<span class="text-sm text-muted-foreground">Status:</span>
							<Badge class="{status.className} ml-2 capitalize">{status.label}</Badge>
						</div>
						<Button variant="outline" size="sm" onclick={() => openUpdateModal(point)}>
							Update
						</Button>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<p class="mt-8 text-center text-muted-foreground">No map points found.</p>
	{/if}
</div>