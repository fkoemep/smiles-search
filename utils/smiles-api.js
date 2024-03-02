import Bottleneck from "bottleneck";
// import { effect } from "@preact/signals";
import { fares } from "./flight.js";
import {
  abortControllersSignal,
  // concurrencySignal,
  requestsSignal,
} from "./signals.js";

const refreshIntervalSeconds = 75;//62
const maxConcurrency = 12;//11

let lastJobTime;
let limiter;
let wrappedSearch;


function addEntrytoSearchHistory() {
  return new Promise((resolve, reject) => {
    let searchHistoryArray = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistoryArray.push(Date.now());

    while (searchHistoryArray.length > maxConcurrency) {
      searchHistoryArray.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return Date.parse(b['date']) - Date.parse(a['date']);
      });
      searchHistoryArray.shift();
    }
    localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArray));

    resolve(true);
  });
}


const fetchFunction = async (url, headers) => {
  await addEntrytoSearchHistory();

  return fetch(url, headers).then(response => {
    if (!response.ok && response.status !== 406) {
      throw new Error('result === undefined');
    }

    return response;
  }
  );
};

//had to add this function because otherwise deploy fails
function initializeBottleneck() {
//limit to 5 requests every 10 s
  limiter = new Bottleneck({
    reservoir: maxConcurrency, // initial value
    reservoirRefreshAmount: maxConcurrency,
    reservoirRefreshInterval: (refreshIntervalSeconds + 2) * 1000, // must be divisible by 250

    // also use maxConcurrent and/or minTime for safety
    maxConcurrent: maxConcurrency, //concurrencySignal.value,
    minTime: 10,
    // strategy: Bottleneck.strategy.BLOCK,
  });

  wrappedSearch = limiter.wrap(fetchFunction);

  limiter.on("failed", async (error, jobInfo) => {
    const id = jobInfo.options.id;
    console.warn(`Job ${id} failed: ${error}`);

    //3 total attempts, counting the original request
    if (jobInfo.retryCount <= 1) {
      console.log(`Retrying job ${id} in 30s! Attempt number: ${jobInfo.retryCount}`);
      return refreshIntervalSeconds * 1000;
    }
  });

  // Listen to the "retry" event
  limiter.on("retry", (error, jobInfo) => console.log(`Now retrying ${jobInfo.options.id}, Attempt number: ${jobInfo.retryCount}`));
}


const defaultParams = {
  currencyCode: "ARS",
  isFlexibleDateChecked: false,
  r: "ar",
};

const headers = {
  'authorization': "Bearer 5Qh8c6RGZ95iaRxoXNUq6nTL8d3en9xo4vwbRyPByrc1x2kVA847rp",
  "x-api-key": "aJqPU7xNHl9qN3NVZnPaJ208aPo2Bh2p2ZV844tw",
  // "Content-Type": "application/json",
  // 'Accept': "application/json",
  'Region': "ARGENTINA",
  'Origin': "https://www.smiles.com.ar",
  'Referer': "https://www.smiles.com.ar/",
};

async function _getTax({ flight, fare, flight2, fare2, passengers, paramsObject }) {

  let parameters = {
      adults: passengers.adults,
      children: passengers.children,
      fareuid: fare.uid,
      uid: flight.uid,
      type: "SEGMENT_1",
      highlightText: fare.type,
  }

  if (Boolean(flight2) && Boolean(fare2)) {
    parameters.fareuid2 = fare2.uid;
    parameters.uid2 = flight2.uid;
    parameters.type2 = "SEGMENT_2";
  }

  const params = new URLSearchParams(parameters);

  requestsSignal.value = {
    ...requestsSignal.value,
    message:
        `tasas para el vuelo: ${paramsObject.originAirportCode}-${paramsObject.destinationAirportCode} ${paramsObject.departureDate.toLocaleDateString('es-AR')}${paramsObject.returnDateString}`,
  };

  const response = await wrappedSearch(
    "https://api-airlines-boarding-tax-blue.smiles.com.br/v1/airlines/flight/boardingtax?" +
      params.toString(),
    {
      headers,
    },
  );

  if (!response.ok) {
    return { money: 0 };
  }

  const { totals: { totalBoardingTax: tax } } = await response.json();

  return { miles: tax.miles, money: tax.money };
}

