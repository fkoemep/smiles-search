import { filtros } from "utils/flight.ts";
import { resultadosSignal } from "utils/signals.ts";
import Dropdown from "components/dropdown.tsx";
import Collapsible from "components/collapsible.tsx";
import { apiPath } from "../utils/api.ts";
import {inputsStyle} from "../utils/styles.ts";

export default function Filtros({ onChange, airlineCodeList, layoverAirports, cabins }) {

  return (
    <form
      onChange={(event) => {
        const formData = new FormData(event.currentTarget);
        const filters = Object.fromEntries(formData.entries());
        onChange(filters);
      }}
    >
      <label>
        Resultados<input
          type="number"
          name="results"
          max={100}
          value={resultadosSignal.value}
          onChange={(ev) => {
            resultadosSignal.value = Number(ev.target.value);
          }}
          class={`h-10 ml-2 mb-2 rounded-sm px-2 w-16 ${inputsStyle}`}
        />
      </label>
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

        <Dropdown name="stops" defaultValue={filtros.defaults.escalas}>
          <Dropdown.Button>
            {({ value }) => `Escalas: ${value.name}`}
          </Dropdown.Button>
          <Dropdown.Options>
            {filtros.escalas.map((escala) => (
              <Dropdown.Option
                key={escala.id}
                value={escala}
              >
                {escala.name}
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
