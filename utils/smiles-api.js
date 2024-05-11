import Bottleneck from "bottleneck";
import {airlineCodes, fares} from "./flight.js";
import { filtros } from "utils/flight.js";
import {
  abortControllersSignal,
  requestsSignal,
} from "./signals.js";

const refreshIntervalSeconds = 75;//62
const maxConcurrency = 12;//11
const milisecondsBetweenRequests = 333;

let limiter;
let wrappedSearch;


async function getUsdExchangeRate(searchRegion) {
  const today = new Date();
  let previousDate = new Date();
  previousDate.setDate(previousDate.getDate() - 2);
  previousDate = previousDate.toLocaleDateString('en-US');
  const currentDay = today.toLocaleDateString('en-US');

  if(searchRegion === filtros.defaults.searchRegions){
    let arsRate = JSON.parse(localStorage.getItem("ARS")) || undefined;

    if(arsRate !== undefined && arsRate.rate > 1 && (arsRate.date === currentDay || [0,6].includes(today.getDay()))){
      return arsRate.rate;
    }

    else{
      const exchangeRate = fetch('https://mercados.ambito.com//dolarnacion/historico-cierre').then(response => response.json()).then(json => {
        return Number(json.venta.replace(",", "."));
      }).catch(function (err) {
        console.warn('Something went wrong.', err);
        return 1;
      });

      localStorage.setItem("ARS", JSON.stringify({rate: await exchangeRate, date: new Date().toLocaleDateString('en-US')}));

      return exchangeRate;
    }
  }

  else {
    let brlRate = JSON.parse(localStorage.getItem("BRL")) || undefined;

    if(brlRate !== undefined && brlRate.rate > 1 && (brlRate.date === currentDay || [0,6].includes(today.getDay()))){
      return brlRate.rate;
    }

    else{
      const exchangeRate = fetch('https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodoFechamento(codigoMoeda=@codigoMoeda,dataInicialCotacao=@dataInicialCotacao,dataFinalCotacao=@dataFinalCotacao)?@codigoMoeda=\'USD\'&@dataInicialCotacao=\''+ previousDate +'\'&@dataFinalCotacao=\'' + currentDay + '\'&$format=json\n').then(response => response.json()).then(json => {
        return Number(json.value[0].cotacaoCompra);
      }).catch(function (err) {
        console.warn('Something went wrong.', err);
        return 1;
      });

      localStorage.setItem("BRL", JSON.stringify({rate: await exchangeRate, date: new Date().toLocaleDateString('en-US')}));

      return exchangeRate;
    }

  }
}


