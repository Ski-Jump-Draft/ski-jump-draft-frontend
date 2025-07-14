// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./pages/**/*.{ts,tsx}", // jeśli używasz /pages
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config
