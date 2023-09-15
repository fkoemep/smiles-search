import { searchFlights } from "./smiles-api.js";
import { formatDate, maxDate, minDate } from "./dates.js";
import {sortByMilesAndTaxes, tripTypes} from "./flight.js";

async function findFlightsForDate({ searchParams }) {
  let flightPromises = [];
  let fromAirports = searchParams.originAirportCode ? [searchParams.originAirportCode] : searchParams.regionFrom.airports;
  let toAirports = searchParams.destinationAirportCode ? [searchParams.destinationAirportCode] : searchParams.regionTo.airports;
  for (const airportFrom of fromAirports) {
    for (const airportTo of toAirports) {
        let parameters = {
            originAirportCode: airportFrom,
            destinationAirportCode: airportTo,
            departureDate: searchParams.departureDate,
            forceCongener: searchParams.hideGolFlights,
            tripType: searchParams.tripType,
            cabinType: Boolean(searchParams.cabinType) ? searchParams.cabinType : "all",
            adults: searchParams.numberOfAdults,
            children: searchParams.numberOfKids,
            infants: searchParams.numberOfBabies,
        }

        if (Boolean(searchParams.returnDate)) {parameters.returnDate =  searchParams.returnDate}
        if(Boolean(searchParams.dolarOficial)){parameters.dolarOficial = searchParams.dolarOficial}

      flightPromises = [
        ...flightPromises,
        searchFlights(
            parameters,
        ),
      ];
    }
  }
  const allFlightsArray = await Promise.all(flightPromises);
  return allFlightsArray.flat().filter(Boolean);
}

function findFlightsInMonth({ searchParams, month }) {
  let firstDay = new Date(month);
  firstDay.setHours(firstDay.getHours() + 3); // remove tz
  let currentDay = new Date(firstDay);
  let flightPromises = [];
  do {
    if (minDate <= currentDay && maxDate >= currentDay) {

        searchParams.tripType = tripTypes.ONE_WAY;
        searchParams.departureDate = formatDate(currentDay)

        const dayFlightsPromise = findFlightsForDate({
            searchParams,
        });

        flightPromises = [...flightPromises, dayFlightsPromise];
    }
    currentDay.setDate(currentDay.getDate() + 1);
  } while (firstDay.getMonth() === currentDay.getMonth());
  return Promise.all(flightPromises);
}

function findFlightsInRange({ searchParams, dateRangeLowestValue, dateRangeHighestValue }) {
    let firstDay = new Date(dateRangeLowestValue);
    firstDay.setHours(firstDay.getHours() + 3); // remove tz

    let lastDay = new Date(dateRangeHighestValue);
    lastDay.setHours(lastDay.getHours() + 3); // remove tz

    let currentDay = new Date(firstDay);
    let flightPromises = [];
    do {
        if (minDate <= currentDay && maxDate >= currentDay) {

            searchParams.tripType = tripTypes.ONE_WAY;
            searchParams.departureDate = formatDate(currentDay)

            const dayFlightsPromise = findFlightsForDate({
                searchParams,
            });

            flightPromises = [...flightPromises, dayFlightsPromise];
        }
        currentDay.setDate(currentDay.getDate() + 1);
    } while (currentDay <= lastDay);
    return Promise.all(flightPromises);
}


function findFlightsInMonthRountrip({ searchParams, month, rangeLowestValue, rangeHighestValue }) {
    let firstDay = new Date(month);
    firstDay.setHours(firstDay.getHours() + 3); // remove tz
    let currentDay = new Date(firstDay);
    let returnDate = new Date(firstDay);
    let flightPromises = [];

    // if rangeHighestValue is not defined, then it's not a dynamic range but a fixed one, hence the inner loop will only run once
    rangeHighestValue = Boolean(rangeHighestValue) ? rangeHighestValue : rangeLowestValue;

    do {
        for(let rangeCurrentValue = rangeLowestValue; rangeCurrentValue <= rangeHighestValue; rangeCurrentValue++){
            returnDate = new Date(currentDay.valueOf());
            returnDate.setDate(returnDate.getDate() + rangeCurrentValue);
            if (minDate <= currentDay && maxDate >= currentDay) {

                searchParams.tripType = tripTypes.RETURN;
                searchParams.departureDate = formatDate(currentDay);
                searchParams.returnDate = formatDate(returnDate);

                const dayFlightsPromise = findFlightsForDate({
                    searchParams,
                });
                flightPromises = [...flightPromises, dayFlightsPromise];
            }
        }
        currentDay.setDate(currentDay.getDate() + 1);
    } while (firstDay.getMonth() === currentDay.getMonth());


    return Promise.all(flightPromises);
}

function findFlightsInRangeRountrip({ searchParams, rangeLowestValue, rangeHighestValue, dateRangeLowestValue, dateRangeHighestValue }) {
    let firstDay = new Date(dateRangeLowestValue);

    let lastDay = new Date(dateRangeHighestValue);
    lastDay.setHours(lastDay.getHours() + 3); // remove tz

    firstDay.setHours(firstDay.getHours() + 3); // remove tz
    let currentDay = new Date(firstDay);
    let returnDate = new Date(firstDay);
    let flightPromises = [];

    // if rangeHighestValue is not defined, then it's not a dynamic range but a fixed one, hence the inner loop will only run once
    rangeHighestValue = Boolean(rangeHighestValue) ? rangeHighestValue : rangeLowestValue;

    do {
        for(let rangeCurrentValue = rangeLowestValue; rangeCurrentValue <= rangeHighestValue; rangeCurrentValue++){
            returnDate = new Date(currentDay.valueOf());
            returnDate.setDate(returnDate.getDate() + rangeCurrentValue);
            if (minDate <= currentDay && maxDate >= currentDay) {

                searchParams.tripType = tripTypes.RETURN;
                searchParams.departureDate = formatDate(currentDay);
                searchParams.returnDate = formatDate(returnDate);

                const dayFlightsPromise = findFlightsForDate({
                    searchParams,
                });
                flightPromises = [...flightPromises, dayFlightsPromise];
            }
        }
        currentDay.setDate(currentDay.getDate() + 1);
    } while (currentDay <= lastDay);


    return Promise.all(flightPromises);
}


const apiPath = "/query-results";

export { apiPath, findFlightsForDate, findFlightsInMonth, findFlightsInMonthRountrip, findFlightsInRangeRountrip, findFlightsInRange };
