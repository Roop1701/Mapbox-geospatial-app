import { defineStore } from "pinia";

export const mapStore = defineStore("MapStore", () => {
  let map = shallowRef(null);
  let mapLoaded = shallowRef(false);

  const updateMap = (mapcopy) => {
    console.log("MapCopy", mapcopy);
    map.value = mapcopy;
  };

  const updateMapStatus = (value) => {
    mapLoaded.value = value;
  };
  return { map, updateMap, mapLoaded, updateMapStatus };
});
