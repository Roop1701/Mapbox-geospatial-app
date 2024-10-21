<template>
  <div>
    <h2 class="sidebar-title">Upload Geojson Files</h2>

    <!-- Professional-looking file upload component -->
    <div class="upload-container">
      <label for="dropzone-file" class="upload-box">
        <div class="upload-content">
          <svg
            class="upload-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p class="upload-text">
            <span class="upload-highlight">Click to upload</span> or drag and
            drop
          </p>
          <p class="upload-subtext">GeoJSON files only</p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          class="upload-input"
          @change="handleFileUpload"
        />
      </label>
    </div>

    <!-- List of uploaded GeoJSON files -->
    <ul>
      <li v-for="(file, index) in geojsonStore.geojsonFiles" :key="file.name">
        {{ file.name }}
        <button @click="toggleLayer(index)" class="icon-button">
          <svg v-if="file.visible" :width="24" :height="24" viewBox="0 0 24 24">
            <path :d="mdiEye"></path>
          </svg>
          <svg v-else :width="24" :height="24" viewBox="0 0 24 24">
            <path :d="mdiEyeOff"></path>
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { mdiEye, mdiEyeOff } from "@mdi/js"; // Import mdi icons

import { featureCollectionStore } from "~/src/store/Geojson-Store";

import * as turf from "@turf/turf"; // Import turf.js for calculating bbox

const geojsonStore = featureCollectionStore();

const props = defineProps({
  map: Object,
});

// File upload handler
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.name.endsWith(".geojson")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const geojson = JSON.parse(e.target.result);
      geojsonStore.addGeojsonFile({ name: file.name, data: geojson });

      let layerId = file.name.split(".")[0];
      if (!props.map.getSource(layerId)) {
        // Add the layer only if it hasn't been added already
        props.map.addSource(layerId, {
          type: "geojson",
          data: geojson,
        });
        props.map.addLayer({
          id: `${layerId}-layer`, // Layer ID is the unique filename with ULID
          type: "fill",
          source: layerId,
          paint: {
            "fill-color": "#54a94b",
            "fill-outline-color": "#121212",
            "fill-antialias": true,
          },
          // filter: ['==', 'plotid', ''],
          layout: {
            visibility: "visible",
          },
        });

        // Calculate the bbox using turf.bbox
        const bbox = turf.bbox(geojson); // bbox returns [minX, minY, maxX, maxY]

        // Fit the map to the bbox
        props.map.fitBounds(bbox, { padding: 20 });
      }
    };
    reader.readAsText(file);

    console.log("Add layers");
  }
};

// Toggle layer visibility
const toggleLayer = (index) => {
  geojsonStore.toggleVisibility(index, props.map);
};
</script>

<style scoped>
.sidebar-title {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 20px 0;
  letter-spacing: 1px;
}

.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px;
}

.upload-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 250px;
  border: 2px dashed #ccc;
  border-radius: 12px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.3s, border-color 0.3s;
}

.upload-box:hover {
  background-color: #f1f1f1;
  border-color: #aaa;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 16px;
  fill: none;
  stroke: #999;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.upload-highlight {
  font-weight: 600;
  color: #333;
}

.upload-subtext {
  font-size: 12px;
  color: #999;
}

.upload-input {
  display: none;
}

/* Hover effects for the upload box */
.upload-box:hover .upload-icon {
  stroke: #555;
}

.upload-box:hover .upload-text,
.upload-box:hover .upload-subtext {
  color: #333;
}

/* List styling */
ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-around;
  margin: 5px 0;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 5px 5px 5px;
  display: flex;
  align-items: center;
}
</style>
