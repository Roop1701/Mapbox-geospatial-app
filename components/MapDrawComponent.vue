<template></template>
<script setup>
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { mapStore } from "~/src/store/Map-Store";
let mapDraw = shallowRef(null);
const map = mapStore().map.value;
onMounted(() => {
  mapDraw.value = new MapboxDraw({
    displayControlsDefault: false,
    // Select which mapbox-gl-draw control buttons to add to the map.
    controls: {
      polygon: true,
      trash: true,
    },
    // Set mapbox-gl-draw to draw by default.
    // The user does not have to click the polygon control button first.
    defaultMode: "draw_polygon",
  });

  map.addControl(mapDraw.value);
});

watch(
  () => mapStore().mapLoaded,
  (newvalue) => {
    console.log("Map", map);
    console.log("Map Loaded in MapDraw component", newvalue);
  }
);
</script>
