// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react"; // Importa la integración de React
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(),tailwind()], // Agrega la integración de React
  
});