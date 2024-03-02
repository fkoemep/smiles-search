import Dropdown from "components/dropdown.tsx";
import { filtros } from "utils/flight.ts";

export default function ClassTypeDropdown(
  { value, onChange },
) {
  return (
    <Dropdown
      name="class_type"
      value={value}
      onChange={onChange}
    >
      <Dropdown.Button>
        {({ value }) => `Clases: ${value.name}`}
      </Dropdown.Button>
      <Dropdown.Options>
        {filtros.classTypes.map((option) => (
          <Dropdown.Option key={option.id} value={option}>
            {option.name}
          </Dropdown.Option>
        ))}
      </Dropdown.Options>
    </Dropdown>
  );
}
