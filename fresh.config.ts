import { defineConfig } from "$fresh/server.ts";
import twindPlugin from "$fresh/plugins/twindv1.ts";
import twindConfig from "./twind.config.ts";
// import tailwind from "$fresh/plugins/tailwind.ts";


export default defineConfig({
  plugins: [twindPlugin(twindConfig)],
  // plugins: [tailwind()],
});
