/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#0a0a0a",
        "paper-2": "#161616",
        "paper-3": "#1f1f1f",
        ink: "#f5f5f5",
        "ink-2": "#a3a3a3",
        amber: "#fbbf24",
        coral: "#f87171",
        forest: "#4ade80",
        electric: "#60a5fa",
      },
      fontFamily: {
        display: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        body: ['"Inter Tight"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
