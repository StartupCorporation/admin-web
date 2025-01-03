import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default ({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, "."));
  return defineConfig({
    plugins: [vue()],
    base: "/admin/",
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
    },
    build: {
      outDir: "dist/admin",
    },
    define: {
      "process.env": env,
    },
  });
};
