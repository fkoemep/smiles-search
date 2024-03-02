import { Switch } from "@headlessui/react";
import { selectedButtonStyle, notSelectedButtonStyle } from "utils/styles.ts";

export default function ExpandedSearch({ signal, roundtripSearchSignal }) {
  return (
    <Switch.Group as="div" class="flex items-center gap-4">
      <Switch.Label>Búsqueda ampliada</Switch.Label>
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

        {!signal.value && <Switch.Label>Ida y Vuelta</Switch.Label>}


        {!signal.value &&
            <Switch
            checked={roundtripSearchSignal.value === true}
            onChange={(newValue) => roundtripSearchSignal.value = newValue}
            class={`${
                roundtripSearchSignal.value ? selectedButtonStyle : notSelectedButtonStyle
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
        >
        <span
            class={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                roundtripSearchSignal.value ? "translate-x-6" : "translate-x-1"
            }`}
        />
        </Switch>}
    </Switch.Group>
  );
}
