import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                },
                secondary: {
                    DEFAULT: '#8b5cf6',
                },
                accent: '#ec4899',
                background: '#0a0a0a',
                surface: {
                    DEFAULT: '#1a1a1a',
                    hover: '#252525',
                },
                border: '#2a2a2a',
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1aa',
                    muted: '#71717a',
                },
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
};

export default config;
