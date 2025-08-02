<script lang="ts">
	import type { PageData } from './$types';
	import Header from '$lib/components/layout/Header.svelte';
	import maplibregl from 'maplibre-gl';
	import type { FeatureCollection } from 'geojson';
	import { MapLibre, GeoJSONSource, CircleLayer, NavigationControl } from 'svelte-maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	export let data: PageData;

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
	} as FeatureCollection;

	const initialCenter = { lat: -10.1709, lng: 123.7076 };
</script>

<!-- THE FIX: Change from Flexbox to CSS Grid for robust layout -->
<div class="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
	<!-- The header is the first row, with its height determined by its content (`auto`) -->
	<Header />

	<!-- The main content area is the second row, taking up all remaining space (`1fr`) -->
	<!-- It needs `relative` and `overflow-hidden` to act as a solid container for the map. -->
	<main class="relative overflow-hidden">
		{#if data.error}
			<div class="flex h-full w-full flex-col items-center justify-center p-8 text-center">
				<h2 class="text-xl font-bold text-destructive">Failed to Load Map Data</h2>
				<p class="mt-2 text-muted-foreground">{data.error}</p>
			</div>
		{:else}
			<MapLibre
				style="https://demotiles.maplibre.org/style.json"
				center={initialCenter}
				zoom={10}
				class="absolute inset-0 h-full w-full"
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
	</main>
</div>