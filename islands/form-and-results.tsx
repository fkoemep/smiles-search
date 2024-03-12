import {useSignal} from "@preact/signals";
import {formatFlightDateLong, formatFlightDateShort} from "utils/dates.ts";
import {airlineCodes, filterFlights, filtros, getLink, sortByMilesAndTaxes, tripTypes, cabinas} from "utils/flight.ts";
import {abortControllersSignal, regionsSignal, requestsSignal, resultadosSignal} from "utils/signals.ts";
import {findFlightsForDate, findFlightsInMonth, findFlightsInMonthRountrip} from "../utils/api.ts";
import MainForm from "./main-form.tsx";
import Filters from "./filters.tsx";
import Spinner from "components/spinner.tsx";
import Regions from "components/regions.tsx";
import {linkStyle, row1Style, row2Style, thStyle} from "../utils/styles.ts";
import {findFlightsInRange, findFlightsInRangeRountrip} from "../utils/api.ts";
import {refreshIntervalSeconds, maxConcurrency, limiter, initializeBottleneck} from "../utils/smiles-api.ts";
// import ConsultasEnSimultaneo from "components/simultaneous-searches-input.tsx";

let dolarOficial = 1;

async function getDolarOficial() {
    if(dolarOficial === 1){

      dolarOficial = fetch('https://mercados.ambito.com//dolarnacion/historico-cierre').then(response => response.json()).then(json => {
           return Number(json.venta.replace(",", "."));
        }).catch(function (err) {
            console.warn('Something went wrong.', err);
        });
    }
    return dolarOficial;
}

async function onSubmit(searchParams) {
  try {
    let shouldFetch = true,
      regionFrom = searchParams["region_from"]
        ? regionsSignal.value.find((someRegion) =>
          someRegion.name === searchParams["region_from"]
        )
        : null,
      regionTo = searchParams["region_to"]
        ? regionsSignal.value.find((someRegion) =>
          someRegion.name === searchParams["region_to"]
        )
        : null;
    if (searchParams["search_type[id]"] === "from-region-to-airport") {
      shouldFetch = searchParams["region_from"] &&
        searchParams.destinationAirportCode && regionFrom?.airports[0];
    } else if (searchParams["search_type[id]"] === "airports") {
      shouldFetch = searchParams.originAirportCode &&
        searchParams.destinationAirportCode;
    } else if (searchParams["search_type[id]"] === "from-airport-to-region") {
      shouldFetch = searchParams["region_to"] &&
        searchParams.originAirportCode && regionTo?.airports[0];
    } else {
      shouldFetch = searchParams["region_to"] && regionTo?.airports[0] &&
        searchParams["region_from"] && regionFrom?.airports[0];
    }

    console.log(searchParams, shouldFetch)

    if (!shouldFetch){
      return null;
    }

    const urlParams = new URLSearchParams(searchParams);
    history.replaceState(null, "", "?" + urlParams.toString());
    let flights = null;
    const month = searchParams["month[id]"];
    const rangeSearch = Boolean(searchParams.dateRangeLowestValue) && !Boolean(searchParams.rangeLowestValue);
    const monthSearch = Boolean(month) && !Boolean(searchParams.rangeLowestValue);
    const roundtripMonthSearch = Boolean(searchParams.rangeLowestValue) && !monthSearch;
    const roundtripRangeSearch = Boolean(searchParams.dateRangeLowestValue) && !rangeSearch;
    const rangeLowestValue = Number(searchParams.rangeLowestValue);
    const rangeHighestValue = Number(searchParams.rangeHighestValue);
    const dateRangeLowestValue = searchParams.dateRangeLowestValue;
    const dateRangeHighestValue = searchParams.dateRangeHighestValue;
    let daySearch = false;

    const searchHistoryArray = JSON.parse(localStorage.getItem("searchHistory")) || [];

    const now = new Date();
    const limiterMoment = new Date(now.getTime() - (refreshIntervalSeconds * 1000));

    const filteredList = searchHistoryArray.filter(function (date) {
      const parsedDate = new Date(date);
      return (parsedDate >= limiterMoment && parsedDate <= now);
    });

    if(filteredList.length >= maxConcurrency || (filteredList.length > 0 && (rangeSearch || monthSearch || roundtripMonthSearch || roundtripRangeSearch))){
      throw new Error('Se ha alcanzado el límite en este período de tiempo, por favor espere unos momentos y vuelva a intentar.');
    }
    if(limiter === undefined){
      initializeBottleneck();
    }

    for (const controller of abortControllersSignal.value) {
      controller.abort();
    }
    abortControllersSignal.value = [];
    requestsSignal.value = { status: "loading" };

    searchParams.regionFrom = regionFrom;
    searchParams.regionTo = regionTo;
    searchParams.cabinType = searchParams["class_type[id]"];

    if(searchParams.fastSearch === "true"){
      searchParams.dolarOficial = await getDolarOficial();
    }

    if (rangeSearch) {
      flights = await findFlightsInRange({
        searchParams: searchParams,
        dateRangeLowestValue: dateRangeLowestValue,
        dateRangeHighestValue: dateRangeHighestValue,
      });
    }

    else if (monthSearch) {
      flights = await findFlightsInMonth({
        searchParams: searchParams,
        month: month,
      });
    }

    else if (roundtripRangeSearch) {
      flights = await findFlightsInRangeRountrip({
        searchParams: searchParams,
        rangeLowestValue: rangeLowestValue,
        rangeHighestValue: rangeHighestValue,
        dateRangeLowestValue: dateRangeLowestValue,
        dateRangeHighestValue: dateRangeHighestValue,
      });
    }

    else if (roundtripMonthSearch) {
      flights = await findFlightsInMonthRountrip({
        searchParams: searchParams,
        rangeLowestValue: rangeLowestValue,
        rangeHighestValue: rangeHighestValue,
        month: month,
      });
    }

    else {
      searchParams.tripType = tripTypes.ONE_WAY;
      flights = await findFlightsForDate({
        searchParams : searchParams,
      });
      daySearch = true;
    }

    let filtered = !daySearch || (daySearch && flights.length > 0 && Array.isArray(flights[0])) ? flights.flat(2) : flights;

    if (filtered) {
      filtered = sortByMilesAndTaxes(filtered);
      // filtered = filtered.slice(0, resultadosSignal.value);
    }

    requestsSignal.value = {
      status: "finished",
      data: filtered, //flights,
      daySearch: daySearch,
      filtered,
    };
  } catch (err) {
    console.log(err)
    // if aborted, leave it loading as most likely the user fired another set of requests
    if (err.name === "AbortError") return null;
    requestsSignal.value = {
      status: "finished",
      data: null,
      error: err.message,
    };
  }
}

