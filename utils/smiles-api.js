import FetchRetry from "fetch-retry";
import Bottleneck from "bottleneck";
import { effect } from "@preact/signals";
import { fares, tripTypes } from "./flight.js";
import {
  abortControllersSignal,
  concurrencySignal,
  requestsSignal,
} from "./signals.js";

const limiter = new Bottleneck({
  maxConcurrent: concurrencySignal.value,
});

effect(() => {
  limiter.updateSettings({
    maxConcurrent: concurrencySignal.value,
  });
});

const fetch = limiter.wrap(FetchRetry(globalThis.fetch, {
  retryDelay: function (attempt, _error, _response) {
    return Math.pow(2, attempt) * 1000;
  },
  retryOn: async function (attempt, error, response) {
    if (attempt > 3) {
      return false;
    }
    const status = response?.status;
    if (status === 452) {
      const { error: errorMessage, code: code} = await response.json();

      if (Boolean(errorMessage) && !errorMessage.startsWith("TypeError")) {
        throw new Error(errorMessage);
      }

      if (Boolean (code) && code === '113') {
        return false;
      }

      console.log(`retrying, attempt number ${attempt + 1}`);
      return true;
    }
    // retry on any network error, or 5xx status codes
    if (error !== null || status >= 500) {
      if (error?.name === "AbortError"){
        return false;
      }
      console.log(`retrying, attempt number ${attempt + 1}`);
      console.log({ error, status });
      return true;
    }
  },
}));

const defaultParams = {
  currencyCode: "ARS",
  isFlexibleDateChecked: false,
  r: "ar",
};

const headers = {
  authorization:
    "Bearer Ghlpz2Fv1P5k9zGSUz2Z3l5jdVmy0aNECen0CV5v1sevBwTX9cA9kc",
  "x-api-key": "aJqPU7xNHl9qN3NVZnPaJ208aPo2Bh2p2ZV844tw",
  "Content-Type": "application/json",
  Accept: "application/json",
  region: "ARGENTINA",
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

  const response = await fetch(
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

  const response = await fetch(
    "https://api-air-flightsearch-blue.smiles.com.br/v1/airlines/search?" +
      params.toString(),
    {
      signal: controller.signal,
      headers,
    },
  );
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


  const transformedFlights= requestedFlightSegmentList.length === 1 ?

      await Promise.all(
          requestedFlightSegmentList[0]['flightList'].map(async (someFlight) => {
            const fare = someFlight.fareList.find((someFare) =>
                someFare.type === FARE_TYPE
            );

            let airlineTax;

            if(!(typeof dolarOficial === 'number')){
              airlineTax = Boolean(fare.g3) ? fare.g3.costTax * (passenger.children + passenger.adults) : (await _getTax({ flight: someFlight, fare: fare, passengers: passenger, paramsObject: paramsObjectCopy })).money;
            }
            else{
              if(Boolean(fare.g3)){
                airlineTax = fare.g3.costTax;
              }
              else{
                airlineTax = fare.legListCurrency === 'USD' ? fare.airlineTax * dolarOficial : fare.airlineTax;
              }
              airlineTax = airlineTax * (passenger.children + passenger.adults);
            }

            if (airlineTax === 0)
            {
              return null;
            }


            return {
              uid: someFlight.uid,
              origin: someFlight.departure.airport.code,
              destination: someFlight.arrival.airport.code,
              originForURL: paramsObject.originAirportCode,
              destinationForURL: paramsObject.destinationAirportCode,
              viajeFacil: someFlight.codeContext === "FFY",
              fare: {
                airlineTax: airlineTax * (passenger.children + passenger.adults),
                miles: fare.miles * (passenger.children + passenger.adults),
                money: fare.money * (passenger.children + passenger.adults),
                type: someFlight.sourceFare,
              },
              departureDate: new Date(someFlight.departure.date),
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

        const firstSegmentFlight = firstSegment.flightList.find(flightListElement => flightListElement.fareList.some(fare => fare.miles === firstSegment.bestPricing.miles && fare.type === FARE_TYPE));
        const secondSegmentFlight = secondSegment.flightList.find(flightListElement => flightListElement.fareList.some(fare => fare.miles === secondSegment.bestPricing.miles && fare.type === FARE_TYPE));

        if (!Boolean(firstSegmentFlight) || !Boolean(secondSegmentFlight)){
          return null;
        }

        const firstSegmentFare = firstSegmentFlight.fareList.find((someFare) =>
            someFare.type === FARE_TYPE
        );
        const secondSegmentFare = secondSegmentFlight.fareList.find((someFare) =>
            someFare.type === FARE_TYPE
        );

        let firstSegmentFareTax;
        let secondSegmentFareTax;

        if(!(typeof dolarOficial === 'number')){
          firstSegmentFareTax = Boolean(firstSegmentFare.g3) ? firstSegmentFare.g3.costTax * (passenger.children + passenger.adults) : (await _getTax(
              { flight: firstSegmentFlight, fare: firstSegmentFare, flight2: secondSegmentFlight, fare2: secondSegmentFare, passengers: passenger, paramsObject: paramsObjectCopy }
          )).money;
          secondSegmentFareTax = Boolean(secondSegmentFare.g3) ? secondSegmentFare.g3.costTax * (passenger.children + passenger.adults) : 0;
        }
        else{
          firstSegmentFareTax = firstSegmentFare.legListCurrency === 'USD' ? firstSegmentFare.airlineTax * dolarOficial : firstSegmentFare.airlineTax;

          secondSegmentFareTax = secondSegmentFare.legListCurrency === 'USD' ? secondSegmentFare.airlineTax * dolarOficial : secondSegmentFare.airlineTax;

          firstSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
          secondSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
        }

        if (firstSegmentFareTax === 0) {
          return null;
        }

        return {
          uid: firstSegmentFlight.uid + secondSegmentFlight.uid,
          origin: firstSegmentFlight.departure.airport.code,
          originForURL: paramsObject.originAirportCode,
          destinationForURL: paramsObject.destinationAirportCode,
          destination: firstSegmentFlight.arrival.airport.code,
          viajeFacil: firstSegmentFlight.codeContext === "FFY",
          returnViajeFacil: secondSegmentFlight.codeContext === "FFY",
          fare: {
            airlineTax: firstSegmentFareTax,
            miles: firstSegmentFare.miles,
            money: firstSegmentFare.money,
            type: firstSegmentFlight.sourceFare,
          },
          returnFare: {
            airlineTax: secondSegmentFareTax,
            miles: secondSegmentFare.miles,
            money: secondSegmentFare.money,
            type: secondSegmentFare.sourceFare,
          },
          departureDate: new Date(firstSegmentFlight.departure.date),
          returnDate: new Date(secondSegmentFlight.departure.date),
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

  return transformedFlights;
}

export { searchFlights };
