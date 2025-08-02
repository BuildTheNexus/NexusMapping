<script lang="ts">
	import type { PageData } from './$types';
	import Google from 'lucide-svelte/icons/log-in'; // Using your corrected icon import

	// --- Map-related imports (only used when logged in) ---
	import maplibregl from 'maplibre-gl';
	import type { FeatureCollection } from 'geojson';
	import { MapLibre, GeoJSONSource, CircleLayer, NavigationControl } from 'svelte-maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	export let data: PageData;

	// This reactive block will only run when data.points is available
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

{#if data.session}
	<!-- ====================================================== -->
	<!-- STATE 1: USER IS LOGGED IN -->
	<!-- Render the entire map dashboard here. -->
	<!-- ====================================================== -->
	<div class="relative h-full w-full">
		{#if data.error}
			<div class="flex h-full w-full flex-col items-center justify-center bg-red-50 p-8">
				<h1 class="text-2xl font-bold text-red-700">Failed to Load Map Data</h1>
				<p class="mt-2 text-red-600">{data.error}</p>
				<p class="mt-4 text-sm text-gray-500">
					Please ensure the API worker is running (`pnpm --filter nexusmapping-worker dev`) and try
					again.
				</p>
			</div>
		{:else}
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
{:else}
	<!-- ====================================================== -->
	<!-- STATE 2: USER IS NOT LOGGED IN -->
	<!-- Render the login page content here. -->
	<!-- ====================================================== -->
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
{/if}