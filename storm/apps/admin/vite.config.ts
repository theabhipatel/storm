import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3300 },
  preview: { port: 3300 },
  build: { outDir: "dist", sourcemap: true },
});
