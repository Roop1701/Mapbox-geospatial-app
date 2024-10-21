import { defineStore } from "pinia";

export const featureCollectionStore = defineStore(
  "FeatureCollectionStore",
  () => {
    let geojsonFiles = ref([]);

    const addGeojsonFile = (file) => {
      let uploadedFile = {
        name: `${file.name}`, // Generate unique layer name with ULID
        data: file.data,
        visible: true,
      };
      geojsonFiles.value.push(uploadedFile);
      console.log("Geojson object after upload", geojsonFiles.value);
    };

    const toggleVisibility = (index, map) => {
      const file = geojsonFiles.value[index];
      console.log("File", file);
      const layerId = file.name.split(".")[0]; // Use the unique file name with ULID as the layer ID
      console.log("Layer Id", layerId);
      const visibility = map.getLayoutProperty(
        `${layerId}-layer`,
        "visibility"
      );

      // Toggle visibility
      if (visibility === "visible") {
        map.setLayoutProperty(`${layerId}-layer`, "visibility", "none");
        file.visible = false;
      } else {
        map.setLayoutProperty(`${layerId}-layer`, "visibility", "visible");
        file.visible = true;
      }
    };
    return { geojsonFiles, addGeojsonFile, toggleVisibility };
  }
);
