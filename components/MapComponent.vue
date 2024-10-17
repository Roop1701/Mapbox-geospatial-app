<template>
  <div id="map"></div>
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import appConfig from "~/src/config/app.config";

onMounted(() => {
  mapboxgl.accessToken = appConfig.MAPBOX_KEY;
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/satellite-streets-v12",
    center: [77.5909131544794, 12.980858510216278],
    zoom: 9, // starting zoom
    hash: true,
  });
});
</script>

<style>
#map {
  width: 75vw;
  height: 99vh;
}
</style>
