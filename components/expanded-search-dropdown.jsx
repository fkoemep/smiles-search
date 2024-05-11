import { Switch } from "@headlessui/react";
import {selectedButtonStyle, notSelectedButtonStyle, dropdownStyle} from "utils/styles.js";
import Dropdown from "./dropdown.jsx";

export default function ExpandedSearch({ signal, monthSearchSignal }) {
  return (
      <Dropdown
          defaultValue = {"No"}
          onChange={(newValue) => {
              if(newValue === 'No'){
                  signal.value = false;
              }
              else {
                  signal.value = true;
                  monthSearchSignal.value = newValue;
              }
              requestAnimationFrame(() => {
                  // document.forms['search'].dispatchEvent(new Event("change"));
                  document.forms['search'].reportValidity();
              });
          }}
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
  );
}
