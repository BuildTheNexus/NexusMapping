<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { FeatureCollection } from 'geojson';
	import {
		MapLibre,
		GeoJSONSource,
		CircleLayer,
		SymbolLayer,
		NavigationControl
	} from 'svelte-maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { MapPoint } from '../../../../../nexusmapping-worker/src/types';
	import maplibregl from 'maplibre-gl';
	import type { Map, MapMouseEvent, LngLatLike, GeoJSONSource as MapLibreGeoJSONSource } from 'maplibre-gl';
	import StyleSwitcher, { type MapStyle } from '$lib/components/map/StyleSwitcher.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	const { data, form }: { data: PageData; form: ActionData } = $props();

	let map: Map | undefined = $state();
	let isDetailModalOpen = $state(false);
	let selectedPointDetails: MapPoint | null = $state(null);
	let selectedPointStatus: MapPoint['status'] | undefined = $state();

	const mapStyles: MapStyle[] = [
		{
			name: 'Satellite',
			url: `https://api.maptiler.com/maps/satellite/style.json?key=${data.maptilerKey}`
		},
		{
			name: 'Streets',
			url: `https://api.maptiler.com/maps/streets-v2/style.json?key=${data.maptilerKey}`
		}
	];

	let currentStyleUrl = $state(mapStyles[0].url);

	function handleStyleChange(event: CustomEvent<string>) {
		currentStyleUrl = event.detail;
	}

	const geojsonData = $derived({
		type: 'FeatureCollection',
		features:
			data.points?.map((point: MapPoint) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [point.longitude, point.latitude]
				},
				properties: {
					...point
				}
			})) ?? []
	} as FeatureCollection);

	const initialCenter = { lat: -9.5, lng: 124.5 };
	const initialZoom = 7;

	const statusDisplayMap: Record<string, { label: string; className: string; hex: string }> = {
		new: {
			label: 'New',
			className: 'bg-blue-500/20 text-blue-400 border-transparent hover:bg-blue-500/30',
			hex: '#3b82f6'
		},
		in_progress: {
			label: 'In Progress',
			className: 'bg-yellow-500/20 text-yellow-400 border-transparent hover:bg-yellow-500/30',
			hex: '#f59e0b'
		},
		completed: {
			label: 'Completed',
			className: 'bg-green-500/20 text-green-400 border-transparent hover:bg-green-500/30',
			hex: '#22c55e'
		},
		rejected: {
			label: 'Rejected',
			className: 'bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent',
			hex: '#ef4444'
		}
	};

	const statusOptions: { value: MapPoint['status']; label: string }[] = [
		{ value: 'new', label: 'New' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'rejected', label: 'Rejected' }
	];

	$effect(() => {
		const currentMap = map;
		if (!currentMap) return;

		const handleClusterMouseEnter = () => (currentMap.getCanvas().style.cursor = 'pointer');
		const handleClusterMouseLeave = () => (currentMap.getCanvas().style.cursor = '');

		const handleClusterClick = async (e: MapMouseEvent & { features?: any[] }) => {
			const features = currentMap.queryRenderedFeatures(e.point, {
				layers: ['clusters']
			});
			if (!features.length) return;
			const clusterId = features[0].properties.cluster_id;
			const source = currentMap.getSource('map-points-source') as MapLibreGeoJSONSource;
			try {
				const zoom = await source.getClusterExpansionZoom(clusterId);
				currentMap.easeTo({
					center: (features[0].geometry as any).coordinates as LngLatLike,
					zoom: zoom
				});
			} catch (err) {
				console.error('Error getting cluster expansion zoom:', err);
			}
		};

		const handlePointClick = (e: MapMouseEvent & { features?: any[] }) => {
			if (e.features && e.features.length > 0) {
				selectedPointDetails = e.features[0].properties as MapPoint;
				selectedPointStatus = selectedPointDetails.status;
				isDetailModalOpen = true;
			}
		};

		currentMap.on('click', 'clusters', handleClusterClick);
		currentMap.on('mouseenter', 'clusters', handleClusterMouseEnter);
		currentMap.on('mouseleave', 'clusters', handleClusterMouseLeave);
		currentMap.on('click', 'unclustered-point', handlePointClick);

		return () => {
			if (currentMap.isStyleLoaded()) {
				currentMap.off('click', 'clusters', handleClusterClick);
				currentMap.off('mouseenter', 'clusters', handleClusterMouseEnter);
				currentMap.off('mouseleave', 'clusters', handleClusterMouseLeave);
				currentMap.off('click', 'unclustered-point', handlePointClick);
			}
		};
	});
