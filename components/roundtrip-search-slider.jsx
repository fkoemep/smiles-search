import {Slider as BaseSlider} from '@mui/base';
import { useState } from 'preact/hooks';
import {formatDateWithTimezone, maxDate, minDate} from "../utils/dates.js";
const SliderProps = BaseSlider.SliderProps;
import clsx from 'clsx';
import { forwardRef } from 'preact/compat';
import PropTypes from 'prop-types';

function valuetext(value) {
    return `${value} dias`;
}

function SliderValueLabel({ children }) {
    return <span className="valueLabel relative -top-8 self-center text-center text-xs font-semibold">{children}</span>;
}

const resolveSlotProps = (fn, args) => (typeof fn === 'function' ? fn(args) : fn);


export default function RoundtripSearchSlider() {

    return (
            <Slider/>
    );
}

    const Slider = forwardRef((props, ref) => {
        const [value, setValue] = useState([2, 3]);

        const handleChange = (event, newValue) => {
            setValue(newValue);
        };

        const maxValue = 30;
        const minValue = 2;
        const mark = [
            {
                value: 7,
                label: value[0] === value[1] ? `Duración del viaje: ${value[0]} días` : `Duración del viaje: entre ${value[0]} y ${value[1]} días`,
            },
        ]

        return (
            <>
                <BaseSlider
                    ref={ref}
                    value={value}
                    onChange={handleChange}
                    getAriaLabel={() => 'Temperature range'}
                    getAriaValueText={valuetext}
                    slots={{valueLabel: SliderValueLabel}}
                    marks={mark}
                    step={1}
                    disableSwap={true}
                    shiftStep={5}
                    min={minValue}
                    max={maxValue}
                    {...props}
                    slotProps={{
                        ...props.slotProps,
                        root: (ownerState) => {
                            const resolvedSlotProps = resolveSlotProps(
                                props.slotProps?.root,
                                ownerState,
                            );
                            return {
                                ...resolvedSlotProps,
                                className: clsx(
                                    `h-1.5 w-1/2 py-8 inline-flex items-center relative touch-none ${
                                        ownerState.disabled
                                            ? 'opacity-50 cursor-default pointer-events-none text-slate-300 dark:text-slate-600'
                                            : 'hover:opacity-100 cursor-pointer text-blue-600 dark:text-[#1B73E9]'
                                    }`,
                                    resolvedSlotProps?.className,
                                ),
                            };
                        },
                        rail: (ownerState) => {
                            const resolvedSlotProps = resolveSlotProps(
                                props.slotProps?.rail,
                                ownerState,
                            );
                            return {
                                ...resolvedSlotProps,
                                className: clsx(
                                    'block absolute w-full h-[4px] rounded-full bg-current opacity-40',
                                    resolvedSlotProps?.className,
                                ),
                            };
                        },
                        track: (ownerState) => {
                            const resolvedSlotProps = resolveSlotProps(
                                props.slotProps?.track,
                                ownerState,
                            );

                            return {
                                ...resolvedSlotProps,
                                className: clsx(
                                    'block absolute h-[4px] rounded-full bg-current',
                                    resolvedSlotProps?.className,
                                ),
                            };
                        },
                        thumb: (ownerState, { active, focused }) => {
                            const resolvedSlotProps = resolveSlotProps(
                                props.slotProps?.thumb,
                                ownerState,
                            );
                            return {
                                ...resolvedSlotProps,
                                className: clsx(
                                    `flex items-center justify-center absolute w-[20px] h-[20px] -ml-1.5 box-border rounded-full outline-0 bg-current hover:shadow-outline-blue transition ${
                                        focused || active
                                            ? 'shadow-[0_0_0_8px_rgba(144,202,249,0.5)] dark:shadow-[0_0_0_4px_rgba(144,202,249,0.5)] active:shadow-[0_0_0_4px_rgba(144,202,249,0.5)] dark:active:shadow-[0_0_0_4px_rgba(144,202,249,0.5)] scale-[1.2] outline-none'
                                            : ''
                                    }`,
                                    resolvedSlotProps?.className,
                                ),
                            };
                        },
                        markLabel: (ownerState) => {
                            const resolvedSlotProps = resolveSlotProps(
                                props.slotProps?.markLabel,
                                ownerState,
                            );

                            return {
                                ...resolvedSlotProps,
                                className: clsx(
                                    'flex justify-center w-full relative top-6 cursor-default pointer-events-none min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-black dark:text-white !left-0',
                                    resolvedSlotProps?.className,
                                ),
                            };
                        },
                    }}
                />

                <input
                    name="rangeLowestValue"
                    id="rangeLowestValue"
                    required
                    type="number"
                    className={`hidden`}
                    value={value[0]}
                    min={2}
                    max={30}
                    onChange={function (ev) {
                        let rangeHighestValue = document.getElementById("rangeHighestValue");
                        if (Boolean(rangeHighestValue) && Number(ev.target.value) > Number(rangeHighestValue.value)) {
                            ev.target.setCustomValidity('Debe ser menor que la duracion maxima');
                        } else {
                            ev.target.setCustomValidity('');
                            rangeHighestValue.setCustomValidity('');
                        }
                        ev.target.reportValidity();
                    }}

                />
                <input
                    name="rangeHighestValue"
                    id="rangeHighestValue"
                    required
                    type="number"
                    className={`hidden`}
                    value={value[1]}
                    min={2}
                    max={30}
                    onChange={function (ev) {
                        let rangeLowestValue = document.getElementById("rangeLowestValue");
                        if (Number(ev.target.value) < Number(rangeLowestValue.value)) {
                            ev.target.setCustomValidity('Debe ser mayor que la duracion minima');
                        } else {
                            ev.target.setCustomValidity('');
                            rangeLowestValue.setCustomValidity('');
                        }
                        ev.target.reportValidity();
                    }}
                />

            </>
        );
    });

    Slider.propTypes = {
        /**
         * The props used for each slot inside the Slider.
         * @default {}
         */
        slotProps: PropTypes.shape({
            input: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            mark: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            markLabel: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            rail: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            root: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            thumb: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            track: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
            valueLabel: PropTypes.oneOfType([PropTypes.any, PropTypes.func]),
        }),
    };

