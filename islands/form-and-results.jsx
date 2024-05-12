import {useSignal} from "@preact/signals";
import {
  formatFlightDateLong,
  formatFlightDateShort,
  formatFlightDateWeekDay,
  formatFlightTimeShort
} from "utils/dates.js";
import {airlineCodes, filterFlights, filtros, getLink, sortByMilesAndTaxes, tripTypes, cabinas} from "utils/flight.js";
import {abortControllersSignal, regionsSignal, requestsSignal, resultadosSignal, countrySignal, languageSignal, themeSignal} from "utils/signals.js";
import {findFlightsForDate, findFlightsInMonth, findFlightsInMonthRountrip} from "../utils/api.js";
import MainForm from "./main-form.jsx";
import Filters from "components/filters.jsx";
import Spinner from "components/spinner.jsx";
import Regions from "components/regions.jsx";
import {linkStyle, row1Style, row2Style, thStyle} from "../utils/styles.js";
import {findFlightsInRange, findFlightsInRangeRountrip} from "../utils/api.js";
import {refreshIntervalSeconds, maxConcurrency, limiter, initializeBottleneck} from "../utils/smiles-api.js";
import CountryLanguageDropdown from "../components/country-language-dropdown.jsx";
import DarkModeToggle from "../components/dark-mode-toggle.jsx";
import { ArrowRightCircleIcon } from "icons";

