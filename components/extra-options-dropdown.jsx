import GolSearchSwitch from "./gol-search-switch.jsx";
import FastSearchSwitch from "./fast-search-switch.jsx";
import CustomPopover from "./custom-popover.jsx";
import ExpandedSearchDropdown from "./expanded-search-dropdown.jsx";
import SearchTypeDropdown from "./search-type-dropdown.jsx";
import { AdjustmentsVerticalIcon } from "icons";

export default function ExtraOptionsDropdown({ golSearchSignal, fastSearchSignal, expandedSearchSignal, monthSearchSignal, searchTypeSignal, searchType, params }) {
  return (
      <CustomPopover text={'Opciones'} position={'end'} customIcon={<AdjustmentsVerticalIcon class="w-5 h-5 flex shrink min-w-0"/>} buttonclass={'!gap-2'}>
          <div className="flex flex-col">
              <GolSearchSwitch signal={golSearchSignal} params={params}/>
              <FastSearchSwitch signal={fastSearchSignal}/>
              <SearchTypeDropdown value={searchType} signal={searchTypeSignal}/>
              <ExpandedSearchDropdown signal={expandedSearchSignal} monthSearchSignal={monthSearchSignal}/>
          </div>
      </CustomPopover>
);
}
