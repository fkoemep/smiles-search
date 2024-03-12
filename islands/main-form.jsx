import { Switch } from "@headlessui/react";
import {
  formatDateWithTimezone,
  maxDate,
  minDate,
  today,
} from "utils/dates.js";
import ExpandedSearchSwitch from "components/expanded-search-switch.jsx";
import MonthSearchSwitch from "components/month-search-switch.jsx";
import RountripSearchSwitch from "components/roundtrip-search-switch.jsx";
import RountripSearchSlider from "components/roundtrip-search-slider.jsx";
import PassengerInputs from "components/passengers-inputs.jsx";
import GolSearchSwitch from "components/gol-search-switch.jsx";
import MonthsDropdown from "components/months-dropdown.jsx";
import SearchTypeDropdown from "components/search-type-dropdown.jsx";
import OriginDestinationInputs from "components/origin-destination-inputs.jsx";
import FastSearchSwitch from "components/fast-search-switch.jsx";
import { useComputed , useSignal } from "@preact/signals";
import { filtros } from "utils/flight.js";
import {buttonStyle, dateInputStyle, inputsStyle} from "utils/styles.js";

export default function MainForm({ params, monthSearchSignal, golSearchSignal, roundtripSearchSignal, roundtripMonthSearchSignal, expandedSearchSignal, onSubmit, fastSearchSignal, requestsSignal }) {

  let isLoading = useComputed(() => requestsSignal.value.status === "loading")

  const searchTypeSignal = useSignal(
    params["search_type[id]"] ?? filtros.defaults.searchTypes.id,
  );

  // const classTypeSignal = useSignal(
  //     params["class_type[id]"] ?? filtros.defaults.classTypes.id,
  // );

  const searchType = filtros.searchTypes.find((someSearchType) =>
    someSearchType.id === searchTypeSignal.value
  );

  // const classType = filtros.classTypes.find((someClassType) =>
  //     someClassType.id === classTypeSignal.value
  // );

  params.originAirportCode = useSignal(params.originAirportCode ?? filtros.defaults.originAirportCode);

  const departureDate = useSignal(params.departureDate ?? formatDateWithTimezone(today));

  return (
    <form
      class="flex flex-col gap-4 items-start"
      id="form"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchParams = Object.fromEntries(formData.entries());
        onSubmit(searchParams);
      }}
    >

    <fieldset className="flex flex-col gap-2 my-2">
    <SearchTypeDropdown class="w-64" value={searchType} onChange={(selected) => searchTypeSignal.value = selected.id}/>
    {/*<ClassTypeDropdown*/}
    {/*  class="w-64"*/}
    {/*  value={classType}*/}
    {/*  onChange={(selected) => classTypeSignal.value = selected.id}*/}
    {/*/>*/}
    <OriginDestinationInputs defaults={params} searchType={searchTypeSignal.value}/>
    </fieldset>

    <fieldset class="flex flex-col gap-2 my-2">
      <ExpandedSearchSwitch signal={expandedSearchSignal} roundtripSearchSignal={roundtripSearchSignal}/>

      {expandedSearchSignal.value && <MonthSearchSwitch signal={monthSearchSignal}/>}

      {expandedSearchSignal.value && monthSearchSignal.value && <MonthsDropdown class="w-64" defaultValue={params["month[id]"]}/>}

      {((!expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)) &&
                  <Switch.Group as="div" class="flex items-center gap-4">

                    {roundtripSearchSignal.value && !expandedSearchSignal.value && <Switch.Label>Ida</Switch.Label>}

                    <input
                        {...(expandedSearchSignal.value && !monthSearchSignal.value ?
                            {name: 'dateRangeLowestValue', id: 'dateRangeLowestValue'} :
                            {name: 'departureDate', id: 'departureDate'})}
                        required
                        type="date"
                        className={`dark:color-scheme:dark w-36 shadow-md px-2 inline-flex items-center rounded-sm group-valid:border-green-400 group-invalid:border-red-400 h-10 ${inputsStyle}`}
                        min={formatDateWithTimezone(minDate)}
                        max={formatDateWithTimezone(maxDate)}
                        style={dateInputStyle}
                        value={departureDate}
                        onChange={function (ev) {
                          if((roundtripSearchSignal.value && !expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)){
                            const isRangeSearch = expandedSearchSignal.value && !monthSearchSignal.value;

                            let returnDateOrRangeHigherBound = document.getElementById( isRangeSearch ? 'dateRangeHighestValue' : 'returnDate');
                            if (new Date(ev.target.value) > new Date(returnDateOrRangeHigherBound.value)) {
                              ev.target.setCustomValidity(isRangeSearch ? 'Inicio del rango debe ser menor que el fin del rango' : 'La fecha de salida debe ser menor que la de vuelta');
                            } else {
                              ev.target.setCustomValidity('');
                              returnDateOrRangeHigherBound.setCustomValidity('');
                            }
                            ev.target.reportValidity();
                              }
                            }
                          }
                    />

                    {roundtripSearchSignal.value && !expandedSearchSignal.value && <Switch.Label>Vuelta</Switch.Label>}

                    {((roundtripSearchSignal.value && !expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)) &&
                    <input
                        {...(expandedSearchSignal.value && !monthSearchSignal.value ?
                            {name: 'dateRangeHighestValue', id: 'dateRangeHighestValue'} :
                            {name: 'returnDate', id: 'returnDate'})}
                        required
                        type="date"
                        className={`dark:color-scheme:dark w-36 shadow-md px-2 inline-flex items-center rounded-sm group-valid:border-green-400 group-invalid:border-red-400 h-10 ${inputsStyle}`}
                        min={formatDateWithTimezone(minDate)}
                        max={formatDateWithTimezone(maxDate)}
                        style={dateInputStyle}
                        onChange={function (ev) {
                          const isRangeSearch = expandedSearchSignal.value && !monthSearchSignal.value;

                          let departureDateOrRangeLowerBound = document.getElementById( isRangeSearch ? 'dateRangeLowestValue' : 'departureDate');
                          if (new Date(ev.target.value) < new Date(departureDateOrRangeLowerBound.value)) {
                            ev.target.setCustomValidity(isRangeSearch ? 'Fin del rango debe ser mayor que el inicio del rango' : 'La fecha de vuelta debe ser mayor que la de salida');
                          } else {
                            ev.target.setCustomValidity('');
                            departureDateOrRangeLowerBound.setCustomValidity('');
                          }
                          ev.target.reportValidity();
                        }
                        }
                    />
                    }
                  </Switch.Group>
      }

      {expandedSearchSignal.value && <RountripSearchSwitch signal={roundtripMonthSearchSignal}/>}

      {roundtripMonthSearchSignal.value && expandedSearchSignal.value && <RountripSearchSlider/>}
    </fieldset>

    <fieldset className="flex flex-col gap-2 my-2">
    <GolSearchSwitch signal={golSearchSignal}/>
    </fieldset>

    <fieldset className="flex flex-col gap-2 my-2">
    <FastSearchSwitch signal={fastSearchSignal}/>
    </fieldset>

    <fieldset className="flex flex-col gap-2 my-2">
    <PassengerInputs/>
      <fieldset className="group flex gap-1.5 w-full">
        <label>Adultos (12+ años)</label>
        <label>Niños (2-12 años)</label>
        <label>Bebes (0-2 años)</label>
      </fieldset>
    </fieldset>

      <button type="submit" className={`h-10 shadow-md disabled:opacity-25 rounded-sm px-4 ${buttonStyle}`} disabled = {isLoading}>
      Buscar
    </button>

    </form>
  );
}
