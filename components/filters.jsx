import { filtros } from "utils/flight.js";
import { resultadosSignal } from "utils/signals.js";
import Dropdown from "components/dropdown.jsx";
import Collapsible from "components/collapsible.jsx";
import { apiPath } from "../utils/api.js";
import {inputsStyle} from "../utils/styles.js";

export default function Filtros({ onChange, airlineCodeList, layoverAirports, cabins, stops }) {
    airlineCodeList = [...new Set(airlineCodeList)].map(JSON.parse);
    cabins = [...cabins].map(JSON.parse);
    layoverAirports = [...new Set(layoverAirports)].map(JSON.parse);
    stops = [...stops];


    return (

        <form
            onChange={(event) => {
                const formData = new FormData(event.currentTarget);
                const filters = Object.fromEntries(formData.entries());
                onChange(filters);
            }}
        >
                <div class='flex flex-row pt-1 justify-center mt-4 flex-wrap items-center'>
                        <Dropdown
                            name="airlines"
                            defaultValue={filtros.defaults.airlineCodes}
                            multiple
                            by="id"
                        >
                          <Dropdown.Button>
                            {({value}) => (
                                <div>
                                  Aerolíneas: {value.length > 0 ? ` (${value.length})` : "Todas"}
                                </div>
                            )}
                          </Dropdown.Button>

                          <Dropdown.Options>
                            {airlineCodeList.map((airline) => (
                                <Dropdown.Option key={airline.id} value={airline}>
                                <span class={`block truncate`}>
                                  {airline.name}
                                </span>
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
                            {({value}) => (
                                <div>
                                  Aeropuertos de conexión: {value.length > 0 ? ` (${value.length})` : "Todos"}
                                </div>
                            )}
                          </Dropdown.Button>

                          <Dropdown.Options>
                            {layoverAirports.map((airport) => (
                                <Dropdown.Option key={airport.id} value={airport}>
                                <span class={`block truncate`}>
                                  {airport.name}
                                </span>
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
                            {({value}) => (
                                <div>
                                  Cabina: {value.length > 0 ? ` (${value.length})` : "Todas"}
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
                            {({value}) => `Escalas: ${value.name}`}
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
                            {({value}) =>
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
                            {({value}) => `Tarifa: ${value.name}`}
                          </Dropdown.Button>
                          <Dropdown.Options>
                            {filtros.tarifas.map((option) => (
                                <Dropdown.Option key={option.id} value={option}>
                                  {option.name}
                                </Dropdown.Option>
                            ))}
                          </Dropdown.Options>
                        </Dropdown>

                        <Dropdown name="baggage" defaultValue={'false'}>
                          <Dropdown.Button>{({value}) => `Equipaje: ${value === 'true' ? 'Incluido' : 'Indistinto'}`}</Dropdown.Button>
                          <Dropdown.Options>
                            <Dropdown.Option key={'false'} value={'false'}> Indistinto </Dropdown.Option>
                            <Dropdown.Option key={'true'} value={'true'}> Incluido </Dropdown.Option>
                          </Dropdown.Options>
                        </Dropdown>

                        <div class="flex flex-row gap-2 min-w-0 shrink">
                          <label className="text-sm font-normal min-w-0 whitespace-nowrap overflow-hidden text-ellipsis py-2">Max. horas</label>
                          <input
                              name="maxhours"
                              type="number"
                              max={36}
                              className={`text-sm font-normal min-w-0 whitespace-nowrap overflow-hidden text-ellipsis shadow-md rounded-sm w-10 ${inputsStyle}`}
                          />
                        </div>
              </div>
            </form>
    );
}
