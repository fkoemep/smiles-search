import { Switch } from "@headlessui/react";
import { selectedButtonStyle, notSelectedButtonStyle } from "utils/styles.js";


export default function RountripSearch({ signal }) {
    return (
        <Switch.Group as="div" class="flex items-center gap-4">
            <Switch.Label>Ida y Vuelta</Switch.Label>
            <Switch
                checked={signal.value === true}
                onChange={(newValue) => signal.value = newValue}
                class={`${
                    signal.value ? selectedButtonStyle : notSelectedButtonStyle
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
        <span
            class={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                signal.value ? "translate-x-6" : "translate-x-1"
            }`}
        />
            </Switch>
        </Switch.Group>
    );
}
