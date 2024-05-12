import {selectedButtonStyle, notSelectedButtonStyle, dropdownStyle, disclosurePanel} from "utils/styles.js";
import Dropdown from "./dropdown.jsx";
import {filtros} from "../utils/flight.js";
import {GlobeAmericasIcon} from "icons";

export default function CountryLanguageDropdown({ signal, languageSignal }) {
    return (
        <div class="flex flex-row gap-1 shrink min-w-0">

            <Dropdown
                value={signal.value}
                onChange={(newValue) => {
                    signal.value = newValue;
                }}
                class={`${dropdownStyle} text-left text-sm font-medium flex flex-col shrink min-w-0`}
            >
                <Dropdown.Button customIcon={<GlobeAmericasIcon class="w-5 h-5 flex shrink min-w-0"/>} class={'!gap-2'}>
                    {({ value }) => `${value === "Argentina" ? "Argentina" : "Brasil"}`}
                </Dropdown.Button>
                <Dropdown.Options position={'end'}>
                    <Dropdown.Option key={filtros.defaults.searchRegions} value={filtros.defaults.searchRegions}>
                        {filtros.defaults.searchRegions}
                    </Dropdown.Option>
                    <Dropdown.Option key={filtros.searchRegions.Brasil} value={filtros.searchRegions.Brasil}>
                        {filtros.searchRegions.Brasil}
                    </Dropdown.Option>
                </Dropdown.Options>
            </Dropdown>

            <Dropdown
        value={languageSignal.value}
        onChange={(newValue) => {
            languageSignal.value = newValue;
        }}
        class={`${dropdownStyle} hidden`}
        >
            <Dropdown.Button>
                {({ value }) => `${value === 'es' ? "Español" : (value === 'pt' ? "Portugues" : "English")}`}
            </Dropdown.Button>
            <Dropdown.Options>
                <Dropdown.Option key={"Espanol"} value={'es'}>
                    Español
                </Dropdown.Option>
                <Dropdown.Option key={"Portugues"} value={'pt'}>
                    Português
                </Dropdown.Option>
                <Dropdown.Option key={"English"} value={'en'}>
                    English
                </Dropdown.Option>
            </Dropdown.Options>
        </Dropdown>
    </div>
);
}
