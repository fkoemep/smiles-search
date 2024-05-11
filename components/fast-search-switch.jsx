import { Switch } from "@headlessui/react";
import { selectedButtonStyle, notSelectedButtonStyle } from "utils/styles.js";


export default function FastSearch({ signal }) {
    return (
        <Switch.Group as="div" class="flex flex-row gap-4 justify-between items-center pb-4 dark:text-[#9aa0a6] text-[#70757a]">
            <div className="flex flex-col">
                <Switch.Label>Busqueda rápida</Switch.Label>
                <Switch.Label class={'text-xs font-light'}>Las tasas pueden ser imprecisas</Switch.Label>
            </div>

            <div className="flex flex-col gap-2">
                <Switch
                    checked={signal.value === true}
                    onChange={(newValue) => signal.value = newValue}
                    class={`${
                        signal.value ? selectedButtonStyle : notSelectedButtonStyle
                    } relative inline-flex h-3 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                >
                    <span
                        class={`inline-flex h-5 w-5 rounded-full bg-white transition-transform ${
                            signal.value ? "translate-x-5" : "-translate-x-1"
                        }`}
                    />
                    <input type="hidden" value={signal.value} name="fastSearch"/>
                </Switch>
            </div>
        </Switch.Group>
    );
}
