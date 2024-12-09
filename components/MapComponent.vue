<template>
  <div class="parent">
    <div id="map">
      <div class="controls">
        <button @click="savePolygons" v-if="showSavePolygon">
          Save Polygons
        </button>

        <button @click="clearPolygons" v-if="showSavePolygon">
          Clear All Polygons
        </button>
      </div>

      <!-- Button to toggle the distance measurement -->
      <button
        @click="toggleDistanceMeasurement"
        class="distance-measure-button"
        v-if="!isDrawingMode"
      >
        <svg v-if="!isMeasuring" :width="24" :height="24" viewBox="0 0 24 24">
          <path :d="mdiRuler" />
        </svg>
        <svg v-if="isMeasuring" :width="24" :height="24" viewBox="0 0 24 24">
          <path :d="mdiClose" />
        </svg>
      </button>
      <button @click="toggleDrawMode" class="draw-button" v-if="!isDrawingMode">
        <svg :width="24" :height="24" viewBox="0 0 24 24">
          <path :d="mdiPencil" />
        </svg>
      </button>
      <!-- Include the DistanceMeasurement component only if measuring is active -->
      <DistanceMeasureComponent
        v-if="isMeasuring"
        :map="mapContainer"
        @resetLayers="resetLayers"
      />
    </div>
    <SideBarComponent :map="mapContainer" />
  </div>
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { mdiRuler, mdiClose, mdiPencil } from "@mdi/js";
import appConfig from "~/src/config/app.config";
import { featureCollectionStore } from "~/src/store/Geojson-Store";

import { mapStore } from "~/src/store/Map-Store";
import DistanceMeasureComponent from "./DistanceMeasureComponent.vue";

const geojsonStore = featureCollectionStore();
const mapInstance = mapStore();
const mapContainer = shallowRef(null);
let draw = shallowRef(null);
let isDrawingMode = shallowRef(false);
let isMeasuring = shallowRef(false);
let showSavePolygon = shallowRef(false);

let mapLoaded = shallowRef(false);

onMounted(() => {
  mapboxgl.accessToken = appConfig.MAPBOX_KEY;
  mapContainer.value = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: [77.5909131544794, 12.980858510216278],
    minZoom: 9, // starting zoom
    maxZoom: 18,
    navigationControl: true,
  });
  mapContainer.value.addControl(
    new mapboxgl.NavigationControl(),
    "bottom-left"
  );

  mapInstance.updateMap(mapContainer.value);

  mapContainer.value.on("load", () => {
    console.log("Map loaded");
    mapStore().updateMapStatus(true);
    mapLoaded.value = true;
  });

  // Initialize Mapbox Draw
  draw.value = new MapboxDraw({
    displayControlsDefault: false,
    controls: {
      polygon: true, // Allow polygon drawing
      trash: true, // Allow deleting shapes
    },
    styles: [
      {
        id: "highlight-active-points",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "true"],
        ],
        paint: {
          "circle-radius": 7,
          "circle-color": "#000000",
        },
      },
      {
        id: "points-are-blue",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["==", "active", "false"],
        ],
        paint: {
          "circle-radius": 5,
          "circle-color": "#000088",
        },
      },
      {
        id: "gl-draw-line",
        type: "line",
        filter: ["all", ["==", "$type", "LineString"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#D20C0C",
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
      // polygon fill
      {
        id: "gl-draw-polygon-fill",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"]],
        paint: {
          "fill-color": "#D20C0C",
          "fill-outline-color": "#D20C0C",
          "fill-opacity": 0.1,
        },
      },
      // polygon mid points
      {
        id: "gl-draw-polygon-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: {
          "circle-radius": 3,
          "circle-color": "#fbb03b",
        },
      },
      // polygon outline stroke
      // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
      {
        id: "gl-draw-polygon-stroke-active",
        type: "line",
        filter: ["all", ["==", "$type", "Polygon"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#D20C0C",
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
      // vertex point halos
      {
        id: "gl-draw-polygon-and-line-vertex-halo-active",
        type: "circle",
        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
        paint: {
          "circle-radius": 5,
          "circle-color": "#FFF",
        },
      },
      // vertex points
      {
        id: "gl-draw-polygon-and-line-vertex-active",
        type: "circle",
        filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
        paint: {
          "circle-radius": 3,
          "circle-color": "#D20C0C",
        },
      },
    ],
  });

  mapContainer.value.on("draw.create", (e) => {
    if (e.features.length > 0) {
      showSavePolygon.value = true; // Show the Save Polygon button
    }
  });

  // Hide the Save button if polygons are deleted
  mapContainer.value.on("draw.delete", () => {
    showSavePolygon.value = false; // Hide the Save Polygon button
  });
});

const toggleDrawMode = () => {
  // Enable or disable draw mode for polygons
  isDrawingMode.value = !isDrawingMode.value;
};

const savePolygons = () => {
  const polygons = draw.value.getAll(); // Get all drawn polygons
  console.log("Polygons:", polygons);
};

const clearPolygons = () => {
  // Clear all drawn shapes from the map
  draw.value.deleteAll();
};

const toggleDistanceMeasurement = () => {
  isMeasuring.value = !isMeasuring.value;

  if (!isMeasuring.value) {
    // If toggled off, remove any existing layers
    resetLayers();
  }
};

// Function to reset the layers on the map
const resetLayers = () => {
  if (mapContainer.value && mapContainer.value.getSource("line")) {
    mapContainer.value.removeLayer("line");
    mapContainer.value.removeSource("line");
  }
};

watch(
  () => mapStore().mapLoaded,
  (newvalue) => {
    // mapLoaded.value = newvalue;
    mapInstance.updateMap(mapContainer.value);
    console.log(mapLoaded.value);
  }
);

// watch(
//   () => isMeasuring.value,
//   (newvalue) => {
//     if (newvalue) {
//       mapContainer.value.removeControl(draw.value);
//     } else {
//       mapContainer.value.addControl(draw.value, "top-right");
//     }
//   }
// );

watch(
  () => isDrawingMode.value,
  () => {
    if (isDrawingMode.value) {
      mapContainer.value.addControl(draw.value, "top-right");
    } else {
      mapContainer.value.removeControl(draw.value);
    }
  }
);
</script>

<style scoped>
.parent {
  display: grid;
  grid-template-columns: 2fr 1fr;
  height: 100vh;
  width: 100vw;
}

#map {
  width: 100%;
  height: 100%;
}
.controls {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}
button {
  margin: 5px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  z-index: 1;
}
button:hover {
  background-color: #ebeef2;
}
.distance-measure-button {
  position: absolute;
  bottom: 20vh;
  left: 5px;
  background-color: white;
  border: none;
  cursor: pointer;
  padding: 5px 5px 5px 10px;
  border-radius: 25%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.draw-button {
  position: absolute;
  bottom: 28vh;
  left: 5px;
  background-color: white;
  border: none;
  cursor: pointer;
  padding: 5px 5px 5px 10px;
  border-radius: 25%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  z-index: 1;
}
</style>
