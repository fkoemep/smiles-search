// @ts-nocheck until the components are transformed to TS

import { filtros } from "utils/flight.ts";
import RegionsDropdown from "./regions-dropdown.tsx";
import {inputsStyle} from "../utils/styles.ts";
import { Switch } from "@headlessui/react";

export default function PassengerInputs({  }) {
  return (


      <fieldset className="group flex gap-2 w-full">

          <input
            id="numberOfAdults"
            name="numberOfAdults"
            required
            type="number"
            class={`shadow-md px-2 h-10 w-32 rounded-sm ${inputsStyle}`}
            placeholder="Adultos"
            min={1}
            max={30}
            value={1}
            onChange={function(ev) {
              let valueOfKids = document.getElementById("numberOfKids");
                if( Number(valueOfKids.value) + Number(ev.target.value) > 9){
                ev.target.setCustomValidity('La suma de adultos y niños no puede ser mayor a 9');
              }
              else{
                ev.target.setCustomValidity('');
                valueOfKids.setCustomValidity('');
              }
                ev.target.reportValidity();
            }}
        />
        <input
            id="numberOfKids"
            name="numberOfKids"
            type="number"
            class={`shadow-md px-2 h-10 w-32 rounded-sm ${inputsStyle}`}
            placeholder="Niños (2-12 años)"
            min={0}
            max={9}
            value={0}
            //validate that the sum of numberOfKids and numberOfAdults isn't greater than 9
            onChange={function(ev) {
              let valueOfAdults = document.getElementById("numberOfAdults");
              if( Number(valueOfAdults.value) + Number(ev.target.value) > 9){
                ev.target.setCustomValidity('La suma de adultos y niños no puede ser mayor a 9');
              }
              else{
                ev.target.setCustomValidity('');
                valueOfAdults.setCustomValidity('');
              }
                ev.target.reportValidity();
            }}
        />
        <input
            name="numberOfBabies"
            type="number"
            class={`shadow-md px-2 h-10 w-32 rounded-sm ${inputsStyle}`}
            placeholder="Bebes (0-2 años)"
            value={0}
            min={0}
            max={9}
        />

      </fieldset>

  );
}
