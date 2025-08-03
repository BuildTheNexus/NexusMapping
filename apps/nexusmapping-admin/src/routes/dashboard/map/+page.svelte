<script lang="ts">
	import type { PageData } from './$types';
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

	const { data } = $props<{ data: PageData }>();

	let map: Map | undefined = $state();

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
					pointId: point.pointId,
					description: point.description,
					status: point.status
				}
			})) ?? []
	} as FeatureCollection);

	const initialCenter = { lat: -9.5, lng: 124.5 };
	const initialZoom = 7;

	const statusDisplayMap: Record<string, { label: string; color: string }> = {
		new: { label: 'New', color: '#3b82f6' },
		in_progress: { label: 'In Progress', color: '#f59e0b' },
		completed: { label: 'Completed', color: '#22c55e' },
		rejected: { label: 'Rejected', color: '#ef4444' }
	};

	function createPopupHtml(properties: any): string {
		const statusInfo = statusDisplayMap[properties.status] || {
			label: properties.status,
			color: '#cccccc'
		};
		return `
			<div style="font-family: sans-serif; font-size: 14px; max-width: 200px;">
				<strong style="color: ${statusInfo.color}; text-transform: capitalize;">
					${statusInfo.label}
				</strong>
				<p style="margin: 4px 0 0; padding-top: 4px; border-top: 1px solid #eee;">
					${properties.description}
				</p>
			</div>
		`;
	}

	$effect(() => {
		const currentMap = map;
		if (!currentMap) return;

		let popup: maplibregl.Popup | undefined;

		const handleMouseEnterPoint = (e: MapMouseEvent & { features?: any[] }) => {
			if (e.features && e.features.length > 0) {
				currentMap.getCanvas().style.cursor = 'pointer';
				const properties = e.features[0].properties;
				const coordinates = e.features[0].geometry.coordinates.slice();
				popup = new maplibregl.Popup({ closeButton: false, offset: 25 })
					.setLngLat(coordinates)
					.setHTML(createPopupHtml(properties))
					.addTo(currentMap);
			}
		};

		const handleMouseLeavePoint = () => {
			currentMap.getCanvas().style.cursor = '';
			popup?.remove();
		};

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

		currentMap.on('mouseenter', 'unclustered-point', handleMouseEnterPoint);
		currentMap.on('mouseleave', 'unclustered-point', handleMouseLeavePoint);
		currentMap.on('click', 'clusters', handleClusterClick);
		currentMap.on('mouseenter', 'clusters', handleClusterMouseEnter);
		currentMap.on('mouseleave', 'clusters', handleClusterMouseLeave);

		return () => {
			if (currentMap.isStyleLoaded()) {
				currentMap.off('mouseenter', 'unclustered-point', handleMouseEnterPoint);
				currentMap.off('mouseleave', 'unclustered-point', handleMouseLeavePoint);
				currentMap.off('click', 'clusters', handleClusterClick);
				currentMap.off('mouseenter', 'clusters', handleClusterMouseEnter);
				currentMap.off('mouseleave', 'clusters', handleClusterMouseLeave);
			}
		};
	});
</script>

{#if data.error}
	<div class="flex h-full w-full flex-col items-center justify-center p-8 text-center">
		<h2 class="text-xl font-bold text-destructive">Failed to Load Map Data</h2>
		<p class="mt-2 text-muted-foreground">{data.error}</p>
	</div>
{:else}
	<MapLibre
		style="https://demotiles.maplibre.org/style.json"
		center={initialCenter}
		zoom={initialZoom}
		class="absolute inset-0 h-full w-full"
		bind:map
	>
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
							'#3b82f6',
							'in_progress',
							'#f59e0b',
							'completed',
							'#22c55e',
							'rejected',
							'#ef4444',
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
{/if}