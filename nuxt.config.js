import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

export default defineNuxtConfig({
  app: {
    head: {
      title: "Mapbox Geospatial App",
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  modules: [
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    // Simplified Vuetify integration
    (options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],
  piniaPersistedstate: {
    storage: "localStorage",
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    define: {
      "window.global": {},
    },
  },
});
