import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "lucide-react": fileURLToPath(new URL("./test/mocks/lucide-react.tsx", import.meta.url)),
      "next/image": fileURLToPath(new URL("./test/mocks/next-image.tsx", import.meta.url)),
      "next/link": fileURLToPath(new URL("./test/mocks/next-link.tsx", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup-act-environment.ts", "./vitest.setup.ts"],
  },
});
