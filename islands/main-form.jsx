import { formatDateWithTimezone, today} from "utils/dates.js";
import RountripSearchDropdown from "components/roundtrip-search-dropdown.jsx";
import RountripSearchSlider from "components/roundtrip-search-slider.jsx";
import PassengerInputs from "components/passengers-inputs.jsx";
import MonthsDropdown from "components/months-dropdown.jsx";
import OriginDestinationInputs from "components/origin-destination-inputs.jsx";
import DatesSelect from "components/dates-select.jsx";
import { useSignal } from "@preact/signals";
import { filtros } from "utils/flight.js";
import ExtraOptionsDropdown from "../components/extra-options-dropdown.jsx";
import { useEffect } from "preact/hooks";
import { MagnifyingGlassIcon } from "icons";
import CountryLanguageDropdown from "../components/country-language-dropdown.jsx";


export default function MainForm({ params, monthSearchSignal, golSearchSignal, roundtripSearchSignal, expandedSearchSignal, onSubmit, fastSearchSignal, requestsSignal, countrySignal, languageSignal}) {

  const isFormValid = useSignal(false);

  useEffect(()=>{
    document.forms['search'].dispatchEvent(new Event("change"));
    isFormValid.value = document.forms['search'].checkValidity();
  }, [])

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

  params.departureDate = useSignal(params.departureDate ?? formatDateWithTimezone(today));

  params.numberOfAdults = useSignal(params.numberOfAdults ? Number(params.numberOfAdults) : 1);
  params.numberOfKids = useSignal(params.numberOfKids ? Number(params.numberOfKids) : 0);
  params.numberOfBabies = useSignal(params.numberOfBabies ? Number(params.numberOfBabies) : 0);

  return (
      <div className="flex flex-row shrink min-w-0 justify-center">
          <form
              id="form"
              name="search"
              method="get"
              className='min-w-0 shrink'
              onChange={function (event) {
                  isFormValid.value = document.forms['search'].checkValidity();
                  document.forms['search'].reportValidity();
              }}
              onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.target);
                  const searchParams = Object.fromEntries(formData.entries());
                  onSubmit(searchParams);
              }}>

              <div
                  className="flex flex-row shadow-[0_1px_3px_0_rgba(60,64,67,.3),0_4px_8px_3px_rgba(60,64,67,.15)] dark:shadow-[0_1px_3px_0_rgba(0,0,0,.3),0_4px_8px_3px_rgba(60,00,00,.15)] dark:bg-[#36373B] rounded-lg px-4 py-2 m-2 !mb-0 !pb-0 shrink min-w-0 justify-center">

                  <div className="flex flex-col gap-2 shrink min-w-0 justify-between">

                      <div className="flex flex-row gap-1 shrink min-w-0">
                          <RountripSearchDropdown signal={roundtripSearchSignal}/>
                          <PassengerInputs params={params}/>

                          <ExtraOptionsDropdown golSearchSignal={golSearchSignal} fastSearchSignal={fastSearchSignal}
                                                searchTypeSignal={searchTypeSignal} searchType={searchType}
                                                params={params} monthSearchSignal={monthSearchSignal}
                                                expandedSearchSignal={expandedSearchSignal}/>
                      </div>

                      <div className="flex flex-row gap-1 items-center shrink min-w-0 flex-wrap">

                          <input type={"hidden"} name='searchRegion' value={countrySignal.value}/>

                          <OriginDestinationInputs params={params} searchType={searchTypeSignal.value}/>

                          <div className="flex flex-row items-center shrink min-w-0">
                              <DatesSelect expandedSearchSignal={expandedSearchSignal}
                                           monthSearchSignal={monthSearchSignal}
                                           roundtripSearchSignal={roundtripSearchSignal} params={params}/>
                          </div>
                      </div>

                      <div className="flex flex-row min-w-0 shrink mt-3 justify-center">
                          {(roundtripSearchSignal.value && expandedSearchSignal.value) && <RountripSearchSlider/>}
                      </div>

                      <div className="flex flex-row translate-y-1/2 justify-center shrink min-w-0">
                          <button type="submit"
                                  className={`flex flex-row justify-between gap-2 items-center h-10 min-w-16 min-w-0 shadow-md disabled:bg-gray-600 rounded-3xl px-4 bg-blue-700 text-black dark:bg-[#89B4F7] shrink`}
                                  disabled={requestsSignal.value.status === "loading" || !isFormValid.value}>
                              <MagnifyingGlassIcon class="h-5 w-5 flex shrink min-w-0"/>
                              <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>Buscar</span>
                          </button>
                      </div>
                  </div>
              </div>
          </form>
    </div>
)
    ;
}
