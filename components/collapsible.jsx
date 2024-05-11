import { Disclosure, Transition } from "@headlessui/react";
import { ChevronDownIcon, ChevronUpIcon } from "icons";
import { disclosureButtonStyle, chevronIcons, disclosurePanel } from "utils/styles.js";

export default function Collapsible(
  { text, as, children, class: className, buttonClass, ...props },
) {
  return (
    <Disclosure as={as} {...props}>
      {({ open }) => (
        <>
          <Disclosure.Button as='div' class={`flex flex-row justify-between items-center rounded-lg p-2 text-left text-sm font-normal focus:outline-none focus-visible:ring focus-visible:ring-opacity-75 shadow-lg ring-1 ring-black ring-opacity-5 ${disclosureButtonStyle} shrink ${buttonClass ? buttonClass : ''}`}>
            <span class='min-w-0 whitespace-nowrap overflow-hidden text-ellipsis'>{text}</span>
            {open
              ? <ChevronUpIcon class={`h-5 w-5 flex shrink min-w-0 ${chevronIcons}`} />
              : <ChevronDownIcon class={`h-5 w-5 flex shrink min-w-0 ${chevronIcons}`} />}
          </Disclosure.Button>
          <Transition
            class={`flex flex-col items-center`}
            unmount={false}
            enter="transition ease-in-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in-out duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Disclosure.Panel
              unmount={false}
              class={`p-4 gap-4 mt-2 whitespace-nowrap flex flex-col shadow-lg ring-1 ring-black ring-opacity-5 rounded ${className} ${disclosurePanel}`}
            >
              {children}
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
}
