import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Add this
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add this
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@workspace/api-client-react": path.resolve(__dirname, "./src/lib/api-client.ts")
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
  },
});

