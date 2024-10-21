<template>
  <div>
    <!-- Transparent card to display total distance -->
    <div v-if="totalDistance.kilometers > 0" class="distance-card">
      <p>Total Distance:</p>
      <p>{{ totalDistance.kilometers }} km</p>
      <p>{{ totalDistance.miles }} miles</p>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from "vue";
import * as turf from "@turf/turf";

const props = defineProps({
  map: Object,
});

// Distance calculation using Turf.js
const calculateDistance = (coords) => {
  let totalDistance = 0;

  for (let i = 1; i < coords.length; i++) {
    const from = turf.point(coords[i - 1]);
    const to = turf.point(coords[i]);

    // Calculate distance between points using Turf.js in kilometers
    const distanceBetweenPoints = turf.distance(from, to, {
      units: "kilometers",
    });
    totalDistance += distanceBetweenPoints;
  }

  const distanceInKilometers = totalDistance;
  const distanceInMiles = totalDistance * 0.621371;

  return {
    kilometers: distanceInKilometers.toFixed(2),
    miles: distanceInMiles.toFixed(2),
  };
};

const coordinates = shallowRef([]); // Store clicked points (lng, lat)
const totalDistance = ref({ kilometers: 0, miles: 0 }); // Total distance in km and miles
const geoJsonSource = shallowRef(null); // Store the GeoJSON source for points and lines

// Function to update GeoJSON data for points and line
const updateGeoJsonSource = () => {
  if (geoJsonSource.value) {
    geoJsonSource.value.setData({
      type: "FeatureCollection",
      features: [
        // Points features
        ...coordinates.value.map((coord) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: coord,
          },
        })),
        // Line feature connecting the points
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: coordinates.value,
          },
        },
      ],
    });
  }
};

// Add event listener for map clicks when measuring is enabled
onMounted(() => {
  const handleMapClick = (event) => {
    const lngLat = event.lngLat; // Get the latitude and longitude of the clicked point

    // Store the coordinates
    coordinates.value.push([lngLat.lng, lngLat.lat]);

    // Update the GeoJSON source with the new points and line
    updateGeoJsonSource();

    // Calculate the total distance whenever a new point is added
    if (coordinates.value.length > 1) {
      totalDistance.value = calculateDistance(coordinates.value);
    }
  };

  // Add the map click event listener if the map exists
  if (props.map) {
    // Add a GeoJSON source to hold the clicked points and line
    props.map.addSource("points-and-line", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });

    // Store the GeoJSON source for future updates
    geoJsonSource.value = props.map.getSource("points-and-line");

    // Add a circle layer to display the points
    props.map.addLayer({
      id: "circle-points",
      type: "circle",
      source: "points-and-line",
      paint: {
        "circle-radius": 6,
        "circle-color": "#000000",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // Add a line layer to display the lines between points
    props.map.addLayer({
      id: "line-between-points",
      type: "line",
      source: "points-and-line",
      paint: {
        "line-color": "#808080",
        "line-width": 3,
      },
    });

    // Add the map click event listener
    props.map.on("click", handleMapClick);
  }

  // Cleanup: Remove map event listeners, layers, and sources when the component is unmounted
  onBeforeUnmount(() => {
    if (props.map) {
      props.map.off("click", handleMapClick);

      // Remove the circle and line layers and source
      if (props.map.getLayer("circle-points")) {
        props.map.removeLayer("circle-points");
      }
      if (props.map.getLayer("line-between-points")) {
        props.map.removeLayer("line-between-points");
      }
      if (props.map.getSource("points-and-line")) {
        props.map.removeSource("points-and-line");
      }
    }

    coordinates.value = [];
    totalDistance.value = { kilometers: 0, miles: 0 };
  });

  props.map.on("mousemove", (e) => {
    const features = props.map.queryRenderedFeatures(e.point, {
      layers: ["line-between-points", "circle-points"],
    });
    // Change the cursor to a pointer when hovering over a point on the map.
    // Otherwise cursor is a crosshair.
    props.map.getCanvas().style.cursor = features.length
      ? "pointer"
      : "crosshair";
  });
});

watch(
  () => props.map,
  (newMap) => {
    if (!newMap) return;

    // Reset coordinates and GeoJSON source when the component is re-rendered
    coordinates.value = [];
    totalDistance.value = { kilometers: 0, miles: 0 };
    updateGeoJsonSource();
  }
);
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
