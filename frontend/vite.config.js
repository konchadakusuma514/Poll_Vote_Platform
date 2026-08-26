import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/Poll_Vote_Platform/",
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
});