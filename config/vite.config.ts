import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const TAILWIND_CONFIG = path.resolve(__dirname, "tailwind.config.ts");

export default defineConfig({
  root: ROOT,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss({ config: TAILWIND_CONFIG }), autoprefixer()],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: path.resolve(ROOT, "dist"),
  },
});
