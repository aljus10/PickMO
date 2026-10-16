import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base allows deployment on any subpath (e.g., GitHub Pages) or root domain (Vercel)
  base: "./"
});
