import {today, formatDateWithTimezone} from "./dates.js";

const fares = {
  moneyClub: "SMILES_MONEY_CLUB",
  club: "SMILES_CLUB",
};

const tripTypes = {
  RETURN: "1",
  ONE_WAY: "2",
};

const cabinas = {
  "all": "Todas",
  "ECONOMIC": "Económica",
  "PREMIUM_ECONOMIC": "Premium Economy",
  "COMFORT": "Confort (GOL)",
  "BUSINESS": "Ejecutiva",
};
const searchRegions = {
  "Argentina": "Argentina",
  "Brasil": "Brasil",
};
const airlineCodes = {
  "AA": "American Airlines",
  "AR": "Aerolíneas Argentinas",
  "UX": "Air Europa",
  "AM": "AeroMéxico",
  "AV": "Avianca",
  "CM": "Copa Airlines",
  "AF": "Air France",
  "KL": "KLM",
  "BA": "British Airways",
  "EY": "Etihad Airways",
  "AC": "Air Canadá",
  "IB": "Iberia",
  "EK": "Emirates",
  "TK": "Turkish Airlines",
  "TP": "TAP Portugal",
  "SA": "SouthAfrican Airways",
  "ET": "Ethiopian Airways",
  "AZ": "ITA Airways",
  "AT": "Royal Air Maroc",
  "DT": "TAAG",
  "VY": "Vueling",
  "HR": "Hahn Air",
  "KE": "Korean Air",
  "2Z": "Voe Pass",
  "G3": "Gol",
  "VH": "Viva Air",
  "A3": "Aegean",
  "MS": "Egyptair",
  "AS": "Alaska Airlines",
  "EI": "Aer Lingus",
  "VA": "Virgin Australia",
  "WS": "WestJet",
  "V7": "Volotea",
  "NH": "Ana",
  "XW": "Sky Express",
  "AI": "Air India",
  "SN": "Brussels Airlines",
  "4O": "Interjet",
  "OU": "Croatia Airlines",
  "UP": "Bahamas Air",
  "HA": "Hawaiian Airlines",
  "OB": "Boliviana de Aviación",
  "TR": "Scoot",
  "OK": "Czech Airlines",
  "JQ": "Jetstar",
  "MN": "Kulula",
  "PG": "Bangkok Airways",
  "WM": "Winair",
  "KQ": "Kenya Airways",
  "BT": "Air Baltic",
  "MU": "China Eastern",
  "ZP": "Paranair",
  "ME": "MEA",
  "FZ": "Flydubai",
  "GA": "Garuda Indonesia",
  "HO": "Juneyao Airlines",
  "HX": "Hong Kong Airlines",
  "JX": "STARLUX",
  "BW": "Caribbean Airlines",
  "SG": "SpiceJet",
  "PY": "Surinam Airways",
  "PS": "UIA",
  "CX": "Cathay Pacific",
  "TG": "THAI",
  "JL": "Japan Airlines",
  "S7": "S7 Airlines",
  "FA": "FlySafair",
  "SV": "Saudia",
  "MH": "Malaysia Airlines",
  "H2": "SKY Airline",
};

const escalas = {
  "": "Cualquier número de escalas",
  "0": "Solo vuelos directos",
  "1": "1 escala o menos",
  "2": "2 escalas o menos",
};

const viajeFacil = [{ id: "", name: "Indistinto" }, {
  id: "1",
  name: "Sólo viaje fácil",
}];
const tarifas = [{ id: "", name: "Todas" }, {
  id: "AWARD",
  name: "Sólo Award",
}];
const smilesAndMoney = [{ id: "", name: "Sólo millas" }, {
  id: "1",
  name: "Smiles and Money",
}];
const searchTypes = [
  { id: "airports", name: "Aeropuertos/ciudades" },
  { id: "from-airport-to-region", name: "Aeropuerto a región" },
  { id: "from-region-to-airport", name: "Región a aeropuerto" },
  { id: "from-region-to-region", name: "Región a región" },
];

const classTypes = [
  { id: "all", name: "Todas" },
  { id: "economic", name: "Económica" },
  { id: "business", name: "Ejecutiva" },
];

const filtros = {
  cabinas,
  airlineCodes,
  escalas,
  viajeFacil,
  smilesAndMoney,
  searchTypes,
  classTypes,
  tarifas,
  searchRegions,
  defaults: {
    originAirportCode: "BUE",
    cabinas: [],
    airlineCodes: [],
    escalas: escalas[''],
    viajeFacil: viajeFacil[0],
    tarifas: tarifas[0],
    baggage: false,
    searchTypes: searchTypes[0],
    classTypes: classTypes[0],
    searchRegions: searchRegions.Argentina,
  },
};


function getLink(flight) {

  let params= {
        departureDate: flight.departureDate.getTime(),
        adults: flight.passengers.adults,
        infants: flight.passengers.infants,
        children: flight.passengers.children,
        cabinType: flight.cabin,
        tripType: tripTypes.ONE_WAY,
      };

  if (flight.returnDate) {
    params = {...params,
      tripType : tripTypes.RETURN,
      returnDate : flight.returnDate.getTime(),
    }
  }
  params[flight.searchRegion === filtros.defaults.searchRegions ? 'originAirportCode' : 'originAirport'] = flight.originForURL;
  params[flight.searchRegion === filtros.defaults.searchRegions ? 'destinationAirportCode' : 'destinationAirport'] = flight.destinationForURL;

  const urlParams = new URLSearchParams(params);
  const baseUrl = flight.searchRegion === filtros.defaults.searchRegions ? 'https://www.smiles.com.ar/emission' : 'https://www.smiles.com.br/mfe/emissao-passagem/';
  return `${baseUrl}?${urlParams.toString()}`;
}

