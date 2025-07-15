import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./pages/**/*.{ts,tsx}",        // ← jeśli używasz pages/
        "./src/**/*.{ts,tsx}",          // ← jeśli masz inne katalogi
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-sans)', 'sans-serif'],
                heading: ['var(--font-heading)', 'sans-serif'],
            },
        },
    },
    plugins: [
    ],
};