</script>

<Dialog.Root bind:open={isDetailModalOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Point Details</Dialog.Title>
			<Dialog.Description class="font-mono text-xs pt-1">
				ID: {selectedPointDetails?.pointId}
			</Dialog.Description>
		</Dialog.Header>
		{#if selectedPointDetails}
			<div class="mt-4 space-y-3 text-sm">
				<div>
					<span class="font-semibold text-muted-foreground">Description:</span>
					<p>{selectedPointDetails.description}</p>
				</div>
			</div>
			<form
				method="POST"
				action="/dashboard/data?/updateStatus"
				class="mt-4 space-y-4"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							isDetailModalOpen = false;
							await invalidateAll();
						}
					};
				}}
			>
				<input type="hidden" name="pointId" value={selectedPointDetails.pointId} />
				<div>
					<label for="status" class="text-sm font-medium">Update Status</label>
					<Select.Root name="status" type="single" bind:value={selectedPointStatus}>
						<Select.Trigger class="w-full mt-1">
							{selectedPointStatus
								? statusDisplayMap[selectedPointStatus]?.label
								: 'Select a status'}
						</Select.Trigger>
						<Select.Content>
							{#each statusOptions as option (option.value)}
								<Select.Item value={option.value}>{option.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
				</div>
				<Dialog.Footer>
					<Button type="submit" disabled={selectedPointStatus === selectedPointDetails.status}>
						Save Changes
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<div class="h-full w-full p-4 lg:p-6 flex flex-col gap-6">
	<h1 class="text-2xl font-bold">Interactive Map</h1>

	{#if data.error}
		<div class="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-red-500">
			<h3 class="font-bold">Failed to Load Map Data</h3>
			<p>{data.error}</p>
		</div>
	{/if}

	{#if data.summary}
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			{#each Object.entries(statusDisplayMap) as [key, { label, className }]}
				{@const count = data.summary?.[key] ?? 0}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-2">
						<Card.Title class="text-sm font-medium">{label}</Card.Title>
						<div class="w-4 h-4 rounded-full {className.split(' ')[0]}"></div>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl font-bold">{count}</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	<div class="relative flex-grow rounded-lg border overflow-hidden">
		<MapLibre
			style={currentStyleUrl}
			center={initialCenter}
			zoom={initialZoom}
			class="absolute inset-0 h-full w-full"
			bind:map
		>
			<StyleSwitcher styles={mapStyles} {currentStyleUrl} on:styleChange={handleStyleChange} />
			<NavigationControl />
			{#if geojsonData && geojsonData.features.length > 0}
				<GeoJSONSource
					id="map-points-source"
					data={geojsonData}
					cluster={true}
					clusterRadius={50}
				>
					<CircleLayer
						id="clusters"
						filter={['has', 'point_count']}
						paint={{
							'circle-color': [
								'step',
								['get', 'point_count'],
								'#51bbd6',
								20,
								'#f1f075',
								50,
								'#f28cb1'
							],
							'circle-radius': ['step', ['get', 'point_count'], 20, 20, 30, 50, 40]
						}}
					/>
					<SymbolLayer
						id="cluster-count"
						filter={['has', 'point_count']}
						layout={{
							'text-field': '{point_count_abbreviated}',
							'text-size': 12
						}}
						paint={{ 'text-color': '#000' }}
					/>
					<CircleLayer
						id="unclustered-point"
						filter={['!', ['has', 'point_count']]}
						paint={{
							'circle-color': [
								'match',
								['get', 'status'],
								'new',
								statusDisplayMap.new.hex,
								'in_progress',
								statusDisplayMap.in_progress.hex,
								'completed',
								statusDisplayMap.completed.hex,
								'rejected',
								statusDisplayMap.rejected.hex,
								'#cccccc'
							],
							'circle-radius': 8,
							'circle-stroke-width': 2,
							'circle-stroke-color': '#ffffff'
						}}
					/>
				</GeoJSONSource>
			{/if}
		</MapLibre>
	</div>
</div>