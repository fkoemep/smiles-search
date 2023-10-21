import { Options } from "$fresh/plugins/twind.ts";
import {defineConfig} from "https://esm.sh/@twind/core@1.1.3";

export default {
  selfURL: import.meta.url,
  ...defineConfig({
    darkMode: 'class',
  }),
} as unknown as Options;
