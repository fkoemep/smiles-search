import { type Config } from "tailwindcss";

export default {
    content: [
        "{routes,islands,components,utils}/**/*.{ts,tsx,jsx,js}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            screens: {
                'portrait': { 'raw': '(orientation: portrait)' },
            }
        },
        fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            serif: ['Roboto', 'serif'],
        },
    },
} satisfies Config;
