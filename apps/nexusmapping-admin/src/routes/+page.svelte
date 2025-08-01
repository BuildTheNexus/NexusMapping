<!-- File: apps/nexusmapping-admin/src/routes/+page.svelte -->

<script lang="ts">
	import type { PageData } from './$types';
	import maplibregl from 'maplibre-gl';
	import type { FeatureCollection } from 'geojson'; // This import is still correct
	import { MapLibre, GeoJSONSource, CircleLayer, NavigationControl } from 'svelte-maplibre-gl';

	import 'maplibre-gl/dist/maplibre-gl.css';

	export let data: PageData;

	const initialCenter = { lat: -10.1709, lng: 123.7076 };

	// --- THE FIX ---
	// 1. First, we DECLARE the variable with its correct TypeScript type.
	let geojsonData: FeatureCollection;

	// 2. Second, we use the reactive '$:' block to ASSIGN the value.
	// This separates the type declaration from the reactive assignment, which is the correct pattern.
	$: geojsonData = {
		type: 'FeatureCollection',
		features:
			data.points?.map((point) => ({
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [point.longitude, point.latitude]
				},
				properties: {
					pointId: point.pointId,
					description: point.description,
					status: point.status
				}
			})) ?? []
	};
</script>

<!-- The HTML part of your file below this line does not need to change. -->

<div class="relative h-screen w-screen">
	{#if data.error}
		<!-- ... error handling ... -->
		<div class="flex h-full w-full flex-col items-center justify-center bg-red-50 p-8">
			<h1 class="text-2xl font-bold text-red-700">Failed to Load Map Data</h1>
			<p class="mt-2 text-red-600">{data.error}</p>
			<p class="mt-4 text-sm text-gray-500">
				Please ensure the API worker is running (`pnpm --filter nexusmapping-api dev`) and try again.
			</p>
		</div>
	{:else}
		<!-- ... map rendering ... -->
		<MapLibre
			style="https://demotiles.maplibre.org/style.json"
			center={initialCenter}
			zoom={10}
			class="h-full w-full"
		>
			<NavigationControl />
			<GeoJSONSource id="map-points-source" data={geojsonData}>
				<CircleLayer
					id="map-points-layer"
					paint={{
						'circle-color': '#ff0000',
						'circle-radius': 6,
						'circle-stroke-width': 2,
						'circle-stroke-color': '#ffffff'
					}}
				/>
			</GeoJSONSource>
		</MapLibre>
	{/if}
</div>