import { useRef } from "preact/hooks";
import { Fragment } from "preact";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "icons";
import {
    checkStyle,
    chevronIcons,
    disclosureButtonStyle,
    disclosurePanel,
    dropdownStyle,
    spanBgStyle
} from "../utils/styles.js";

function Dropdown(props) {
    const ref = useRef();
      return (
        <Listbox
          as="div"
          ref={ref}
          onChange={(value) => {
            if(props.setter){
                props.setter(value);
            }
            const event = new Event("change");
            requestAnimationFrame(() => {
                ref.current.closest("form").dispatchEvent(event);
                document.forms['search'].dispatchEvent(new Event("change"));
            });
          }}
          class={`flex flex-col shrink min-w-0 ${dropdownStyle} ${props.customClass ?? '' }`}
          {...props}
        />
      );
}

Dropdown.Button = function DropdownButton({ children, class: className, customIcon, ...props }) {
  return (
        <ListboxButton as='button'
            class={`flex flex-row relative justify-between items-center rounded-lg p-2 text-left text-sm font-normal focus:outline-none focus-visible:ring focus-visible:ring-opacity-75 ring-black ring-opacity-5 ${disclosureButtonStyle} ${className ? className : ''} !bg-transparent shrink min-w-0`} {...props}>
                {(childrenProps) => (
                  <>
                    {customIcon && customIcon}
                    <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>
                        {typeof children === "function" ? children(childrenProps) : children}
                    </span>
                      {childrenProps.open
                        ? <ChevronUpIcon class={`h-5 w-5 ${chevronIcons} flex shrink min-w-0`} />
                        : <ChevronDownIcon class={`h-5 w-5 ${chevronIcons} flex shrink min-w-0`} />}
                  </>
                )}
        </ListboxButton>
);
};

Dropdown.Options = function DropdownOptions({class: className, children, position}) {
  return (
    // <Transition
    //     class={`flex flex flex-col ${position ? 'items-' + position : ''}`}
    //     unmount={false}
    //     enter="transition ease-in-out duration-150"
    //     enterFrom="opacity-0 relative z-10"
    //     enterTo="opacity-100 relative z-10"
    //     leave="transition ease-in-out duration-150"
    //     leaveFrom="opacity-100 relative z-10"
    //     leaveTo="opacity-0 relative z-10"
    // >
      <ListboxOptions unmount={true} as='div' transition
                      class={`flex flex flex-col ${position ? 'items-' + position : ''} transition ease-in-out duration-150 data-[closed]:opacity-0 data-[closed]:relative z-10 data-[enter]:data-[closed]:opacity-100 relative z-10 data-[leave]:opacity-100 data-[leave]:relative z-10 data-[leave]:data-[closed]:opacity-0`}
        // class={`absolute flex flex-col whitespace-nowrap mt-1 rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm ${spanBgStyle}`}
      >
          {({ open }) => (
                <ul class={`py-1 mt-1 whitespace-nowrap absolute max-h-60 overflow-y-auto overflow-x-hidden flex flex-col rounded text-base shadow-lg ring-1 sm:text-sm ring-black ring-opacity-5 ${disclosurePanel} ${className ? className : ''}`} >
                    {children}
                </ul>
          )}
      </ListboxOptions>
    // </Transition>
  );
};

Dropdown.Option = function DropdownOption(
  { children, class: className = "", ...props },
) {
  return (
    <ListboxOption as='div' {...props}>
        {({ active, selected, childrenProps }) => (
            <li className={`${className} cursor-pointer flex flex-row items-center justify-start p-2 relative cursor-default select-none gap-2 ui-active:text-blue-900 ui-not-active:text-gray-900 ${selected && 'bg-[#8ba7d9] dark:bg-[#43516B]'} ${active && !selected && 'bg-[#48494D] dark:bg-[#48494D]'} ${props.customClass ?? ''}`}>
                <span class={`${checkStyle}`}>
                   <CheckIcon class={`h-5 w-5 ${selected ? "visible" : "invisible"}`} aria-hidden="true" />
               </span>
             <div>
               {typeof children === "function" ? children(childrenProps) : children}
             </div>
           </li>
       )}
    </ListboxOption>
  );
};

export default Dropdown;
