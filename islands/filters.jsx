import { filtros } from "utils/flight.js";
import { resultadosSignal } from "utils/signals.js";
import Dropdown from "components/dropdown.jsx";
import Collapsible from "components/collapsible.jsx";
import { apiPath } from "../utils/api.js";
import {inputsStyle} from "../utils/styles.js";

export default function Filtros({ onChange, airlineCodeList, layoverAirports, cabins, stops }) {

  airlineCodeList = [...airlineCodeList].map(JSON.parse);
  cabins = [...cabins].map(JSON.parse);
  layoverAirports = [...layoverAirports].map(JSON.parse);
  stops = [...stops];


  return (
    <form
      onChange={(event) => {
        const formData = new FormData(event.currentTarget);
        const filters = Object.fromEntries(formData.entries());
        onChange(filters);
      }}
    >
      <Collapsible text="Filtros" class="sm:grid sm:grid-cols-2 lg:grid-cols-3">
        <Dropdown
          name="airlines"
          defaultValue={filtros.defaults.airlineCodes}
          multiple
          by="id"
        >
          <Dropdown.Button>
            {({ value }) => (
              <div>
                Aerolíneas: {value.length > 0 ? ` (${value.length})` : "Todas"}
              </div>
            )}
          </Dropdown.Button>

          <Dropdown.Options>
            {airlineCodeList.map((airline) => (
              <Dropdown.Option
                key={airline.id}
                value={airline}
              >
                {({ selected }) => (
                  <>
                    <span
                      class={`block truncate ${
                        selected ? "font-medium" : "font-normal"
                      }`}
                    >
                      {airline.name}
                    </span>
                  </>
                )}
              </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>

        <Dropdown
            name="layoverAirports"
            defaultValue={filtros.defaults.airlineCodes}
            multiple
            by="id"
        >
          <Dropdown.Button>
            {({ value }) => (
                <div>
                  Aeropuertos de conexión: {value.length > 0 ? ` (${value.length})` : "Todos"}
                </div>
            )}
          </Dropdown.Button>

          <Dropdown.Options>
            {layoverAirports.map((airport) => (
                <Dropdown.Option
                    key={airport.id}
                    value={airport}
                >
                  {({ selected }) => (
                      <>
                    <span
                        class={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                        }`}
                    >
                      {airport.name}
                    </span>
                      </>
                  )}
                </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>

        <Dropdown
            name="cabinType"
            defaultValue={filtros.defaults.cabinas}
            multiple
            by="id"
        >
          <Dropdown.Button>
            {({ value }) => (
                <div>
                  Cabina: {value.length > 0 ? ` (${ value.length})` : "Todas"}
                </div>
            )}
          </Dropdown.Button>
          <Dropdown.Options>
            {cabins.map((option) => (
                <Dropdown.Option key={option.id} value={option}>
                  {option.name}
                </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>

        <Dropdown name="stops" defaultValue={{id: '', name: filtros.defaults.escalas}} by="id">
          <Dropdown.Button>
            {({ value }) => `Escalas: ${value.name}`}
          </Dropdown.Button>
          <Dropdown.Options>
            {stops.map((escala) => (
              <Dropdown.Option
                key={escala}
                value={{id: escala, name: filtros.escalas[escala]}}
              >
                {filtros.escalas[escala]}
              </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>
        <Dropdown
          name="viaje-facil"
          defaultValue={filtros.defaults.viajeFacil}
        >
          <Dropdown.Button>
            {({ value }) =>
              value.id === "" ? `Viaje fácil: ${value.name}` : value.name}
          </Dropdown.Button>
          <Dropdown.Options>
            {filtros.viajeFacil.map((vf) => (
              <Dropdown.Option key={vf.id} value={vf}>
                {vf.name}
              </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>
        <Dropdown name="tarifa" defaultValue={filtros.defaults.tarifas}>
          <Dropdown.Button>
            {({ value }) => `Tarifa: ${value.name}`}
          </Dropdown.Button>
          <Dropdown.Options>
            {filtros.tarifas.map((option) => (
              <Dropdown.Option key={option.id} value={option}>
                {option.name}
              </Dropdown.Option>
            ))}
          </Dropdown.Options>
        </Dropdown>
        {
          /*<Dropdown name="smiles-and-money" defaultValue={smilesAndMoney.find(option => option.id === preferences['smiles-and-money'])}>
          <Dropdown.Button>{({ value }) => `Smiles and Money: ${value.id === '' ? 'Deshabilitado' : 'Habilitado'}`}</Dropdown.Button>
          <Dropdown.Options>
            {smilesAndMoney.map(option =>
              <Dropdown.Option key={option.id}
                value={option}
              >{option.name}</Dropdown.Option>
            )}
          </Dropdown.Options>
        </Dropdown>*/
        }
        <div class="flex gap-4">
          <label class="py-2">Max. horas</label>
          <input
            name="maxhours"
            type="number"
            max={36}
            class={`shadow-md px-2 h-10 w-20 rounded-sm ${inputsStyle}`}
          />
        </div>
      </Collapsible>
    </form>
  );
}
