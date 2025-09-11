import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "src") } },
  server: { 
    host: true, 
    port: 5173,
    allowedHosts: [".gitpod.io"] // alle Gitpod-Hosts erlauben
  },
  preview: { host: true, port: 5173 },
});

