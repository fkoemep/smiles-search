import { Switch } from "@headlessui/react";
import {selectedButtonStyle, notSelectedButtonStyle, dropdownStyle} from "utils/styles.js";
import Dropdown from "./dropdown.jsx";
import { Field, Label, Radio, RadioGroup } from '@headlessui/react'

export default function ExpandedSearch({ expandedSearchSignal, monthSearchSignal }) {
  return (
      // <div className="flex flex-row gap-1 items-center shrink min-w-0">
      //     <span className="text-left text-sm font-normal">Busqueda:</span>
      // <RadioGroup
      //     defaultValue = {"No"}
      //     onChange={(newValue) => {
      //         if(newValue === 'No'){
      //             expandedSearchSignal.value = false;
      //         }
      //         else {
      //             expandedSearchSignal.value = true;
      //             monthSearchSignal.value = newValue;
      //         }
      //         requestAnimationFrame(() => {
      //             // document.forms['search'].dispatchEvent(new Event("change"));
      //             document.forms['search'].reportValidity();
      //         });
      //     }}
      //     class={`flex flex-row self-center ${dropdownStyle} gap-2`}
      // >
      //     <Field key={"No"} className="flex items-center gap-1">
      //         <Radio
      //             value={'No'}
      //             className="group flex size-3 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
      //         >
      //             <span className="invisible size-1 rounded-full bg-white group-data-[checked]:visible" />
      //         </Radio>
      //         <Label className="text-left text-sm font-normal">Normal</Label>
      //     </Field>
      //
      //     <Field key={"Por mes"} className="flex items-center gap-1">
      //         <Radio
      //             value={true}
      //             className="group flex size-3 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
      //         >
      //             <span className="invisible size-1 rounded-full bg-white group-data-[checked]:visible" />
      //         </Radio>
      //         <Label className="text-left text-sm font-normal">Por mes</Label>
      //     </Field>
      //
      //     <Field key={"Por rango de fechas"} className="flex items-center gap-1">
      //         <Radio
      //             value={false}
      //             className="group flex size-3 items-center justify-center rounded-full border bg-white data-[checked]:bg-blue-400"
      //         >
      //             <span className="invisible size-1 rounded-full bg-white group-data-[checked]:visible" />
      //         </Radio>
      //         <Label className="text-left text-sm font-normal">Rango de fechas</Label>
      //     </Field>
      // </RadioGroup>
      //
      // </div>

      // <div className="flex flex-row gap-0 shrink min-w-0">
      <Dropdown
          defaultValue = {"No"}
          onChange={(newValue) => {
              if(newValue === 'No'){
                  expandedSearchSignal.value = false;
              }
              else {
                  expandedSearchSignal.value = true;
                  monthSearchSignal.value = newValue;
              }
              requestAnimationFrame(() => {
                  // document.forms['search'].dispatchEvent(new Event("change"));
                  document.forms['search'].reportValidity();
              });
          }}
          // class={`flex flex-col self-center ${dropdownStyle} relative shrink min-w-0 text-left text-sm font-medium`}
          class={`flex flex-col self-start ${dropdownStyle}`}
      >
          <Dropdown.Button class={'!pl-0 !py-0'}>
              {({ value }) => `${value === "No" ? "Busqueda ampliada: No" : (value ? "Por mes" : "Por rango de fechas")}`}
          </Dropdown.Button>
          <Dropdown.Options>
              <Dropdown.Option key={"No"} value={'No'}>
                  No
              </Dropdown.Option>
              <Dropdown.Option key={"Por mes"} value={true}>
                  Busqueda por mes
              </Dropdown.Option>
              <Dropdown.Option key={"Por rango de fechas"} value={false}>
                  Busqueda por rango de fechas
              </Dropdown.Option>
          </Dropdown.Options>
      </Dropdown>
      // </div>
  );
}
