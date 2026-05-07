import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//   ],
// })

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Admin pages are lazy-loaded and split into their own chunk
          // so regular member users never download admin code
          if (
            id.includes("/components/Admin/") ||
            id.includes("/components/AdminLayout/") ||
            id.includes("/pages/admin/")
          ) {
            return "admin";
          }
        },
      },
    },
  },
}));
