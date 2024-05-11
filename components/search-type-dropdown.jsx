import Dropdown from "components/dropdown.jsx";
import { filtros } from "utils/flight.js";
import {dropdownStyle} from "../utils/styles.js";

export default function SearchTypeDropdown(
  { value, signal },
) {
  return (
    <Dropdown
      name="search_type"
      value={value}
      onChange={(selected) => signal.value = selected.id}
      class={ `flex flex-col self-start ${dropdownStyle} pb-4`}
    >
      <Dropdown.Button class={'!pl-0 !py-0'}>
        {({ value }) => `Tipo de búsqueda: ${value.name}`}
      </Dropdown.Button>
      <Dropdown.Options>
        {filtros.searchTypes.map((option) => (
          <Dropdown.Option key={option.id} value={option}>
            {option.name}
          </Dropdown.Option>
        ))}
      </Dropdown.Options>
    </Dropdown>
  );
}
