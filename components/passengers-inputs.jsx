import {inputsStyle} from "../utils/styles.js";
import CustomPopover from "./custom-popover.jsx";
import { useState } from "preact/hooks";
import { PlusCircleIcon, MinusCircleIcon, UserPlusIcon, UserIcon } from "icons";

export default function PassengerInputs({params}) {

    const [numberOfAdultsParent, setNumberOfAdultsParent] = useState(params.numberOfAdults);
    const [numberOfKidsParent, setNumberOfKidsParent] = useState(params.numberOfKids);
    const [numberOfBabiesParent, setNumberOfBabiesParent] = useState(params.numberOfBabies);

    const parentSetters = {setNumberOfAdultsParent: setNumberOfAdultsParent, setNumberOfKidsParent: setNumberOfKidsParent, setNumberOfBabiesParent: setNumberOfBabiesParent};
    const parentValues = {numberOfAdultsParent: numberOfAdultsParent, numberOfKidsParent: numberOfKidsParent, numberOfBabiesParent: numberOfBabiesParent};

    return (
        <CustomPopover customIcon={<PopoverButtonDisplay passengers={parentValues}/>} class={"gap-8"} position={'center'}
           buttonclass={numberOfAdultsParent + numberOfKidsParent > 9 ? "!text-red-700 !dark:text-red-700 !gap-2 portrait:!gap-1 portrait:p-1" : "!gap-2 portrait:!gap-1 portrait:p-1"}>
            {/*using close method from Popover panel*/}
            {({ open, close }) => (
                <>
                    {/*helps us reset the values of the inputs if the user clicks elsewhere by changing the keys (the keys don't serve any other purpose)*/}
                    {open ? <PopoverContent key="a" params={params} close={close} setters={parentSetters}/> : <PopoverContent key="b" params={params} close={close} setters={parentSetters}/>}
                </>
            )}
        </CustomPopover>
    );
}

function PopoverButtonDisplay({passengers}) {
    return(
        <>
            {passengers.numberOfAdultsParent + passengers.numberOfKidsParent + passengers.numberOfBabiesParent > 1 ? <UserPlusIcon class="w-5 h-5 flex shrink min-w-0"/> : <UserIcon class="w-5 h-5 flex shrink min-w-0"/>}
            <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{passengers.numberOfAdultsParent + passengers.numberOfKidsParent + passengers.numberOfBabiesParent}</span>
        </>
    );
}