function sortByMilesAndTaxes(flightList) {
  return flightList.sort(
      (a, b) => {

        if (Boolean(a.returnDate) && Boolean(b.returnDate) && (a.fare.miles) === (b.fare.miles) && (a.fare.airlineTax) === (b.fare.airlineTax)) {
          return a.departureDate - b.departureDate;
        }
        else if (Boolean(a.returnDate) && Boolean(b.returnDate) && (a.fare.miles) === (b.fare.miles)) {
          return (a.fare.airlineTax) - (b.fare.airlineTax);
        }
        else if(Boolean(a.returnDate) && Boolean(b.returnDate)){
          return (a.fare.miles) - (b.fare.miles)
        }

        else if (a.fare.miles === b.fare.miles) {
          return a.fare.airlineTax - b.fare.airlineTax;
        }
        else if (a.fare.miles === b.fare.miles && a.fare.airlineTax === b.fare.airlineTax) {
          return a.departureDate - b.departureDate;
        }
        return a.fare.miles - b.fare.miles;
      },
  );
}

function filterFlights({ allFlights, daySearch, filters, airlineCodes, layoverAirportCodes, cabins }) {

  const filterFunction = (someFlight) => {
    let cabinFilter = true,
      airlinesFilter = true,
      stopsFilter = true,
      viajeFacilFilter = true,
      tarifaFilter = true,
      hoursFilter = true,
      layoverAirportsFilter = true,
      baggageFilter = true,
      layoverMatch = false,
      layoverReturnMatch = false;

    if (cabins.length > 0) {
      cabinFilter = cabins.includes(someFlight.cabin) && (!Boolean(someFlight.returnCabin) || cabins.includes(someFlight.returnCabin));
    }
    if (airlineCodes.length > 0) {
      airlinesFilter = airlineCodes.filter(code => someFlight.airlines.airlineCodesList.includes(code)).length > 0 || (Boolean(someFlight.returnDate) && airlineCodes.filter(code => someFlight.airlines.return.airlineCodesList.includes(code)).length > 0);
    }

    if (layoverAirportCodes.length > 0 && someFlight.stops.numberOfStops > 0) {
      layoverMatch = layoverAirportCodes.filter(code => someFlight.stops.stopList.split(',').includes(code)).length > 0;
    }

    if (Boolean(someFlight.returnDate) && layoverAirportCodes.length > 0 && someFlight.stops.return.numberOfStops > 0) {
      layoverReturnMatch = layoverAirportCodes.filter(code => someFlight.stops.return.stopList.split(',').includes(code)).length > 0;
    }

    if(layoverAirportCodes.length > 0){
      layoverAirportsFilter = (layoverMatch || layoverReturnMatch) && !(((!Boolean(someFlight.returnDate) && someFlight.stops.numberOfStops === 0) || (Boolean(someFlight.returnDate) && someFlight.stops.return.numberOfStops === 0 && someFlight.stops.numberOfStops === 0)));
    }

    if (filters['stops[id]'] && filters['stops[id]'] !== filtros.defaults.escalas.id) {
      stopsFilter = someFlight.stops.numberOfStops <= Number(filters['stops[id]']) && (!Boolean(someFlight.returnDate) || someFlight.stops.return.numberOfStops <= Number(filters['stops[id]']));
    }

    if (filters['viaje-facil[id]'] === "1") {
      viajeFacilFilter = someFlight.viajeFacil && (!Boolean(someFlight.returnViajeFacil) || someFlight.returnViajeFacil);
    }

    if (filters['tarifa[id]'] && filters['tarifa[id]'] !== filtros.defaults.tarifas.id) {
      tarifaFilter = someFlight.fare.type === filters['tarifa[id]'] && (!Boolean(someFlight.fare.return) || someFlight.fare.return.type === filters['tarifa[id]']);
    }

    if (filters.maxhours) {
      hoursFilter = (someFlight.duration.hours < Number(filters.maxhours) || (someFlight.duration.hours === Number(filters.maxhours) && someFlight.duration.minutes === 0)) && (!Boolean(someFlight.returnDate) || someFlight.duration.return.hours <= Number(filters.maxhours));
    }

    if (filters.baggage === 'true' ) {
      baggageFilter = someFlight.baggage > 0 && (!Boolean(someFlight.returnDate) || someFlight.returnBaggage > 0);
    }

    return cabinFilter && airlinesFilter && stopsFilter && viajeFacilFilter && tarifaFilter && hoursFilter && layoverAirportsFilter && baggageFilter;
  };

  return allFlights.filter(filterFunction);
}

export {
  fares,
  filterFlights,
  filtros,
  getLink,
  sortByMilesAndTaxes,
  tripTypes,
  airlineCodes,
  cabinas,
  searchRegions,
};
