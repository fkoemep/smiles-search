import { Popover, PopoverButton, PopoverPanel, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "icons";
import {disclosurePanel, spanBgStyle, dropdownStyle, chevronIcons, disclosureButtonStyle} from "utils/styles.js";

export default function CustomPopover(
    { text, as, children, customIcon, position, class: className, buttonclass, ...props },
) {
    return (
      <Popover as={as} {...props} class={`${dropdownStyle} flex flex-col relative shrink min-w-0`} >
          {({ open, close }) => (
              <>
                  <PopoverButton as={'div'}
                      class={`flex flex-row relative justify-between items-center rounded-lg p-2 text-left text-sm font-normal focus:outline-none focus-visible:ring focus-visible:ring-opacity-75 ring-black ring-opacity-5 ${disclosureButtonStyle} ${buttonclass ? buttonclass : ''} !bg-transparent shrink`}>
                      {customIcon && customIcon}
                      {text && <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{text}</span>}
                      {open
                          ? <ChevronUpIcon class={`h-5 w-5 flex shrink min-w-0`}/>
                          : <ChevronDownIcon class={`h-5 w-5 flex shrink min-w-0`}/>}

                  </PopoverButton>
                  <div class={`flex flex-col ${position ? 'items-' + position : ''}`}>
                      <PopoverPanel
                        unmount={false}
                        transition
                        class={`p-4 gap-4 mt-2 whitespace-nowrap absolute flex flex-col items-center rounded shadow-lg ring-1 ring-black ring-opacity-5 ${disclosurePanel} ${className} transition ease-in-out duration-150 data-[closed]:opacity-0 data-[enter]:data-[closed]:opacity-100 data-[leave]:opacity-100 data-[leave]:data-[closed]:opacity-0`}
                      >
                        {children}
                        {/*  {toChildArray(children).map(child => cloneElement(child, { close: close }))}*/}
                      </PopoverPanel>
                  </div>
              </>
          )}
      </Popover>
  );
}
