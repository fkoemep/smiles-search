import { signal, useSignal } from "@preact/signals";
import { persistedSignal } from "./storage.ts";
import { EMPTY_REGION } from "utils/constants.js";
import defaultRegionsObject from "juani/data/regions.js";
import {filtros} from "./flight.js";

const requestsSignal = signal({});
const abortControllersSignal = signal([]);
const resultadosSignal = persistedSignal(10, "smiles:resultados");
const concurrencySignal = persistedSignal(13, "smiles:concurrency");
const themeSignal = persistedSignal('dark', "theme");
const countrySignal = persistedSignal(filtros.defaults.searchRegions, "country");


const defaultRegions = Object.entries(defaultRegionsObject).map((
  [name, airports],
) => ({ name, airports }));
const regionsSignal = persistedSignal(
  [...defaultRegions, EMPTY_REGION],
  "regions",
);

export {
  abortControllersSignal,
  concurrencySignal,
  themeSignal,
  countrySignal,
  regionsSignal,
  requestsSignal,
  resultadosSignal,
};