export default function FormAndResults({ params }) {
  const flights = requestsSignal.value.filtered;
  const isLoading = requestsSignal.value.status === "loading";
  const monthSearchSignal = useSignal(!params.departureDate);
  const golSearchSignal = useSignal(true); //set button to false by default
  const fastSearchSignal = useSignal(true);
  const roundtripMonthSearchSignal = useSignal(false); //set button to false by default
  const roundtripSearchSignal = useSignal(false); //set button to false by default
  const expandedSearchSignal = useSignal(!params.departureDate);
  const oldFilter = requestsSignal.value.oldFilter;
  let airlineCodeList = Boolean(requestsSignal.value.airlineCodeList) ? requestsSignal.value.airlineCodeList : new Set();
  let layoverAirports = Boolean(requestsSignal.value.layoverAirports) ? requestsSignal.value.layoverAirports : new Set();
  let cabins = Boolean(requestsSignal.value.cabins) ? requestsSignal.value.cabins : new Set();

  return (
    <div class="p-4 gap-4 flex flex-col flex-grow-[1]">
      {/*<ConsultasEnSimultaneo />*/}
      <Regions />
      <MainForm
        params={params}
        monthSearchSignal={monthSearchSignal}
        expandedSearchSignal={expandedSearchSignal}
        golSearchSignal={golSearchSignal}
        roundtripSearchSignal={roundtripSearchSignal}
        roundtripMonthSearchSignal={roundtripMonthSearchSignal}
        fastSearchSignal={fastSearchSignal}
        requestsSignal={requestsSignal}
        onSubmit={onSubmit}
      />

      {requestsSignal.value.data?.length > 0 && (

        <Filters airlineCodeList = {airlineCodeList} layoverAirports = {layoverAirports} cabins={cabins}
          onChange={(newFilters) => {

            const airlineCodes = Object.entries(newFilters).filter(([key, _value]) =>
                key.startsWith("airlines") && key.endsWith("[id]")
            ).map(([_key, value]) => value);

            const oldAirlineCodes = Boolean(oldFilter) ? Object.entries(oldFilter).filter(([key, _value]) =>
                key.startsWith("airlines") && key.endsWith("[id]")
            ).map(([_key, value]) => value) : [];


            const layoverAirportCodes = Object.entries(newFilters).filter(([key, _value]) =>
                key.startsWith("layoverAirports") && key.endsWith("[id]")
            ).map(([_key, value]) => value);

            const oldLayoverAirportCodes = Boolean(oldFilter) ? Object.entries(oldFilter).filter(([key, _value]) =>
                key.startsWith("layoverAirports") && key.endsWith("[id]")
            ).map(([_key, value]) => value) : [];


            const cabinCodes = Object.entries(newFilters).filter(([key, _value]) =>
                key.startsWith("cabinType") && key.endsWith("[id]")
            ).map(([_key, value]) => value);

            const oldCabinCodes = Boolean(oldFilter) ? Object.entries(oldFilter).filter(([key, _value]) =>
                key.startsWith("cabinType") && key.endsWith("[id]")
            ).map(([_key, value]) => value) : [];

            const noAirlineChange = JSON.stringify(airlineCodes) === JSON.stringify(oldAirlineCodes);
            const noLayoverChange = JSON.stringify(layoverAirportCodes) === JSON.stringify(oldLayoverAirportCodes);
            const noCabinChange = JSON.stringify(cabinCodes) === JSON.stringify(oldCabinCodes);

            requestsSignal.value = {
              ...requestsSignal.value,
              airlineCodeList: noCabinChange && noLayoverChange ? airlineCodeList: new Set(),
              layoverAirports: noAirlineChange && noCabinChange ? layoverAirports : new Set(),
              cabins: noAirlineChange && noLayoverChange ? cabins : new Set(),
              oldFilter: newFilters,
              filtered: filterFlights({
                allFlights: requestsSignal.value.data,
                daySearch: requestsSignal.value.daySearch,
                filters: newFilters,
                airlineCodes: airlineCodes,
                layoverAirportCodes: layoverAirportCodes,
                cabins: cabinCodes,
              }),
            };
          }}
        />
      )}
      {requestsSignal.value.status === "not initiated" &&
        (
          <p class="m-auto">
            Elija un origen, un destino y una fecha para buscar.
          </p>
        )}
      {isLoading && (
        <div class="m-auto flex flex-col items-center">
          <Spinner />
          <p class="my-4">
            Buscando {requestsSignal.value.message
              ? `(${requestsSignal.value.message})`
              : ""}
          </p>
        </div>
      )}
      {Boolean(requestsSignal.value.error) &&
        requestsSignal.value.status === "finished" && (
          <p class="m-auto">{requestsSignal.value.error}</p>
        )}
      {(flights === null || flights?.length === 0) && (
        <p class="m-auto">No se encontraron vuelos para este tramo.</p>
      )}
      {flights?.length > 0 && !isLoading &&
        (
          <div class="max-w-[100vw] overflow-x-auto border border-gray-900">
            <table class="table-auto text-sm text-center min-w-[fit-content] w-full whitespace-nowrap">
              <thead class="font-bold text-slate-400">
                <tr>
                  <th className={`py-4 px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Ruta" : "Tramo"}</th>

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Ida" : "Fecha y hora"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Vuelta </th>}

                  <th className={`px-2 lg:hidden ${thStyle}`}>Millas</th>

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Aerolínea ida" : "Aerolínea"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Aerolinea vuelta </th>}

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Cabina ida" : "Cabina"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Cabina vuelta </th>}

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Escalas ida" : "Escalas"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Escalas vuelta </th>}

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Duración ida" : "Duración"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Duración vuelta </th>}

                  <th className={`px-2 ${thStyle}`}>{Boolean(flights[0].returnDate) ? "Asientos ida" : "Asientos"}</th>
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Asientos vuelta </th>}

                  {Boolean(flights[0].returnDate) && <th className={`hidden lg:table-cell px-2 ${thStyle}`}> Total Millas </th>}
                  {Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Total Tasas </th>}


                  {!Boolean(flights[0].returnDate) && <th className={`hidden lg:table-cell px-2 ${thStyle}`}> Millas </th>}

                  {!Boolean(flights[0].returnDate) && <th className={`px-2 ${thStyle}`}> Tasas </th>}

                </tr>
              </thead>
              <tbody>
                {flights.map((flight, i) => {

                  airlineCodeList.add(JSON.stringify({id: flight.airline.code, name: airlineCodes[flight.airline.code]}));
                  cabins.add(JSON.stringify({id: flight.cabin, name: cabinas[flight.cabin]}));
                  if(flight.stops > 0){

                    flight.legList.map(function(leg) {

                      if (leg.departure.airport.city !== flight.legList[0].departure.airport.city) {
                        layoverAirports.add(JSON.stringify({id: leg.departure.airport.code, name: leg.departure.airport.city + " (" + leg.departure.airport.code + ")"}));
                      }

                      if (leg.arrival.airport.city !== flight.legList.slice(-1)[0].arrival.airport.city) {
                        layoverAirports.add(JSON.stringify({id: leg.arrival.airport.code, name: leg.arrival.airport.city + " (" + leg.arrival.airport.code + ")"}));
                      }

                    }, []);
                  }

                  if(Boolean(flight.returnAirline)){
                    airlineCodeList.add(JSON.stringify({id: flight.returnAirline.code, name: airlineCodes[flight.returnAirline.code]}));
                    cabins.add(JSON.stringify({id: flight.returnCabin, name:cabinas[flight.returnCabin]}));
                    if(flight.stopsReturnFlight > 0){
                      flight.returnLegList.map(function(leg) {

                        if (leg.departure.airport.city !== flight.legList.slice(-1)[0].arrival.airport.city) {
                          layoverAirports.add(JSON.stringify({id: leg.departure.airport.code, name: leg.departure.airport.city + " (" + leg.departure.airport.code + ")"}));
                        }

                        if (leg.arrival.airport.city !== flight.legList[0].departure.airport.city) {
                          layoverAirports.add(JSON.stringify({id: leg.arrival.airport.code, name: leg.arrival.airport.city + " (" + leg.arrival.airport.code + ")"}));
                        }

                      }, []);
                    }
                  }

                  const bgColor = i % 2 === 0 ? row1Style : row2Style;
                  return (

                    <tr
                      class="whitespace-nowrap"
                      key={flight.uid}
                    >


                      <td class={`${bgColor} py-4 px-2`}>
                        <a
                          target="_blank"
                          href={getLink(flight)}
                          style={linkStyle}
                        >
                          {flight.origin}-{flight.destination}
                        </a>
                      </td>

                      <td class={`${bgColor} py-px-2 md:hidden`}>
                        {formatFlightDateShort(flight.departureDate)}
                      </td>
                      <td class={`${bgColor} py-px-2 hidden md:table-cell`}>
                        {formatFlightDateLong(flight.departureDate)}
                      </td>

                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} py-px-2 md:hidden`}>
                            {formatFlightDateShort(flight.returnDate)}
                          </td>}
                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} py-px-2 hidden md:table-cell`}>
                            {formatFlightDateLong(flight.returnDate)}
                          </td>}


                      <td class={`${bgColor} px-2 lg:hidden`}>
                        {new Intl.NumberFormat("es-AR").format(
                          flight.fare.miles,
                        )}
                      </td>

                      <td class={`${bgColor} px-2`}>{airlineCodes[flight.airline.code]}</td>
                      {Boolean(flights[0].returnDate) &&
                          <td class={`${bgColor} px-2`}>{airlineCodes[flight.returnAirline.code]}</td>}


                      <td className={`${bgColor} px-2`}>
                        {filtros.cabinas[flight.cabin]}
                      </td>
                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2`}>
                            {filtros.cabinas[flight.returnCabin]}
                          </td>}


                      <td class={`${bgColor} px-2`}>
                        {flight.stops || "Directo"}
                      </td>
                      {Boolean(flights[0].returnDate) &&
                          <td class={`${bgColor} px-2`}>
                            {flight.stopsReturnFlight || "Directo"}
                          </td>}


                      <td className={`${bgColor} px-2`}>
                        {flight.durationInHours}hs
                      </td>
                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2`}>
                            {flight.returnDurationInHours}hs
                          </td>}


                      <td className={`${bgColor} px-2`}>{flight.availableSeats}</td>
                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2`}>{flight.returnAvailableSeats}</td>}

                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2 hidden lg:table-cell`}>
                            {new Intl.NumberFormat("es-AR").format(
                                flight.totalFare.miles,
                            )}
                          </td>}

                      {Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2`}>
                            {flight.totalFare.airlineTax ? `${new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(flight.totalFare.airlineTax)}`: "?"}
                          </td>}


                      {!Boolean(flights[0].returnDate) &&
                          <td class={`${bgColor} px-2 hidden lg:table-cell`}>
                            {new Intl.NumberFormat("es-AR").format(
                                flight.fare.miles,
                            )}
                          </td>}

                      {!Boolean(flights[0].returnDate) &&
                          <td className={`${bgColor} px-2`}>
                            {flight.fare.airlineTax ? `${new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: 'ARS',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(flight.fare.airlineTax)}`: "?"}
                          </td>}



                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}