function PopoverContent({params, close, setters}){
    const [numberOfAdultsDisplay, setNumberOfAdultsDisplay] = useState(params.numberOfAdults);
    const [numberOfKidsDisplay, setNumberOfKidsDisplay] = useState(params.numberOfKids);
    const [numberOfBabiesDisplay, setNumberOfBabiesDisplay] = useState(params.numberOfBabies);

    return(
        <>
            <div className="flex flex-col">

                <div className="flex flex-row gap-2 justify-between items-center pb-4">
                    <div className="flex gap-2 dark:text-[#9aa0a6] text-[#70757a]">
                        <label>Adultos</label>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <MinusCircleIcon className={`w-5 h-5 ${numberOfAdultsDisplay <= 1 ? 'text-gray-500' : ''}`}
                                         onClick={function () {
                                             if (numberOfAdultsDisplay >= 2) {
                                                 setNumberOfAdultsDisplay(numberOfAdultsDisplay - 1);
                                             }
                         }}/>
                        <input
                            id="numberOfAdultsDisplay"
                            type="number"
                            className={`shadow-md rounded-sm ${inputsStyle} text-center min-w-0 max-w-7 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Adultos"
                            readOnly={true}
                            min={1}
                            max={9}
                            value={numberOfAdultsDisplay}
                        />

                        <input
                            id="numberOfAdults"
                            name="numberOfAdults"
                            required
                            type="number"
                            className={`hidden shadow-md rounded-sm ${inputsStyle} text-center w-0 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Adultos"
                            min={1}
                            max={9}
                            value={params.numberOfAdults}
                            onChange={function (ev) {
                                let valueOfKids = document.getElementById("numberOfKids");
                                if (Number(valueOfKids.value) + Number(ev.target.value) > 9) {
                                    ev.target.setCustomValidity('La suma de adultos y niños no puede ser mayor a 9');
                                } else {
                                    ev.target.setCustomValidity('');
                                    valueOfKids.setCustomValidity('');
                                }
                                ev.target.reportValidity();
                            }}
                        />
                        <PlusCircleIcon className={`w-5 h-5 ${numberOfAdultsDisplay >= 9 ? 'text-gray-500' : ''}`}
                            onClick={function () {
                                if (numberOfAdultsDisplay <= 8) {
                                    setNumberOfAdultsDisplay(numberOfAdultsDisplay + 1);
                                }
                        }}/>
                    </div>
                </div>
                
                <div className="flex flex-row gap-2 justify-between items-center pb-4">
                    <div className="flex flex-col justify-center dark:text-[#9aa0a6] text-[#70757a]">
                        <label>Niños</label>
                        <label className={'text-xs font-light'}>De 2 a 12 años</label>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <MinusCircleIcon className={`w-5 h-5 ${numberOfKidsDisplay <= 0 ? 'text-gray-500' : ''}`} onClick={function () {
                            if (numberOfKidsDisplay >= 1) {
                                setNumberOfKidsDisplay(numberOfKidsDisplay - 1);
                            }
                        }}/>

                        <input
                            id="numberOfKidsDisplay"
                            type="number"
                            className={`shadow-md rounded-sm ${inputsStyle} text-center min-w-0 max-w-7 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Niños (2-12 años)"
                            readOnly={true}
                            min={0}
                            max={9}
                            value={numberOfKidsDisplay}
                        />

                        <input
                            id="numberOfKids"
                            name="numberOfKids"
                            type="number"
                            className={`hidden shadow-md rounded-sm ${inputsStyle} text-center min-w-0 max-w-7 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Niños (2-12 años)"
                            min={0}
                            max={9}
                            value={params.numberOfKids}
                            //validate that the sum of numberOfKids and numberOfAdults isn't greater than 9
                            onChange={function (ev) {
                                let valueOfAdults = document.getElementById("numberOfAdults");
                                if (Number(valueOfAdults.value) + Number(ev.target.value) > 9) {
                                    ev.target.setCustomValidity('La suma de adultos y niños no puede ser mayor a 9');
                                } else {
                                    ev.target.setCustomValidity('');
                                    valueOfAdults.setCustomValidity('');
                                }
                                ev.target.reportValidity();
                            }}
                        />
                        <PlusCircleIcon className={`w-5 h-5 ${numberOfKidsDisplay >= 9 ? 'text-gray-500' : ''}`}
                                onClick={function () {
                                    if (numberOfKidsDisplay <= 8) {
                                        setNumberOfKidsDisplay(numberOfKidsDisplay + 1);
                                    }
                        }}/>
                    </div>
                </div>

                <div className="flex flex-row gap-2 justify-between items-center pb-4">
                    <div className="flex flex-col justify-center dark:text-[#9aa0a6] text-[#70757a]">
                        <label>Bebes</label>
                        <label className={'text-xs font-light'}>De 0 a 2 años</label>
                    </div>

                    <div className="flex flex-row gap-2 items-center">
                        <MinusCircleIcon className={`w-5 h-5 ${numberOfBabiesDisplay <= 0 ? 'text-gray-500' : ''}`}
                                 onClick={function () {
                                    if (numberOfBabiesDisplay >= 1) {
                                        setNumberOfBabiesDisplay(numberOfBabiesDisplay - 1);
                                    }
                        }}/>

                        <input
                            id="numberOfBabiesDisplay"
                            type="number"
                            className={`shadow-md rounded-sm ${inputsStyle} text-center min-w-0 max-w-7 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Bebes (0-2 años)"
                            readOnly={true}
                            min={0}
                            max={9}
                            value={numberOfBabiesDisplay}
                        />

                        <input
                            name="numberOfBabies"
                            id="numberOfBabies"
                            type="number"
                            className={`hidden shadow-md rounded-sm ${inputsStyle} text-center min-w-0 max-w-7 !border-0 dark:text-[#9aa0a6] text-[#70757a]`}
                            placeholder="Bebes (0-2 años)"
                            value={params.numberOfBabies}
                            min={0}
                            max={9}
                        />
                        <PlusCircleIcon className={`w-5 h-5 ${numberOfBabiesDisplay >= 9 ? 'text-gray-500' : ''}`}
                                onClick={function () {
                                    if (numberOfBabiesDisplay <= 8) {
                                        setNumberOfBabiesDisplay(numberOfBabiesDisplay + 1);
                                    }
                        }}/>
                    </div>
                </div>

                {(numberOfAdultsDisplay + numberOfKidsDisplay > 9) &&
                    <div className='flex flex-col gap-2 text-wrap'>
                        <span className="text-red-700 font-light">La suma de adultos y niños no puede ser mayor a 9</span>
                    </div>
                }

                {!(numberOfAdultsDisplay + numberOfKidsDisplay > 9) &&
                    <div className="flex flex-row gap-2 justify-around font-medium text-[#1a73e8] dark:text-[#8ab4f8]">
                        <button
                            className={`disabled:opacity-25 rounded-3xl px-6 h-8 hover:bg-[#1a73e8]/10`}
                            type={'button'}
                            onClick={function () {
                                close();
                            }}>
                            Cancelar
                        </button>
                        <button
                            className={`disabled:opacity-25 rounded-3xl px-6 h-8 hover:bg-[#1a73e8]/10`}
                            type={'button'}
                            disabled={numberOfAdultsDisplay + numberOfKidsDisplay > 9}
                            onClick={function () {
                                // const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                                //     window.HTMLInputElement.prototype,
                                //     'value').set;
                                // nativeInputValueSetter.call(numberOfAdultsInput, newNumberOfAdults);
                                // numberOfAdultsInput.dispatchEvent(new Event('input'));
                                if (numberOfAdultsDisplay + numberOfKidsDisplay <= 9) {
                                    params.numberOfAdults = numberOfAdultsDisplay;
                                    params.numberOfKids = numberOfKidsDisplay;
                                    params.numberOfBabies = numberOfBabiesDisplay;
                                    setters.setNumberOfAdultsParent(numberOfAdultsDisplay);
                                    setters.setNumberOfKidsParent(numberOfKidsDisplay);
                                    setters.setNumberOfBabiesParent(numberOfBabiesDisplay);
                                    requestAnimationFrame(() => {
                                        document.forms['search'].dispatchEvent(new Event("change"));
                                    });
                                    close();
                                }
                            }}>
                            Hecho
                        </button>
                    </div>
                }


            </div>
        </>
    );
}