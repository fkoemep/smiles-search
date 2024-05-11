import Dropdown from "components/dropdown.jsx";
import { months } from "utils/dates.js";
import {dropdownStyle} from "../utils/styles.js";

export default function MonthsDropdown(
  { defaultValue = months[0].id, ...props },
) {
  return (
    <Dropdown
      name="month"
      defaultValue={months.find((someMonth) => someMonth.id === defaultValue)}
      customClass={'w-full'}
      {...props}
    >
      <Dropdown.Button class={'w-full'}>{({ value }) => `Mes: ${value.name}`}</Dropdown.Button>
      <Dropdown.Options position={'end'} class={'w-full'}>
        {months.map((option) => (
          <Dropdown.Option key={option.id} customClass={'w-full capitalize md:normal-case md:first-letter:uppercase'} value={option}>
            {option.name}
          </Dropdown.Option>
        ))}
      </Dropdown.Options>
    </Dropdown>
  );
}
