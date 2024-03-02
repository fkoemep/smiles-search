// @ts-nocheck until the components are transformed to TS

import {inputsStyle} from "../utils/styles.ts";

export default function RountripSearchSlider() {

    return (
        <fieldset className="group flex gap-2 w-full">

        <input
            name="rangeLowestValue"
            id="rangeLowestValue"
            required
            type="number"
            class={`shadow-md px-2 h-10 w-32 rounded-sm ${inputsStyle}`}
            placeholder="Duracion min"
            min={2}
            max={30}
            onChange={function(ev) {
                let rangeHighestValue = document.getElementById("rangeHighestValue");
                if( Boolean(rangeHighestValue) && Number(ev.target.value) > Number(rangeHighestValue.value) ){
                    ev.target.setCustomValidity('Debe ser menor que la duracion maxima');
                }
                else{
                    ev.target.setCustomValidity('');
                    rangeHighestValue.setCustomValidity('');
                }
                ev.target.reportValidity();
            }}

        />
        <input
            name="rangeHighestValue"
            id="rangeHighestValue"
            type="number"
            required
            class={`shadow-md px-2 h-10 w-32 rounded-sm ${inputsStyle}`}
            placeholder="Duracion max"
            min={2}
            max={30}
            onChange={function(ev) {
                let rangeLowestValue = document.getElementById("rangeLowestValue");
                if( Number(ev.target.value) < Number(rangeLowestValue.value) ){
                    ev.target.setCustomValidity('Debe ser mayor que la duracion minima');
                }
                else{
                    ev.target.setCustomValidity('');
                    rangeLowestValue.setCustomValidity('');
                }
                ev.target.reportValidity();
            }}
        />
        </fieldset>

    )
}