import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const REPO_NAME = "routine-wonderful";

export default defineConfig(({ mode }) => ({
  // For production builds, set the base to your repo name; for dev, use "/"
  base: mode === 'production' ? `/${REPO_NAME}/` : '/',
  
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
