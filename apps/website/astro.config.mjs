import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const isBuild = process.argv.includes("build");
if (isBuild) {
  process.env.CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV = "false";
}

export default defineConfig({
  output: "static",
  session: false,
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  integrations: [react()],
  server: { port: 3000 },
  vite: {
    envDir: isBuild ? false : undefined,
    envPrefix: ["VITE_", "PUBLIC_"],
    plugins: [tailwindcss()],
  },
});
