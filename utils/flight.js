import { resultadosSignal } from "./signals.js";

const fares = {
  moneyClub: "SMILES_MONEY_CLUB",
  club: "SMILES_CLUB",
};

const tripTypes = {
  RETURN: "1",
  ONE_WAY: "2",
};

function getLink(flight) {

  const params= flight.returnDate ? new URLSearchParams({
      originAirportCode: flight.originForURL,
      destinationAirportCode: flight.destinationForURL,
      departureDate: flight.departureDate.getTime(),
      adults: flight.passengers.adults,
      infants: flight.passengers.infants,
      children: flight.passengers.children,
      cabinType: flight.cabin,
      tripType : tripTypes.RETURN,
      returnDate : flight.returnDate.getTime(),
  }) :
  new URLSearchParams({
    originAirportCode: flight.originForURL,
    destinationAirportCode: flight.destinationForURL,
    departureDate: flight.departureDate.getTime(),
    adults: flight.passengers.adults,
    infants: flight.passengers.infants,
    children: flight.passengers.children,
    cabinType: flight.cabin,
    tripType: tripTypes.ONE_WAY,
  });

  return `https://www.smiles.com.ar/emission?${params.toString()}`;
}


function sortByMilesAndTaxes(flightList) {
  return flightList.sort(
    (a, b) => {

      if (Boolean(a.returnDate) && Boolean(b.returnDate) && (a.totalFare.miles) === (b.totalFare.miles) && (a.totalFare.airlineTax) === (b.totalFare.airlineTax)) {
        return a.departureDate - b.departureDate;
      }
      else if (Boolean(a.returnDate) && Boolean(b.returnDate) && (a.totalFare.miles) === (b.totalFare.miles)) {
        return (a.totalFare.airlineTax) - (b.totalFare.airlineTax);
      }
      else if(Boolean(a.returnDate) && Boolean(b.returnDate)){
        return (a.totalFare.miles) - (b.totalFare.miles)
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



const cabinas = {
  "all": "Todas",
  "ECONOMIC": "Económica",
  "PREMIUM_ECONOMIC": "Premium Economy",
  "COMFORT": "Confort (GOL)",
  "BUSINESS": "Ejecutiva",
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
  "AC": "Air Canadá",
  "IB": "Iberia",
  "EK": "Emirates",
  "TK": "Turkish Airlines",
  "TP": "TAP Portugal",
  "SA": "SouthAfrican Airways",
  "ET": "Ethiopian Airways",
  "AT": "Royal Air Maroc",
  "KE": "Korean Air",
  "2Z": "Voe Pass",
  "G3": "Gol",
  "VH": "Viva Air",
  "A3": "Aegean",
  "MS": "Egyptair",
  "AS": "Alaska Airlines",
  "EI": "Aer Lingus",
  "VA": "Virgin Australia",
  "V7": "Volotea",
  "NH": "Ana",
  "XW": "Sky Express",
  "AI": "Air India",
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
  "MU": "China Estern",
  "ZP": "Paranair",
  "ME": "MEA",
  "GA": "Garuda Indonesia",
  "HO": "Juneyao Airlines",
  "SG": "SpiceJet",
  "PY": "Surinam Airways",
  "PS": "UIA",
  "CX": "Cathay Pacific",
  "TG": "THAI",
  "JL": "Japan Airlines",
  "S7": "S7 Airlines",
  "FA": "FlySafair",
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
const vuelosABrasil = [{ id: "false", name: "GOL" }, {
  id: "true",
  name: "Otras aerolíneas",
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
  { id: "airports", name: "Aeropuertos y ciudades" },
  { id: "from-airport-to-region", name: "De aeropuerto a región" },
  { id: "from-region-to-airport", name: "De región a aeropuerto" },
  { id: "from-region-to-region", name: "De región a región" },
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
  vuelosABrasil,
  smilesAndMoney,
  searchTypes,
  classTypes,
  tarifas,
  defaults: {
    originAirportCode: "BUE",
    cabinas: [],
    airlineCodes: [],
    escalas: escalas[''],
    viajeFacil: viajeFacil[0],
    tarifas: tarifas[0],
    searchTypes: searchTypes[0],
    classTypes: classTypes[0],
  },
};

function filterFlights({ allFlights, daySearch, filters, airlineCodes, layoverAirportCodes, cabins }) {

  const filterFunction = (someFlight) => {
    let cabinFilter = true,
      airlinesFilter = true,
      stopsFilter = true,
      viajeFacilFilter = true,
      tarifaFilter = true,
      hoursFilter = true,
      layoverAirportsFilter = true;

    let layoverMatch = false;
    let layoverReturnMatch = false;

    if (cabins.length > 0) {
      cabinFilter = cabins.includes(someFlight.cabin) && (!Boolean(someFlight.returnCabin) || cabins.includes(someFlight.returnCabin));
    }
    if (airlineCodes.length > 0) {
      airlinesFilter = airlineCodes.includes(someFlight.airline.code) || (Boolean(someFlight.returnAirline) && airlineCodes.includes(someFlight.returnAirline.code));
    }

    if (layoverAirportCodes.length > 0 && someFlight.stops > 0) {
      layoverMatch = someFlight.legList.some(function(leg) {


        let departureMatches = leg.departure.airport.city !== someFlight.legList[0].departure.airport.city && layoverAirportCodes.includes(leg.departure.airport.code);

        let arrivalMatches = leg.arrival.airport.city !== someFlight.legList.slice(-1)[0].arrival.airport.city && layoverAirportCodes.includes(leg.arrival.airport.code);

        return departureMatches || arrivalMatches;

      }, []);
    }

    if (Boolean(someFlight.returnDate) && layoverAirportCodes.length > 0 && someFlight.stopsReturnFlight > 0) {
      layoverReturnMatch = someFlight.returnLegList.some(function(leg) {

        let departureMatches = leg.departure.airport.city !== someFlight.legList.slice(-1)[0].arrival.airport.city && layoverAirportCodes.includes(leg.departure.airport.code);

        let arrivalMatches = leg.arrival.airport.city !== someFlight.legList[0].departure.airport.city && layoverAirportCodes.includes(leg.arrival.airport.code);

        return departureMatches || arrivalMatches;

      }, []);
    }

    if(layoverAirportCodes.length > 0){
      layoverAirportsFilter = (layoverMatch || layoverReturnMatch) && !(((!Boolean(someFlight.stopsReturnFlight) && someFlight.stops === 0) || (Boolean(someFlight.stopsReturnFlight) && someFlight.stopsReturnFlight === 0 && someFlight.stops === 0)));
    }

    if (
      filters["stops[id]"] &&
      filters["stops[id]"] !== filtros.defaults.escalas.id
    ) {
      stopsFilter = someFlight.stops <= Number(filters["stops[id]"]) && (!Boolean(someFlight.stopsReturnFlight) || someFlight.stopsReturnFlight <= Number(filters["stops[id]"]));
    }
    if (filters["viaje-facil[id]"] === "1") {
      viajeFacilFilter = someFlight.viajeFacil && (!Boolean(someFlight.returnViajeFacil) || someFlight.returnViajeFacil);
    }
    if (
      filters["tarifa[id]"] &&
      filters["tarifa[id]"] !== filtros.defaults.tarifas.id
    ) {
      tarifaFilter = someFlight.fare.type === filters["tarifa[id]"] && (!Boolean(someFlight.returnFare) || someFlight.returnFare.type === filters["tarifa[id]"]);
    }
    if (filters["maxhours"]) {
      hoursFilter = someFlight.durationInHours <= Number(filters["maxhours"]) && (!Boolean(someFlight.returnDurationInHours) || someFlight.returnDurationInHours <= Number(filters["maxhours"]));
    }
    return cabinFilter && airlinesFilter && stopsFilter && viajeFacilFilter && tarifaFilter && hoursFilter && layoverAirportsFilter;
  };

  let filtered = allFlights.filter(filterFunction);

  return filtered;
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
};
