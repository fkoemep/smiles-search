import {dropdownStyle} from "utils/styles.js";
import Dropdown from "./dropdown.jsx";
import { ArrowLongRightIcon, ArrowsRightLeftIcon } from "icons";


export default function RountripSearch({ signal }) {
    return (
        <Dropdown
            value={signal.value}
            onChange={(newValue) => {
                signal.value = newValue;
                requestAnimationFrame(() => {
                    document.forms['search'].dispatchEvent(new Event("change"));
                });
            }}
            class={`${dropdownStyle} text-left text-sm font-medium flex flex-col shrink min-w-0`}
        >
            <Dropdown.Button customIcon={<TripTypeIcon signal={signal}/>} class={'gap-2 portrait:gap-1 portrait:p-1'}>
                {({ value }) => `${value ? "Ida y vuelta" : "Solo ida"}`}
            </Dropdown.Button>
            <Dropdown.Options>
                <Dropdown.Option key={"Ida"} value={false}>
                    Solo ida
                </Dropdown.Option>
                <Dropdown.Option key={"Ida y Vuelta"} value={true}>
                    Ida y vuelta
                </Dropdown.Option>
            </Dropdown.Options>
        </Dropdown>
    );
}

function TripTypeIcon({signal}) {
    return (
        <>
            {
                signal.value ? <ArrowsRightLeftIcon class="w-5 h-5 flex shrink min-w-0" /> : <ArrowLongRightIcon class="w-5 h-5 flex shrink min-w-0" />
            }

        </>
    );
}
