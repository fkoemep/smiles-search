import {formatDateWithTimezone, minDate, maxDate} from "../utils/dates.js";
import { useState } from "preact/hooks";
import { CalendarDaysIcon, CheckIcon } from "icons";
import MonthsDropdown from "./months-dropdown.jsx";
import RadioSettings from "./radio-group.jsx";

// function RadioSettings({searchType, setSearchType}) {
//     return (
//         <RadioGroup by="id">
//                 <RadioGroup.Option key={1} value={{id:1, value:'Startup'}}>
//                     Prueba
//                 </RadioGroup.Option>
//         </RadioGroup>
//     )
// }

export default function DatesSelect({ expandedSearchSignal, monthSearchSignal, roundtripSearchSignal, params }) {
    const [departureDate, setDepartureDate] = useState(params.departureDate);
    const [returnDate, setReturnDate] = useState(params.returnDate);
    const [searchType, setSearchType] = useState(1);

    const handleClick = function (ev) {
        if ("showPicker" in HTMLInputElement.prototype) {
            ev.target.closest('div').querySelector('input').showPicker();
        }
    };

    return (

        <div class="flex flex-row relative items-start min-w-0 shrink">
            {/*<RadioSettings/>*/}

            <div class='flex flex-col min-w-0 shrink w-72'>
                <div class='flex flex-row min-w-0 shrink'>
                    <span className="min-w-0 shrink text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">Inicio</span>
                </div>

                <div
                    className="flex flex-row items-center min-w-0 shrink h-10 bg-white dark:bg-[#36373B] dark:border-[#5f6368] border-[1px] dark:[color-scheme:dark] has-[:invalid]:border-red-400"
                    onClick={handleClick}>
                    <CalendarDaysIcon class='w-7 h-7 flex shrink min-w-0'/>
                    {(expandedSearchSignal.value && monthSearchSignal.value) &&
                        <MonthsDropdown defaultValue={params['month[id]']}/>}

                    {((!expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)) && (
                        <input
                            {...(expandedSearchSignal.value && !monthSearchSignal.value ?
                                {name: 'dateRangeLowestValue', id: 'dateRangeLowestValue'} :
                                {name: 'departureDate', id: 'departureDate'})}
                            required
                            type="date"
                            className={`min-w-0 w-full shadow-md inline-flex place-items-center rounded-sm focus-visible:outline-0 whitespace-nowrap overflow-hidden text-ellipsis shadow-none bg-transparent`}
                            min={formatDateWithTimezone(minDate)}
                            max={formatDateWithTimezone(maxDate)}
                            value={departureDate}
                            onChange={function (ev) {
                                setDepartureDate(ev.target.value);

                                if ((roundtripSearchSignal.value && !expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)) {
                                    const isRangeSearch = expandedSearchSignal.value && !monthSearchSignal.value;

                                    let returnDateOrRangeHigherBound = document.getElementById(isRangeSearch ? 'dateRangeHighestValue' : 'returnDate');
                                    if (new Date(ev.target.value) > new Date(returnDateOrRangeHigherBound.value)) {
                                        ev.target.setCustomValidity(isRangeSearch ? 'Inicio del rango debe ser menor que el fin del rango' : 'La fecha de salida debe ser menor que la de vuelta');
                                    } else {
                                        ev.target.setCustomValidity('');
                                        returnDateOrRangeHigherBound.setCustomValidity('');
                                    }
                                    ev.target.reportValidity();
                                }
                            }
                            }
                        />)}
                </div>
            </div>

            {((roundtripSearchSignal.value && !expandedSearchSignal.value) || (expandedSearchSignal.value && !monthSearchSignal.value)) && (
                <div class='flex flex-col min-w-0 shrink w-72'>
                    <span className="min-w-0 shrink text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">Fin</span>

                    <div className="flex flex-row items-center min-w-0 shrink h-10 bg-white dark:bg-[#36373B] dark:border-[#5f6368] border-[1px] dark:[color-scheme:dark] has-[:invalid]:border-red-400" onClick={handleClick}>
                        <CalendarDaysIcon class='w-7 h-7 flex shrink min-w-0'/>
                        <input
                        {...(expandedSearchSignal.value && !monthSearchSignal.value ?
                            {name: 'dateRangeHighestValue', id: 'dateRangeHighestValue'} :
                            {name: 'returnDate', id: 'returnDate', value: params.returnDate})}
                        required
                        type="date"
                        className={`min-w-0 w-full shadow-md inline-flex items-center rounded-sm focus-visible:outline-0 whitespace-nowrap overflow-hidden text-ellipsis shadow-none bg-transparent`}
                        min={departureDate}
                        max={formatDateWithTimezone(maxDate)}
                        value={returnDate}
                        onChange={function (ev) {
                            setReturnDate(ev.target.value);

                            const isRangeSearch = expandedSearchSignal.value && !monthSearchSignal.value;

                            let departureDateOrRangeLowerBound = document.getElementById(isRangeSearch ? 'dateRangeLowestValue' : 'departureDate');
                            if (new Date(ev.target.value) < new Date(departureDateOrRangeLowerBound.value)) {
                                ev.target.setCustomValidity(isRangeSearch ? 'Fin del rango debe ser mayor que el inicio del rango' : 'La fecha de vuelta debe ser mayor que la de salida');
                            } else {
                                ev.target.setCustomValidity('');
                                departureDateOrRangeLowerBound.setCustomValidity('');
                            }
                            ev.target.reportValidity();
                        }
                        }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
