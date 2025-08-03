<!-- File: apps/nexusmapping-admin/src/routes/dashboard/map/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	// KAI: The Header is no longer needed here as it's in the new layout file.
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

<!-- 
  KAI: The layout div has been removed. The page now only contains its specific content.
  The parent <main> tag from the new layout is relative, so this absolute positioning works perfectly.
-->
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