import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],

  /*
  |--------------------------------------------------------------------------
  | Ruta base para GitHub Pages
  |--------------------------------------------------------------------------
  | Debe coincidir exactamente con el nombre del repositorio.
  |--------------------------------------------------------------------------
  */
  base: "/vuejs-apispublicas/",
});
