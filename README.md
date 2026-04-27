# Project Blueprint: "npm trends" Clone

This is a project to analyze the trends of NPM packages. It uses the NPM registry API to fetch the data and then visualizes it using Recharts.

## Todos

- [ ] Find a new name for the project

## 1. Tech Stack & Deployment

- **Core:** Vite + React + TypeScript + Tailwind CSS.
- **UI Components:** **shadcn/ui** (Radix UI primitives + Tailwind).
- **Deployment:** Configured for static export to GitHub Pages.
- **Routing/State:** Native `URLSearchParams` to sync selected packages to the URL (e.g., `?packages=react,vue`) allowing users to bookmark and share comparisons.

## 2. UI Layout & Theming

- **Theming:** Full Light/Dark mode support using `next-themes` (standard shadcn setup), defaulting to the OS system preference, with a Sun/Moon toggle button in the header.
- **Header:** A placeholder for your future logo on the left, the title "npm trends", and the theme toggle on the right.
- **Dynamic Subtitle:**
  - _Empty State:_ "compare package download counts over time"
  - _With Packages:_ "react vs vue vs svelte" (chains up to a maximum of 5 packages).
- **Color Palette:** A custom Tailwind palette using 5 distinct pastel colors (Blue, Red, Green, Yellow, Purple) defined as CSS variables so they look great in both light and dark modes.

## 3. Search & Autocomplete Flow

- **Input:** A centered search bar using shadcn components (like `Input` or `Command`), with the placeholder "Enter an npm package ...".
- **Suggestions:** Typing triggers a debounced call to `https://registry.npmjs.org/-/v1/search`. A dropdown will display matching packages.
- **Adding Packages:** The user can click a dropdown suggestion, or simply hit "Enter" to add exactly what they typed.
- **Chips:** Selected packages appear as colored pastel chips (shadcn `Badge` with an 'X' icon) below the search bar.

## 4. Graphing & Data Fetching

- **Charting:** **shadcn/ui Charts** (which uses `recharts` under the hood) for a highly polished, theme-aware time-series graph.
- **Mechanism:** Standard `fetch` + `useEffect` to grab data from `https://api.npmjs.org/downloads/range/last-year/{package}` whenever the URL parameters change.
- **Time Range:** Hardcoded to `last-year`.
- **Empty State:** The graph area remains completely hidden until the first package is successfully added.
- **Error Handling:** If an API call fails (e.g., rate limit) or the package doesn't exist, the chip is still added to the UI, but no line will render on the graph. The user resolves this by manually clicking the 'X' on the badge.
