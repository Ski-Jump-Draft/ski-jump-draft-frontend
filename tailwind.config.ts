import type { Config } from "tailwindcss";

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
            animation: {
                'fall': 'fall 8s linear infinite',
            },
            keyframes: {
                fall: {
                    '0%': { transform: 'translateY(-100vh)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
            },
        },
    },
    plugins: [
    ],
};