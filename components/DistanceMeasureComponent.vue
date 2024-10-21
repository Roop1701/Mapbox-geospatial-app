<template>
  <div>
    <!-- Distance display card -->
    <div v-if="totalDistance > 0" class="distance-card">
      <p>Total Distance:</p>
      <p>{{ totalDistance }} km</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import mapboxgl from "mapbox-gl";
import * as turf from "@turf/turf";

let props = defineProps({
  map: Object,
}) as any;

// GeoJSON object to hold the points and lines
const geojson = shallowRef({
  type: "FeatureCollection",
  features: [],
});

// Used to draw the lines between points
const linestring = shallowRef({
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: [],
  },
});

const totalDistance = ref(0); // Stores the total distance
const coordinates = ref([]);

onMounted(() => {
  if (props.map) {
    props.map.on("load", () => {
      // Add source for the GeoJSON data
      props.map.addSource("geojson", {
        type: "geojson",
        data: geojson.value,
      });

      // Add a circle layer to display the points
      props.map.addLayer({
        id: "measure-points",
        type: "circle",
        source: "geojson",
        paint: {
          "circle-radius": 5,
          "circle-color": "#000",
        },
        filter: ["in", "$type", "Point"],
      });

      // Add a line layer to display the lines between points
      props.map.addLayer({
        id: "measure-lines",
        type: "line",
        source: "geojson",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#000",
          "line-width": 2.5,
        },
        filter: ["in", "$type", "LineString"],
      });
    });

    // Handle click event on the map
    const handleMapClick = (e: any) => {
      // Query the clicked point to see if a feature exists
      const features = props.map.queryRenderedFeatures(e.point, {
        layers: ["measure-points"],
      });

      // Clear the distance container
      totalDistance.value = 0;

      // Remove linestring to redraw it
      if (geojson.value.features.length > 1) geojson.value.features.pop();

      // If the clicked feature is a point, remove it
      if (features.length) {
        const id = features[0].properties.id;
        geojson.value.features = geojson.value.features.filter(
          (point: any) => point.properties.id !== id
        );
      } else {
        // Otherwise, add the new point to the map
        const point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
          properties: {
            id: String(new Date().getTime()), // Unique ID for each point
          },
        };

        geojson.value.features.push(point);
      }

      // If more than one point exists, calculate the distance
      if (geojson.value.features.length > 1) {
        linestring.value.geometry.coordinates = geojson.value.features.map(
          (point) => point.geometry.coordinates
        );

        geojson.value.features.push(linestring.value);

        // Use Turf.js to calculate the total distance in kilometers
        const distance = turf.length(linestring.value, { units: "kilometers" });
        totalDistance.value = distance.toLocaleString(); // Store the total distance
      }

      // Update the source data to re-render
      props.map.getSource("geojson").setData(geojson.value);
    };

    // Add event listener for map clicks
    props.map.on("click", handleMapClick);

    // Handle mouse movement to change cursor style
    const handleMouseMove = (e) => {
      const features = props.map.queryRenderedFeatures(e.point, {
        layers: ["measure-points"],
      });
      // Change the cursor to a pointer when hovering over points
      props.map.getCanvas().style.cursor = features.length
        ? "pointer"
        : "crosshair";
    };

    props.map.on("mousemove", handleMouseMove);

    // Cleanup when the component is unmounted
    onBeforeUnmount(() => {
      if (props.map) {
        props.map.off("click", handleMapClick);
        props.map.off("mousemove", handleMouseMove);
      }
    });
  }
});
</script>

<style scoped>
.distance-card {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.distance-card p {
  margin: 0;
  font-size: 14px;
}
</style>
