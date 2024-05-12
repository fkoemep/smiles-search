import CustomPopover from "./custom-popover.jsx";
import { Popover } from "@headlessui/react";
import { Cog6ToothIcon, SunIcon, MoonIcon  } from "icons";

const switchTheme = ({signal, theme}) => {
    let htmlClasses = document
        .querySelector('html')
        .classList;
    if (theme === 'dark') {
        if(!signal) {
            localStorage.setItem('theme', JSON.stringify('dark'));
        }
        htmlClasses.add('dark');
        htmlClasses.remove('light');
    } else if (theme === 'light') {
        if(!signal) {
            localStorage.setItem('theme', JSON.stringify('light'));
        }
        htmlClasses.add('light');
        htmlClasses.remove('dark');
    } else if (theme === 'systemDark') {
        if(!signal) {
            localStorage.setItem('theme', JSON.stringify('system'));
        }
        htmlClasses.add('dark');
        htmlClasses.remove('light');
    } else {
        if(!signal) {
            localStorage.setItem('theme', JSON.stringify('system'));
        }
        htmlClasses.add('light');
        htmlClasses.remove('dark');
    }
};

globalThis.addEventListener("DOMContentLoaded", () => {
    window
        .matchMedia('(prefers-color-scheme: dark)')
        .addListener((e) => {
            console.log('called dark');
            if (e.matches && (!localStorage.getItem('theme') || JSON.parse(localStorage.getItem('theme')) === 'system')) {
                switchTheme({theme: 'systemDark'});
            }
        });

    window
        .matchMedia('(prefers-color-scheme: light)')
        .addListener((e) => {
            console.log('called light');
            if (e.matches && (!localStorage.getItem('theme') || JSON.parse(localStorage.getItem('theme')) === 'system')) {
                switchTheme({theme: 'systemLight'});
            }
        });

    if (JSON.parse(localStorage.getItem('theme')) === 'dark') {
        switchTheme({theme: 'dark'});
    } else if (JSON.parse(localStorage.getItem('theme')) === 'light') {
        switchTheme({theme: 'light'});
    } else {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            switchTheme({theme: 'systemDark'});
        } else {
            switchTheme({theme: 'systemLight'});
        }
    }

    // const dark = document.getElementById('dark');
    // const light = document.getElementById('light');
    // const system = document.getElementById('system');

    // dark.addEventListener('click', () => {
    //     switchTheme('dark');
    // });
    //
    // light.addEventListener('click', () => {
    //     switchTheme('light');
    // });
    //
    // system.addEventListener('click', () => {
    //     localStorage.setItem('theme', 'system');
    //     if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //         switchTheme('systemDark');
    //     } else {
    //         switchTheme('systemLight');
    //     }
    // });
});


function DarkToggle({onlyDisplay, signal}){
    return (
        <button

            {...(signal.value === 'dark' && !onlyDisplay && {className: 'text-white bg-blue-700 hover:bg-blue-900 hover:text-white rounded-lg p-3', id: 'dark'})}
            {...(signal.value === 'dark' && onlyDisplay && {className: 'text-blue-600 rounded-lg pr-1 flex shrink min-w-0'})}
            {...(signal.value !== 'dark' && !onlyDisplay && {className: 'text-blue-600 hover:bg-blue-900 hover:text-white rounded-lg p-3', id: 'dark'})}
            {...(!onlyDisplay && {onClick: function () {
                switchTheme({signal: signal, theme:'dark'});
                signal.value = 'dark';
            }})}

        >
            <MoonIcon class={`h-5 w-5 flex shrink min-w-0`}/>
        </button>
    );
}

function LightToggle({onlyDisplay, signal}) {
    return (
        <button

            {...(signal.value === 'light' && !onlyDisplay && {className: 'text-yellow-500 bg-yellow-100 hover:bg-yellow-500 hover:text-white rounded-lg p-3', id: 'light'})}
            {...(signal.value === 'light' && onlyDisplay && {className: 'text-yellow-500 rounded-lg pr-1 flex shrink min-w-0'})}
            {...(signal.value !== 'light' && !onlyDisplay && {className: 'text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-lg p-3', id: 'light'})}
            {...(!onlyDisplay && {onClick: function () {
                switchTheme({signal: signal, theme:'light'});
                signal.value = 'light';
            }})}

        >
            <SunIcon class={`h-5 w-5 flex shrink min-w-0`}/>
        </button>
    );
}

function SystemToggle({onlyDisplay, signal}) {
    return (
        <button
            {...((!signal.value || signal.value === 'system') && !onlyDisplay && {className: 'rounded-lg bg-gray-400 hover:bg-gray-700 p-3', id: 'system'})}
            {...((!signal.value || signal.value === 'system') && onlyDisplay && {className: 'rounded-lg pr-1 flex shrink min-w-0'})}
            {...(!(!signal.value || signal.value === 'system') && !onlyDisplay && {className: 'rounded-lg hover:bg-gray-700 p-3', id: 'system'})}
            {...(!onlyDisplay && {onClick: function () {
                        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            switchTheme({signal: signal, theme:'systemDark'});
                        } else {
                            switchTheme({signal: signal, theme:'systemLight'});
                        }
                        signal.value = 'system';
                    } })}


            aria-label="Toggle Light/Dark Mode - System Setting"
        >
            <Cog6ToothIcon class={`h-5 w-5 flex shrink min-w-0`}/>
        </button>
    );
}

export default function DarkModeToggle({signal}) {
    return (
        <CustomPopover customIcon={<ThemeIcon signal={signal}/>} class="!p-2">
            {/*Popover buttons help ensure that whenever the button is clicked, the popover closes automatically*/}
            <Popover.Button as={'div'} class='flex shrink min-w-0'>
                <LightToggle signal={signal}/>
            </Popover.Button>
            <Popover.Button as={'div'} class='flex shrink min-w-0'>
                <DarkToggle signal={signal}/>
            </Popover.Button>
            <Popover.Button as={'div'} class='flex shrink min-w-0'>
                <SystemToggle signal={signal}/>
            </Popover.Button>
        </CustomPopover>
    );
}

export function ThemeIcon({signal}) {
    return (
    <>
        {signal.value === 'dark' &&  <DarkToggle onlyDisplay={true} signal={signal}/>}
        {signal.value === 'light' &&  <LightToggle onlyDisplay={true} signal={signal}/>}
        {signal.value === 'system' &&  <SystemToggle onlyDisplay={true} signal={signal}/>}
    </>
    );
}