async function onSubmit(searchParams) {
  try {
    let
      shouldFetch = true,
      regionFrom = searchParams['region_from'] ? regionsSignal.value.find((someRegion) => someRegion.name === searchParams['region_from']) : null,
      regionTo = searchParams['region_to'] ? regionsSignal.value.find((someRegion) => someRegion.name === searchParams['region_to']) : null;

    if (searchParams['search_type[id]'] === "from-region-to-airport") {
      shouldFetch = searchParams['region_from'] && searchParams.destinationAirportCode && regionFrom?.airports[0];
    } else if (searchParams['search_type[id]'] === "airports") {
      shouldFetch = searchParams.originAirportCode && searchParams.destinationAirportCode;
    } else if (searchParams['search_type[id]'] === "from-airport-to-region") {
      shouldFetch = searchParams['region_to'] && searchParams.originAirportCode && regionTo?.airports[0];
    } else {
      shouldFetch = searchParams['region_to'] && regionTo?.airports[0] && searchParams['region_from'] && regionFrom?.airports[0];
    }

    if (!shouldFetch){
      return null;
    }

    const urlParams = new URLSearchParams(searchParams);
    history.replaceState(null, "", "?" + btoa(urlParams.toString()));
    let flights = null;
    const month = searchParams['month[id]'];
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
    searchParams.cabinType = searchParams['class_type[id]'];

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
      filtered = sortByMilesAndTaxes(filtered); // remove nulls and order
    }

    requestsSignal.value = {
      status: "finished",
      data: filtered,
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
  const golSearchSignal = useSignal(params.hideGolFlights ? params.hideGolFlights === 'true' : true);
  const fastSearchSignal = useSignal(true);
  const roundtripSearchSignal = useSignal(params.returnDate !== undefined);
  const expandedSearchSignal = useSignal(!params.departureDate);
  const dateRangeSearchSignal = useSignal(!params.departureDate);
  // const themeSignal = useSignal(localStorage.getItem('theme'));
  // const countrySignal = useSignal(Object.keys(filtros.searchRegions).includes(localStorage.getItem('country')) ? localStorage.getItem('country') : filtros.defaults.searchRegions);
  const languageSignal = useSignal('es');
  const oldFilter = requestsSignal.value.oldFilter;
  let airlineCodeList = Boolean(requestsSignal.value.airlineCodeList) ? requestsSignal.value.airlineCodeList : [];
  let layoverAirports = Boolean(requestsSignal.value.layoverAirports) ? requestsSignal.value.layoverAirports : [];
  let cabins = Boolean(requestsSignal.value.cabins) ? requestsSignal.value.cabins : new Set();
  let stops = Boolean(requestsSignal.value.stops) ? requestsSignal.value.stops : new Set(['']);

  return (
    <div class='flex flex-row min-w-full min-h-full shrink'>
      <div class="flex flex-col min-w-full min-h-full shrink">
        <div class="flex flex-row pt-1 items-start justify-between">
            <DarkModeToggle signal={themeSignal}/>
            <div class="flex portrait:hidden">
                <Regions/>
            </div>
            <CountryLanguageDropdown signal={countrySignal} languageSignal={languageSignal}/>
        </div>

        <MainForm
            params={params}
            monthSearchSignal={monthSearchSignal}
            expandedSearchSignal={expandedSearchSignal}
            dateRangeSearchSignal={dateRangeSearchSignal}
            golSearchSignal={golSearchSignal}
            roundtripSearchSignal={roundtripSearchSignal}
            fastSearchSignal={fastSearchSignal}
            requestsSignal={requestsSignal}
            countrySignal={countrySignal}
            languageSignal={languageSignal}
            onSubmit={onSubmit}
        />

        {(requestsSignal.value.data?.length > 0) && (

            <Filters airlineCodeList={airlineCodeList} layoverAirports={layoverAirports} cabins={cabins} stops={stops}
                     onChange={(newFilters) => {

                       const airlineCodes = Object.entries(newFilters).filter(([key, _value]) =>
                           key.startsWith("airlines") && key.endsWith("[id]")
                       ).map(([_key, value]) => value);

                       newFilters['airlines'] = airlineCodes;

                       const oldAirlineCodes = Boolean(oldFilter) ? oldFilter.airlines : [];

                       const layoverAirportCodes = Object.entries(newFilters).filter(([key, _value]) =>
                           key.startsWith("layoverAirports") && key.endsWith("[id]")
                       ).map(([_key, value]) => value);

                       newFilters['layoverAirports'] = layoverAirportCodes;

              const oldLayoverAirportCodes = Boolean(oldFilter) ? oldFilter.layoverAirports : [];

              const cabinCodes = Object.entries(newFilters).filter(([key, _value]) =>
                  key.startsWith("cabinType") && key.endsWith("[id]")
              ).map(([_key, value]) => value);

              newFilters['cabins'] = cabinCodes;

              const oldCabinCodes = Boolean(oldFilter) ? oldFilter.cabins : [];

              const noAirlineChange = JSON.stringify(airlineCodes) === JSON.stringify(oldAirlineCodes);
              const noLayoverChange = JSON.stringify(layoverAirportCodes) === JSON.stringify(oldLayoverAirportCodes);
              const noCabinChange = JSON.stringify(cabinCodes) === JSON.stringify(oldCabinCodes);
              const noStopsChange = newFilters['stops[id]'] === (Boolean(oldFilter) ? oldFilter['stops[id]'] : '');
              const noBaggageChange = newFilters.baggage === (Boolean(oldFilter) ? oldFilter.baggage : 'false');
              const noViajeFacilChange = newFilters['viaje-facil[id]'] === (Boolean(oldFilter) ? oldFilter['viaje-facil[id]'] : filtros.defaults.viajeFacil.id);
              const noAwardChange = newFilters['tarifa[id]'] === (Boolean(oldFilter) ? oldFilter['tarifa[id]'] : filtros.defaults.tarifas.id);

              const fixedFiltersChange = noBaggageChange && noViajeFacilChange && noAwardChange;

              requestsSignal.value = {
                ...requestsSignal.value,
                airlineCodeList: fixedFiltersChange && noCabinChange && noLayoverChange && noStopsChange ? airlineCodeList: [],
                layoverAirports: fixedFiltersChange && noAirlineChange && noCabinChange && noStopsChange ? layoverAirports : [],
                cabins: fixedFiltersChange && noAirlineChange && noLayoverChange && noStopsChange ? cabins : new Set(),
                stops: fixedFiltersChange && noAirlineChange && noLayoverChange && noCabinChange ? stops : new Set(['']),
                oldFilter: newFilters,
                filtered: filterFlights({
                  allFlights: requestsSignal.value.data,
                  daySearch: requestsSignal.value.daySearch,
                  filters: newFilters,
                  airlineCodes: airlineCodes,
                  layoverAirportCodes: layoverAirportCodes,
                  cabins: cabinCodes,
                  stops: stops,
                }),
              };
            }}
          />
        )}

        {requestsSignal.value.status === "not initiated" && (<p class="m-auto"> Elija un origen, un destino y una fecha para buscar.</p>)}

        {isLoading && (
          <div class="m-auto flex flex-col items-center pt-16">
            <Spinner />
            <p class="my-4"> Buscando {requestsSignal.value.message ? `(${requestsSignal.value.message})`: ""} </p>
          </div>
        )}

        {Boolean(requestsSignal.value.error) && requestsSignal.value.status === "finished" && (<p class="m-auto">{requestsSignal.value.error}</p>)}

        {(flights === null || flights?.length === 0) && (<p class="m-auto pt-6">No se encontraron vuelos para este tramo.</p>)}

        {(flights?.length > 0 && !isLoading) &&
          (
            <div class="flex flex-row justify-center overflow-y-auto overflow-x-hidden border-gray-900">
              <div class="flex flex-col min-w-0 shrink text-sm text-center whitespace-nowrap">

                  {/*<div class='flex flex-row justify-center'>*/}
                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink py-4 px-2 ${thStyle}`}>*/}
                  {/*    <span className='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Ruta" : "Tramo"} </span>*/}
                  {/*  </div>*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Ida" : "Fecha y hora"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Vuelta </span>*/}
                  {/*  </div>}*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 lg:hidden ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Millas </span>*/}
                  {/*  </div>*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Aerolínea ida" : "Aerolínea"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Aerolinea vuelta </span>*/}
                  {/*  </div>}*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Cabina ida" : "Cabina"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Cabina vuelta </span>*/}
                  {/*  </div>}*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Escalas ida" : "Escalas"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Escalas vuelta </span>*/}
                  {/*  </div>}*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Duración ida" : "Duración"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*      <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Duración vuelta</span>*/}
                  {/*  </div>}*/}

                  {/*  <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {Boolean(flights?.[0].returnDate) ? "Asientos ida" : "Asientos"} </span>*/}
                  {/*  </div>*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Asientos vuelta </span>*/}
                  {/*  </div>}*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink hidden px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Total Millas </span>*/}
                  {/*  </div>}*/}

                  {/*  {Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Total Tasas </span>*/}
                  {/*  </div>}*/}

                  {/*  {!Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink hidden px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Millas </span>*/}
                  {/*  </div>}*/}

                  {/*  {!Boolean(flights?.[0].returnDate) && <div className={`flex flex-col justify-center min-w-0 shrink px-2 ${thStyle}`}>*/}
                  {/*    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> Tasas </span>*/}
                  {/*  </div>}*/}
                  {/*</div>*/}
                  {flights?.map((flight, i) => {
                    airlineCodeList.push(...flight.airlines.airlineListforFilter);
                    cabins.add(JSON.stringify({id: flight.cabin, name: cabinas[flight.cabin]}));
                    stops.add(flight.stops.numberOfStops <= 2 ? String(flight.stops.numberOfStops) : "2");
                    layoverAirports.push(...flight.stops.stopListforFilter);
                    const isRoundtrip = flights[0].returnDate;

                    if (isRoundtrip){
                      airlineCodeList.push(...flight.airlines.return.airlineListforFilter);
                      cabins.add(JSON.stringify({id: flight.returnCabin, name: cabinas[flight.returnCabin]}));
                      stops.add(flight.stops.return.numberOfStops <= 2 ? String(flight.stops.return.numberOfStops) : "2");
                      layoverAirports.push(...flight.stops.return.stopListforFilter);
                    }
                    // const bgColor = i % 2 === 0 ? row1Style : row2Style;
                    const bgColor = '';
                    const isArgentina = flight.searchRegion === filtros.defaults.searchRegions;

                    return (

                        <div class="flex flex-row border border-gray-900 items-center justify-between py-2">

                          <div class={`flex flex-col justify-center min-w-0 w-48 shrink ${bgColor}`}>

                            <div class={`flex flex-col justify-center min-w-0 shrink ${bgColor}`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{isRoundtrip && 'Ida: '}{formatFlightDateWeekDay(flight.departureDate)} </span>
                            </div>

                            <div class={`flex flex-row justify-center min-w-0 shrink ${bgColor}`}>
                              <div class={`flex flex-col justify-center min-w-0 shrink ${bgColor}`}>
                                <span
                                    class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{formatFlightTimeShort(flight.departureDate)} - {formatFlightTimeShort(flight.arrival.date)}
                                </span>
                              </div>
                              <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                                    <span
                                        class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-[0.65rem]'>+{flight.arrival.dateDiff} </span>
                                <span
                                    class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-[0.65rem] invisible'>+{flight.arrival.dateDiff} </span>

                              </div>
                            </div>

                            <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.airlines.airlineListString} </span>
                            </div>

                            {isRoundtrip &&
                                <>
                                  <div class={`flex flex-col justify-center min-w-0 shrink ${bgColor} pt-2`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{'Vuelta: ' + formatFlightDateWeekDay(isRoundtrip)} </span>
                                  </div>

                                  <div class={`flex flex-row justify-center min-w-0 shrink ${bgColor}`}>
                                    <div class={`flex flex-col justify-center min-w-0 shrink ${bgColor}`}>
                                <span
                                    class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{formatFlightTimeShort(isRoundtrip)} - {formatFlightTimeShort(flight.arrival.return.date)}
                                </span>
                                    </div>
                                    <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                                    <span
                                        class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-[0.65rem]'>+{flight.arrival.return.dateDiff} </span>
                                      <span
                                          class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-[0.65rem] invisible'>+{flight.arrival.return.dateDiff} </span>

                                    </div>
                                  </div>

                                  <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.airlines.return.airlineListString} </span>
                                  </div>

                                </>
                            }

                          </div>


                          <div class={`flex flex-col justify-around h-full min-w-0 w-24 shrink ${bgColor} px-2`}>
                            <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                              <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.duration.hours}h {flight.duration.minutes}min </span>
                              </div>
                              <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                              <span
                                  class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{flight.origin}-{flight.destination}</span>
                              </div>
                            </div>

                            {isRoundtrip &&
                                <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                                  <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                                    <span
                                        class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.duration.return.hours}h {flight.duration.return.minutes}min </span>
                                  </div>
                                  <div class={`flex flex-col justify-start min-w-0 shrink ${bgColor}`}>
                                  <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{flight.destination}-{flight.origin}</span>
                                  </div>

                                </div>
                            }


                          </div>

                          <div class={`flex flex-col justify-around h-full min-w-0 w-24 shrink ${bgColor} px-2`}>
                            <span
                                class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.stops.numberOfStops || "Directo"} {flight.stops.numberOfStops === 1 ? 'Escala' : ''} {flight.stops.numberOfStops > 1 ? 'Escalas' : ''}</span>
                            {/*<span*/}
                            {/*    class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.stops > 0 ? flight.stopList : ''}</span>*/}
                            {isRoundtrip &&
                                <>
                                <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>
                                  {flight.stops.return.numberOfStops || "Directo"} {flight.stops.return.numberOfStops === 1 ? 'Escala' : ''} {flight.stops.return.numberOfStops > 1 ? 'Escalas' : ''}
                                </span>

                                </>
                            }


                          </div>

                          <div class={`flex flex-col justify-around h-full min-w-0 w-24 shrink ${bgColor} px-2`}>
                            <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.availableSeats} asientos </span>
                            {isRoundtrip &&
                                <>
                                  <span
                                      class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {flight.returnAvailableSeats} asientos </span>
                                </>
                            }
                          </div>

                          <div class={`flex flex-col justify-around h-full min-w-0 w-24 shrink ${bgColor} px-2`}>
                            <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {filtros.cabinas[flight.cabin]} </span>
                            {isRoundtrip &&
                                <>
                                  <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {filtros.cabinas[flight.returnCabin]} </span>
                                </>
                            }

                          </div>

                          <div class={`flex flex-col justify-center min-w-0 w-28 shrink ${bgColor} px-2`}>
                                <span
                                    class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'> {new Intl.NumberFormat("es-AR").format(flight.fare.miles)} millas</span>

                            <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>
                                  {flight.fare.airlineTax ? `${new Intl.NumberFormat(isArgentina ? 'es-AR' : 'pt-BR', {
                                    style: 'currency',
                                    currency: isArgentina ? 'ARS' : 'BRL',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }).format(flight.fare.airlineTax)}` : "?"}
                              </span>
                          </div>

                          <div class={`flex flex-col justify-center min-w-0 shrink ${bgColor}`}>
                            <a target="_blank" href={getLink(flight)}>
                              <ArrowRightCircleIcon class='w-7 h-7 flex shrink min-w-0'/>
                            </a>
                          </div>
                        </div>
                    );
                  })}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}