function addEntrytoSearchHistory() {
  return new Promise((resolve, reject) => {
    let searchHistoryArray = JSON.parse(localStorage.getItem("searchHistory")) || [];
    searchHistoryArray.push(Date.now());

    while (searchHistoryArray.length > maxConcurrency) {
      searchHistoryArray.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return Date.parse(b.date) - Date.parse(a.date);
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
    if (!response.ok && ![406, 452].includes(response.status)) {
      throw new Error('result === undefined');
    }

    return response;
  }
  );
};

//had to add this function because otherwise deploy fails
function initializeBottleneck() {
  limiter = new Bottleneck({
    reservoir: maxConcurrency, // initial value
    reservoirRefreshAmount: maxConcurrency,
    reservoirRefreshInterval: (refreshIntervalSeconds + 2) * 1000, // must be divisible by 250

    maxConcurrent: maxConcurrency, //concurrencySignal.value,
    minTime: milisecondsBetweenRequests,
  });

  wrappedSearch = limiter.wrap(fetchFunction);

  limiter.on("failed", async (error, jobInfo) => {
    const id = jobInfo.options.id;
    console.warn(`Job ${id} failed: ${error}`);

    //3 total attempts, counting the original request
    if (jobInfo.retryCount <= 1) {
      console.log(`Retrying job ${id} in ${refreshIntervalSeconds}s! Attempt number: ${jobInfo.retryCount}`);
      return refreshIntervalSeconds * 1000;
    }
  });

  limiter.on("retry", (error, jobInfo) => console.log(`Now retrying ${jobInfo.options.id}, Attempt number: ${jobInfo.retryCount}`));
}

async function _getTax({ flight, fare, flight2, fare2, passengers, paramsObject, headers }) {

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
    "https://api-airlines-boarding-tax-prd.smiles.com.br/v1/airlines/flight/boardingtax?" +
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


  const fastSearch = paramsObject.fastSearch === "true"

  delete paramsObject.fastSearch;

  const searchRegion = paramsObject.searchRegion;
  delete paramsObject.searchRegion;

  const exchangeRate = fastSearch ? await getUsdExchangeRate(searchRegion) : 1;

  const defaultParams = {};
  const headers = {
    "x-api-key" : "aJqPU7xNHl9qN3NVZnPaJ208aPo2Bh2p2ZV844tw"
  };

  if(searchRegion === filtros.defaults.searchRegions){
    headers.region = "ARGENTINA";
    headers.authorization = "Bearer 5Qh8c6RGZ95iaRxoXNUq6nTL8d3en9xo4vwbRyPByrc1x2kVA847rp";
    headers.channel = "Web";
    defaultParams.currencyCode = "ARS";
    defaultParams.isFlexibleDateChecked = false;
    defaultParams.r = "ar";
  }

  const params = new URLSearchParams({ ...defaultParams, ...paramsObject });

  const response = await wrappedSearch(
      // "https://api-air-flightsearch-blue.smiles.com.br/v1/airlines/search?" +
      // "https://api-air-flightsearch-green.smiles.com.br/v1/airlines/search?" +

      "https://api-air-flightsearch-prd.smiles.com.br/v1/airlines/search?" +
      params.toString(),
      {
        signal: controller.signal,
        headers,
      },
      ).then(response => {
        if (!response.ok && ![406, 452].includes(response.status)) {
          return { requestedFlightSegmentList: [] }
        }
        return response;
  });


  const { passenger: passenger, requestedFlightSegmentList: requestedFlightSegmentList } = await response.json();

  if (!requestedFlightSegmentList || requestedFlightSegmentList.length === 0) {
    return []; //returning empty array so that array.flat() removes it
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
          requestedFlightSegmentList[0].flightList.map(async (someFlight) => {

            let airlineTax;
            const fare = someFlight.fareList.find((someFare) => someFare.type === FARE_TYPE);

            if(!fastSearch){
              airlineTax = Boolean(fare.g3) ? fare.g3.costTax * (passenger.children + passenger.adults) : (await _getTax({ flight: someFlight, fare: fare, passengers: passenger, paramsObject: paramsObjectCopy, headers: headers })).money;
            }
            else{
              if(Boolean(fare.g3)){
                airlineTax = fare.g3.costTax;
              }
              else{
                airlineTax = fare.legListCurrency === 'USD' ? fare.airlineTax * exchangeRate : fare.airlineTax;
              }
              airlineTax = airlineTax * (passenger.children + passenger.adults);
            }

            if (airlineTax === 0 && !fastSearch)
            {
              return []; //returning empty array so that array.flat() removes it
            }

            let stopList = [];
            let stopListforFilter = [];
            let airlineSet = new Set();
            let airlineCodesList = new Set();
            let airlineListforFilter = new Set();

            someFlight.legList.map((leg) => {
              if(stopList.at(-1) !== leg.departure.airport.code){
                stopList.push(leg.departure.airport.code);
                stopListforFilter.push(JSON.stringify({id: leg.departure.airport.code, name: leg.departure.airport.city + " (" + leg.departure.airport.code + ")"}));
              }
              stopList.push(leg.arrival.airport.code);
              stopListforFilter.push(JSON.stringify({id: leg.arrival.airport.code, name: leg.arrival.airport.city + " (" + leg.arrival.airport.code + ")"}));

              airlineSet.add(airlineCodes[leg.operationAirline.code]);
              airlineCodesList.add(leg.operationAirline.code);
              airlineListforFilter.add(JSON.stringify({id: leg.operationAirline.code, name: airlineCodes[leg.operationAirline.code]}));
            });

            stopList.pop();
            stopList.shift();

            stopListforFilter.pop();
            stopListforFilter.shift();

            stopList = stopList.join();
            const airlineListString = [...airlineSet].join();
            airlineCodesList = [...airlineCodesList];
            airlineListforFilter = [...airlineListforFilter];

            return {
              uid: someFlight.uid,
              origin: someFlight.departure.airport.code,
              destination: someFlight.arrival.airport.code,
              originForURL: paramsObject.originAirportCode,
              destinationForURL: paramsObject.destinationAirportCode,
              viajeFacil: someFlight.codeContext === "FFY",
              departureDate: new Date(someFlight.departure.date),
              availableSeats: someFlight.availableSeats,
              cabin: someFlight.cabin,
              passengers: passenger,
              searchRegion: searchRegion,
              baggage: someFlight.baggage.quantity,
              fare: {
                airlineTax: airlineTax,
                miles: fare.miles * (passenger.children + passenger.adults),
                money: fare.money * (passenger.children + passenger.adults),
                type: someFlight.sourceFare,
              },
              arrival: {
                date: new Date(someFlight.arrival.date),
                dateDiff: Math.ceil((new Date(someFlight.arrival.date).getTime() - new Date(someFlight.departure.date).getTime()) / (1000 * 3600 * 24)),
              },
              stops: {
                numberOfStops: someFlight.stops,
                stopList: stopList,
                stopListforFilter: stopListforFilter,
              },
              duration:{
                hours: someFlight.duration.hours,
                minutes: someFlight.duration.minutes,
              },
              airlines: {
                airlineListString: airlineListString,
                airlineCodesList: airlineCodesList,
                airlineListforFilter: airlineListforFilter,
              },
            };
          }),
      )
      : await (async() => {

        let firstSegment = requestedFlightSegmentList[0];
        let secondSegment = requestedFlightSegmentList[1];

        const firstSegmentFlight = firstSegment.flightList.find(flight => flight.fareList.some(fare => fare.miles === firstSegment.bestPricing.miles && fare.type === FARE_TYPE));
        const secondSegmentFlight = secondSegment.flightList.find(flight => flight.fareList.some(fare => fare.miles === secondSegment.bestPricing.miles && fare.type === FARE_TYPE));

        if (!Boolean(firstSegmentFlight) || !Boolean(secondSegmentFlight)){
          return []; //returning empty array so that array.flat() removes it
        }

        const firstSegmentFare = firstSegmentFlight.fareList.find((someFare) => someFare.type === FARE_TYPE);
        const secondSegmentFare = secondSegmentFlight.fareList.find((someFare) => someFare.type === FARE_TYPE);

        let firstSegmentFareTax;
        let secondSegmentFareTax;

        if(!fastSearch){
          firstSegmentFareTax = Boolean(firstSegmentFare.g3) ? firstSegmentFare.g3.costTax * (passenger.children + passenger.adults) : (await _getTax(
              { flight: firstSegmentFlight, fare: firstSegmentFare, flight2: secondSegmentFlight, fare2: secondSegmentFare, passengers: passenger, paramsObject: paramsObjectCopy, headers: headers }
          )).money;
          secondSegmentFareTax = Boolean(secondSegmentFare.g3) ? secondSegmentFare.g3.costTax * (passenger.children + passenger.adults) : 0;
        }
        else{
          firstSegmentFareTax = firstSegmentFare.legListCurrency === 'USD' ? firstSegmentFare.airlineTax * exchangeRate : firstSegmentFare.airlineTax;

          secondSegmentFareTax = secondSegmentFare.legListCurrency === 'USD' ? secondSegmentFare.airlineTax * exchangeRate : secondSegmentFare.airlineTax;

          firstSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
          secondSegmentFareTax = firstSegmentFareTax * (passenger.children + passenger.adults);
        }

        if (firstSegmentFareTax === 0 && !fastSearch) {
          return []; //returning empty array so that array.flat() removes it
        }


        let stopList = [];
        let stopListforFilter = [];
        let airlineSet = new Set();
        let airlineCodesList = new Set();
        let airlineListforFilter = new Set();

        firstSegmentFlight.legList.map((leg) => {
          if(stopList.at(-1) !== leg.departure.airport.code){
            stopList.push(leg.departure.airport.code);
            stopListforFilter.push(JSON.stringify({id: leg.departure.airport.code, name: leg.departure.airport.city + " (" + leg.departure.airport.code + ")"}));
          }
          stopList.push(leg.arrival.airport.code);
          stopListforFilter.push(JSON.stringify({id: leg.arrival.airport.code, name: leg.arrival.airport.city + " (" + leg.arrival.airport.code + ")"}));

          airlineSet.add(airlineCodes[leg.operationAirline.code]);
          airlineCodesList.add(leg.operationAirline.code);
          airlineListforFilter.add(JSON.stringify({id: leg.operationAirline.code, name: airlineCodes[leg.operationAirline.code]}));
        });

        stopList.pop();
        stopList.shift();

        stopListforFilter.pop();
        stopListforFilter.shift();

        stopList = stopList.join();
        const airlineListString = [...airlineSet].join();
        airlineCodesList = [...airlineCodesList];
        airlineListforFilter = [...airlineListforFilter];


        // return
        let stopListSecondSegment = [];
        let stopListforFilterSecondSegment = [];
        let airlineSetSecondSegment = new Set();
        let airlineCodesListSecondSegment = new Set();
        let airlineListforFilterSecondSegment = new Set();

        secondSegmentFlight.legList.map((leg) => {
          if(stopListSecondSegment.at(-1) !== leg.departure.airport.code){
            stopListSecondSegment.push(leg.departure.airport.code);
            stopListforFilterSecondSegment.push(JSON.stringify({id: leg.departure.airport.code, name: leg.departure.airport.city + " (" + leg.departure.airport.code + ")"}));
          }
          stopListSecondSegment.push(leg.arrival.airport.code);
          stopListforFilterSecondSegment.push(JSON.stringify({id: leg.arrival.airport.code, name: leg.arrival.airport.city + " (" + leg.arrival.airport.code + ")"}));

          airlineSetSecondSegment.add(airlineCodes[leg.operationAirline.code]);
          airlineCodesListSecondSegment.add(leg.operationAirline.code);
          airlineListforFilterSecondSegment.add(JSON.stringify({id: leg.operationAirline.code, name: airlineCodes[leg.operationAirline.code]}));
        });

        stopListSecondSegment.pop();
        stopListSecondSegment.shift();

        stopListforFilterSecondSegment.pop();
        stopListforFilterSecondSegment.shift();

        stopListSecondSegment = stopListSecondSegment.join();
        const airlineListStringSecondSegment = [...airlineSetSecondSegment].join();
        airlineCodesListSecondSegment = [...airlineCodesListSecondSegment];
        airlineListforFilterSecondSegment = [...airlineListforFilterSecondSegment];

        return {
          uid: firstSegmentFlight.uid + secondSegmentFlight.uid,
          origin: firstSegmentFlight.departure.airport.code,
          originForURL: paramsObject.originAirportCode,
          destinationForURL: paramsObject.destinationAirportCode,
          destination: firstSegmentFlight.arrival.airport.code,
          viajeFacil: firstSegmentFlight.codeContext === "FFY",
          returnViajeFacil: secondSegmentFlight.codeContext === "FFY",
          departureDate: new Date(firstSegmentFlight.departure.date),
          returnDate: new Date(secondSegmentFlight.departure.date),
          passengers: passenger,
          searchRegion: searchRegion,
          availableSeats: firstSegmentFlight.availableSeats,
          returnAvailableSeats: secondSegmentFlight.availableSeats,
          cabin: firstSegmentFlight.cabin,
          returnCabin: secondSegmentFlight.cabin,
          baggage: firstSegmentFlight.baggage.quantity,
          returnBaggage: secondSegmentFlight.baggage.quantity,
          fare: {
            airlineTax: firstSegmentFareTax + secondSegmentFareTax,
            miles: (firstSegmentFare.miles + secondSegmentFare.miles) * (passenger.children + passenger.adults),
            money: (firstSegmentFare.money + secondSegmentFare.money) * (passenger.children + passenger.adults),
            first: {
              airlineTax: firstSegmentFareTax,
              miles: firstSegmentFare.miles,
              money: firstSegmentFare.money,
              type: firstSegmentFlight.sourceFare,
            },
            return: {
              airlineTax: secondSegmentFareTax,
              miles: secondSegmentFare.miles,
              money: secondSegmentFare.money,
              type: secondSegmentFare.sourceFare,
            },
          },
          arrival: {
            date: new Date(firstSegmentFlight.arrival.date),
            dateDiff: Math.ceil((new Date(firstSegmentFlight.arrival.date).getTime() - new Date(firstSegmentFlight.departure.date).getTime()) / (1000 * 3600 * 24)),
            return: {
              date: new Date(secondSegmentFlight.arrival.date),
              dateDiff: Math.ceil((new Date(secondSegmentFlight.arrival.date).getTime() - new Date(secondSegmentFlight.departure.date).getTime()) / (1000 * 3600 * 24)),
            },
          },
          stops: {
            numberOfStops: firstSegmentFlight.stops,
            stopList: stopList,
            stopListforFilter: stopListforFilter,
            return:{
              numberOfStops: secondSegmentFlight.stops,
              stopList: stopListSecondSegment,
              stopListforFilter: stopListforFilterSecondSegment,
            }
          },
          duration:{
            hours: firstSegmentFlight.duration.hours,
            minutes: firstSegmentFlight.duration.minutes,
            return:{
              hours: secondSegmentFlight.duration.hours,
              minutes: secondSegmentFlight.duration.minutes,
            },
          },
          airlines: {
            airlineListString: airlineListString,
            airlineCodesList: airlineCodesList,
            airlineListforFilter: airlineListforFilter,
            return: {
              airlineListString: airlineListStringSecondSegment,
              airlineCodesList: airlineCodesListSecondSegment,
              airlineListforFilter: airlineListforFilterSecondSegment,
            }
          },
        };
      })()
}

export { searchFlights, refreshIntervalSeconds, maxConcurrency, limiter, initializeBottleneck }
