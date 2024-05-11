import RegionsDropdown from "./regions-dropdown.jsx";
import {ArrowsRightLeftIcon, MapPinIcon} from 'icons';
import {useState} from "preact/hooks";

export default function OriginDestinationInputs({ params, searchType }) {
  const [origin, setOrigin] = useState(params.originAirportCode);
  const [destination, setDestination] = useState(params.destinationAirportCode);
  const [regionFrom, setRegionFrom] = useState(params.region_from ?? '');
  const [regionTo, setRegionTo] = useState(params.region_to ?? '');

  return (
    <div class="flex flex-row min-w-0 shrink items-center gap-2">

        <div class="flex flex-col shrink min-w-0 w-72">
          <span class="min-w-0 shrink text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">Origen</span>
          <div class='flex flex-row items-center min-w-0 shrink h-10 bg-white dark:bg-[#36373B] dark:border-[#5f6368] border-[1px] dark:[color-scheme:dark] has-[:invalid]:border-red-400'>
            <MapPinIcon class='w-7 h-7 flex shrink min-w-0'/>
            {["from-region-to-airport", "from-region-to-region"].includes(searchType) &&
                    <>
                      <RegionsDropdown
                          value={regionFrom}
                          name="region_from"
                          placeholder="Desde"
                          setter={setRegionFrom}
                      />
                      <input className={'hidden'} required value={regionFrom}/>
                    </>}

            {!["from-region-to-airport", "from-region-to-region"].includes(searchType) &&
                <input
                      name="originAirportCode"
                      required
                      type="text"
                      pattern="[a-zA-Z]{3}"
                      className={`min-w-0 w-full shadow-md inline-flex items-center rounded-sm focus-visible:outline-0 whitespace-nowrap overflow-hidden text-ellipsis bg-transparent shadow-none`}
                      placeholder="Desde"
                      maxLength={3}
                      onInput={(ev) => setOrigin(ev.target.value.toUpperCase())}
                      value={origin}
                    />}
          </div>
        </div>

      {
        ["airports", "from-region-to-region"].includes(searchType) && (
            <div class='flex flex-col min-w-0 shrink'>
                <span class='min-w-0 shrink text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis invisible'>*</span>

                <div class='flex flex-row items-center justify-center min-w-0 shrink h-10'>
                    <ArrowsRightLeftIcon class='w-7 h-7 flex shrink-[0.7] min-w-0' onclick={function () {
                      if (["from-region-to-airport", "from-region-to-region"].includes(searchType)){
                        const originValue = regionFrom;
                        const destinationValue = regionTo;

                        setRegionFrom(destinationValue);
                        setRegionTo(originValue);
                      }
                      else{
                        const originValue = origin;
                        const destinationValue = destination;

                        setDestination(originValue ?? '');
                        setOrigin(destinationValue ?? '');
                      }
                    }}/>
                </div>
            </div>
        )
      }

        <div class="flex flex-col shrink min-w-0 w-72">
            <span className="min-w-0 shrink text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">Destino</span>
            <div
                className="flex flex-row items-center min-w-0 shrink h-10 bg-white dark:bg-[#36373B] dark:border-[#5f6368] border-[1px] dark:[color-scheme:dark] has-[:invalid]:border-red-400">
                <MapPinIcon class='w-7 h-7 flex shrink min-w-0'/>


                {["from-airport-to-region", "from-region-to-region"].includes(searchType) &&
                    <>
                        <RegionsDropdown
                            value={regionTo}
                            name="region_to"
                            placeholder="Hacia"
                            setter={setRegionTo}
                        />
                        <input className={'hidden'} required value={regionTo}/>
                    </>}

                {!["from-airport-to-region", "from-region-to-region"].includes(searchType) &&
                    <input
                        name="destinationAirportCode"
                        required
                        type="text"
                        pattern="[a-zA-Z]{3}"
                        className={`min-w-0 w-full shadow-md inline-flex items-center rounded-sm focus-visible:outline-0 whitespace-nowrap overflow-hidden text-ellipsis bg-transparent shadow-none`}
                        placeholder="Hacia"
                        maxLength={3}
                        onInput={(ev) => setDestination(ev.target.value.toUpperCase())}
                        value={destination}
                        autoFocus
                    />}
            </div>
        </div>
    </div>
  );
}