async function searchFlights(paramsObject) {
  const controller = new AbortController();
  abortControllersSignal.value = [...abortControllersSignal.value, controller];

  let dolarOficial = paramsObject.dolarOficial;
  delete paramsObject.dolarOficial;

  const params = new URLSearchParams({ ...defaultParams, ...paramsObject });


  const response = await wrappedSearch(
      "https://api-air-flightsearch-blue.smiles.com.br/v1/airlines/search?" +
      params.toString(),
      {
        signal: controller.signal,
        headers,
      },
      ).then(response => {
        if (!response.ok && response.status !== 406) {
          return { requestedFlightSegmentList: [] }
        }
        return response;
  });


  const { passenger: passenger, requestedFlightSegmentList: requestedFlightSegmentList } = await response.json();

  if (requestedFlightSegmentList.length === 0) {
    return null;
  }

  let departureDate = new Date(paramsObject.departureDate);
  departureDate.setHours(departureDate.getHours() + 3);

  let returnDateString = '';

  if(Boolean(paramsObject.returnDate)){
    let returnDate = new Date(paramsObject.returnDate);
    returnDate.setHours(returnDate.getHours() + 3);
    returnDateString =  ' - ' + returnDate.toLocaleDateString('es-AR');
  }

  let paramsObjectCopy = JSON.parse(JSON.stringify(paramsObject));
  paramsObjectCopy.returnDateString = returnDateString;
  paramsObjectCopy.departureDate = departureDate;

  requestsSignal.value = {
    ...requestsSignal.value,
    message:
      `vuelos: ${paramsObjectCopy.originAirportCode}-${paramsObjectCopy.destinationAirportCode} ${paramsObjectCopy.departureDate.toLocaleDateString('es-AR')}${paramsObjectCopy.returnDateString}`,
  };
  const FARE_TYPE = fares.club;


  return requestedFlightSegmentList.length === 1 ?

      await Promise.all(
          requestedFlightSegmentList[0]['flightList'].map(async (someFlight) => {
            const fare = someFlight['fareList'].find((someFare) =>
                someFare.type === FARE_TYPE
            );

            let airlineTax;

            if(!(typeof dolarOficial === 'number')){
              airlineTax = Boolean(fare['g3']) ? fare['g3']['costTax'] * (passenger.children + passenger.adults) : (await _getTax({ flight: someFlight, fare: fare, passengers: passenger, paramsObject: paramsObjectCopy })).money;
            }
            else{
              if(Boolean(fare['g3'])){
                airlineTax = fare['g3']['costTax'];
              }
              else{
                airlineTax = fare['legListCurrency'] === 'USD' ? fare.airlineTax * dolarOficial : fare.airlineTax;
              }
              airlineTax = airlineTax * (passenger.children + passenger.adults);
            }

            if (airlineTax === 0)
            {
              return null;
            }


            return {
              uid: someFlight.uid,
              origin: someFlight['departure']['airport']['code'],
              destination: someFlight['arrival']['airport']['code'],
              originForURL: paramsObject.originAirportCode,
              destinationForURL: paramsObject.destinationAirportCode,
              viajeFacil: someFlight['codeContext'] === "FFY",
              fare: {
                airlineTax: airlineTax * (passenger.children + passenger.adults),
                miles: fare.miles * (passenger.children + passenger.adults),
                money: fare.money * (passenger.children + passenger.adults),
                type: someFlight['sourceFare'],
              },
              departureDate: new Date(someFlight['departure']['date']),
              stops: someFlight.stops,
              durationInHours: someFlight.duration.hours,
              airline: someFlight.airline,
              availableSeats: someFlight.availableSeats,
              cabin: someFlight.cabin,
              passengers: passenger,
              legList: someFlight.legList,
            };
          }),
      )
      : await (async() => {

        let firstSegment = requestedFlightSegmentList[0];
        let secondSegment = requestedFlightSegmentList[1];

        const firstSegmentFlight = firstSegment['flightList'].find(flightListElement => flightListElement['fareList'].some(fare => fare.miles === firstSegment['bestPricing'].miles && fare.type === FARE_TYPE));
        const secondSegmentFlight = secondSegment['flightList'].find(flightListElement => flightListElement['fareList'].some(fare => fare.miles === secondSegment['bestPricing'].miles && fare.type === FARE_TYPE));

        if (!Boolean(firstSegmentFlight) || !Boolean(secondSegmentFlight)){
          return null;
        }

        const firstSegmentFare = firstSegmentFlight['fareList'].find((someFare) =>
            someFare.type === FARE_TYPE
        );
        const secondSegmentFare = secondSegmentFlight['fareList'].find((someFare) =>
            someFare.type === FARE_TYPE
        );

        let firstSegmentFareTax;
        let secondSegmentFareTax;

        if(!(typeof dolarOficial === 'number')){
          firstSegmentFareTax = Boolean(firstSegmentFare['g3']) ? firstSegmentFare['g3']['costTax'] * (passenger.children + passenger.adults) : (await _getTax(
              { flight: firstSegmentFlight, fare: firstSegmentFare, flight2: secondSegmentFlight, fare2: secondSegmentFare, passengers: passenger, paramsObject: paramsObjectCopy }
          )).money;
          secondSegmentFareTax = Boolean(secondSegmentFare['g3']) ? secondSegmentFare['g3']['costTax'] * (passenger.children + passenger.adults) : 0;
        }
        else{
          firstSegmentFareTax = firstSegmentFare['legListCurrency'] === 'USD' ? firstSegmentFare.airlineTax * dolarOficial : firstSegmentFare.airlineTax;

          secondSegmentFareTax = secondSegmentFare['legListCurrency'] === 'USD' ? secondSegmentFare.airlineTax * dolarOficial : secondSegmentFare.airlineTax;

          firstSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
          secondSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
        }

        if (firstSegmentFareTax === 0) {
          return null;
        }

        return {
          uid: firstSegmentFlight.uid + secondSegmentFlight.uid,
          origin: firstSegmentFlight['departure']['airport']['code'],
          originForURL: paramsObject.originAirportCode,
          destinationForURL: paramsObject.destinationAirportCode,
          destination: firstSegmentFlight['arrival']['airport']['code'],
          viajeFacil: firstSegmentFlight['codeContext'] === "FFY",
          returnViajeFacil: secondSegmentFlight['codeContext'] === "FFY",
          fare: {
            airlineTax: firstSegmentFareTax,
            miles: firstSegmentFare.miles,
            money: firstSegmentFare.money,
            type: firstSegmentFlight['sourceFare'],
          },
          returnFare: {
            airlineTax: secondSegmentFareTax,
            miles: secondSegmentFare.miles,
            money: secondSegmentFare.money,
            type: secondSegmentFare['sourceFare'],
          },
          departureDate: new Date(firstSegmentFlight['departure']['date']),
          returnDate: new Date(secondSegmentFlight['departure']['date']),
          stops: firstSegmentFlight.stops,
          stopsReturnFlight: secondSegmentFlight.stops,
          durationInHours: firstSegmentFlight.duration.hours,
          returnDurationInHours: secondSegmentFlight.duration.hours,
          airline: firstSegmentFlight.airline,
          returnAirline: secondSegmentFlight.airline,
          availableSeats: firstSegmentFlight.availableSeats,
          returnAvailableSeats: secondSegmentFlight.availableSeats,
          cabin: firstSegmentFlight.cabin,
          returnCabin: secondSegmentFlight.cabin,
          totalFare: {
            airlineTax: firstSegmentFareTax + secondSegmentFareTax,
            miles: (firstSegmentFare.miles + secondSegmentFare.miles) * (passenger.children + passenger.adults),
            money: (firstSegmentFare.money + secondSegmentFare.money) * (passenger.children + passenger.adults),
          },
          passengers: passenger,
          legList: firstSegmentFlight.legList,
          returnLegList: secondSegmentFlight.legList,
        };
      })()
}

export { searchFlights, refreshIntervalSeconds, maxConcurrency, limiter, initializeBottleneck }
