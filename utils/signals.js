import { signal, useSignal } from "@preact/signals";
import { persistedSignal } from "./storage.ts";
import { EMPTY_REGION } from "utils/constants.js";
import {filtros} from "./flight.js";

const requestsSignal = signal({});
const abortControllersSignal = signal([]);
const resultadosSignal = persistedSignal(10, "smiles:resultados");
const concurrencySignal = persistedSignal(13, "smiles:concurrency");
const themeSignal = persistedSignal('dark', "theme");
const countrySignal = persistedSignal(filtros.defaults.searchRegions, "country");

let defaultRegionsObject = 	{
  SAMERICA: "SCL,LIM,BOG,BUE,MVD,ASU,UIO",
      LIMITROFE: "SCL,MVD,ASU,SAO,RIO",
      ARGENTINA: "BUE,COR,ROS,MDZ,NQN,BRC,IGR",
      BRASIL: "RIO,SAO,FLN,MCZ,SSA,REC,NAT,IGU",
      COLOMBIA: "BOG,ADZ,CTG,SMR",
      CARIBE: "CUN,PTY,PUJ,SJO,AUA,HAV,CTG,SJU",
      NAMERICA: "MEX,CHI,NYC,LAX,DFW,SFO,LAS",
      FLORIDA: "MIA,FLL,MCO,TPA",
      HAWAII: "HNL,LIH,KOA,OGG",
      USAESTE: "NYC,WAS,PHL,BOS,DTT,CHI",
      USAOESTE: "LAX,HNL,SFO,LAS,SAN,SMF",
      USASUR: "DFW,PHX,IAH,SAT,ATL",
      CANADA: "YTO,YMQ,YVR,YOW,YQB",
      EUROPA: "LIS,MAD,BCN,PAR,AMS,ROM,LON,FRA,IST",
      CEUROPA: "BRU,ATH,BER,ZRH,VIE,PRG",
      ESPANA: "MAD,BCN,VLC,PMI,AGP,IBZ,SVQ,BIO",
      ITALIA: "ROM,MIL,BLQ,VCE,NAP",
      FRANCIA: "PAR,MRS,NCE,LYS,NTE,TLS",
      NORDICO: "CPH,HEL,STO,OSL,BGO,SVG,GOT",
      ASIA: "DXB,BKK,TLV,TYO,SEL,DPS",
      MORIENTE: "IST,CAI,DXB,TLV,DOH",
      SASIA: "BKK,SIN,MLE,DPS,SGN,KUL",
      NASIA: "TYO,SEL,HKG",
      INDIA: "DEL,BLR,BOM,CCU,JAI",
      AFRICA: "CAI,SEZ,CPT,DAR,ADD,RBA",
      OCEANIA: "AKL,SYD,MEL"
}

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
