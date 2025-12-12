import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    {
      name: "enforce-api-base-https",
      apply: "build",
      buildStart() {
        const base = process.env.VITE_API_BASE || "";
        if (base && !base.startsWith("https://")) {
          this.error("VITE_API_BASE must start with https://");
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "https://atlas-homes-api-gxdqfjc2btc0atbv.centralus-01.azurewebsites.net",
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ""), // Removes /api when forwarding
    },
  },
},

  test: {
    environment: "node",
  },
}));
