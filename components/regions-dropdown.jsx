import Dropdown from "components/dropdown.jsx";
import { regionsSignal } from "utils/signals.js";

export default function RegionsDropdown(
  { class: className, name, value, placeholder = "Elija una región", setter },
) {
  const validRegions = regionsSignal.value.filter((someRegion) => {
    return someRegion.name && someRegion.airports[0];
  }).sort((a, b) => a.name.localeCompare(b.name)).map((region) => region.name);
  return (
    <Dropdown
      name={name}
      value={value}
      setter={setter}
      customClass={'w-full'}
    >
      <Dropdown.Button class={'w-full'}>
        {({ value }) => value ? value : placeholder}
      </Dropdown.Button>
      <Dropdown.Options position={'end'} class={'w-full'}>
        {validRegions.map((regionName) => (
          <Dropdown.Option key={regionName} value={regionName} customClass={'w-full'}>
            {regionName}
          </Dropdown.Option>
        ))}
      </Dropdown.Options>
    </Dropdown>
  );
}
