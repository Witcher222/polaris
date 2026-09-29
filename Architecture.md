# POLARIS: Project Architecture & Technical Documentation

**POLARIS (Polar & Oceanographic Live Archive and Research Information System)** is a comprehensive, full-stack web application designed to centralize fragmented polar research, visualize real-time expedition data, and utilize artificial intelligence to bridge the gap between complex climate science and public awareness.

This document outlines the complete technical architecture, methodology, tech stack, and feature implementations of the project.

---

## 1. Technology Stack

POLARIS utilizes a modern, JavaScript-based "monorepo" style stack, running a React frontend and a Node.js backend simultaneously, backed by a high-performance local database.

### Frontend (Client-Side)
* **Framework:** React 18, bootstrapped with Vite for extremely fast HMR (Hot Module Replacement) and optimized builds.
* **Routing:** `@tanstack/react-router` for type-safe, file-based routing.
* **Styling:** Tailwind CSS 4.0 (for utility-first, responsive design) paired with `shadcn/ui` (for accessible, customizable base components like Buttons and Modals).
* **Animations:** `framer-motion` for fluid page transitions, micro-interactions, and modal popups.
* **3D Visualization:** `react-globe.gl` (built on top of `three.js`) for rendering the interactive 3D WebGL Earth.
* **Data Visualization:** `recharts` for rendering dynamic SVG charts (e.g., Ice Extent line graphs).
* **Icons:** `lucide-react` for clean, consistent SVG iconography.

### Backend (Server-Side)
* **Runtime:** Node.js.
* **Framework:** Express.js for handling REST API requests and routing.
* **Generative AI:** `@google/genai` (Google Gemini SDK) for natural language processing and content generation.
* **Proxying:** Vite's internal proxy routes `/api/*` requests directly to the Express server running on port 5000, eliminating CORS issues during development.

### Database
* **Engine:** SQLite3, interfaced via the `better-sqlite3` synchronous library for maximum raw performance.
* **Search Integration:** SQLite **FTS5** (Full-Text Search). A virtual table (`items_fts`) is synced with the main `items` table via database triggers, allowing blazing-fast, relevance-ranked searches across thousands of scientific abstracts and titles.

### External APIs
* **Open-Meteo API:** Used for fetching real-time, zero-authentication weather telemetry (temperature, wind, pressure) based on latitude/longitude.
* **Scientific Archives:** NASA CMR (Earthdata), OpenAlex, Zenodo, and Wikimedia Commons APIs are used to programmatically harvest open-source polar research.

---

## 2. Core Features & Functionality

### A. The 3D Polar Atlas & Live Telemetry (`/polar-map`)
* **Functionality:** Renders a high-fidelity 3D globe. The user can view permanent research bases and active expedition vessels. Clicking a pin smoothly transitions the WebGL camera to hover directly over the coordinates.
* **Architecture:** The React component maintains the globe state. When a pin is selected, it triggers a fetch request to the backend (`/api/map/stations`). The backend dynamically queries the Open-Meteo API using the pin's stored `lat`/`lon` and returns live weather data, which is then rendered in a floating dashboard on the UI.

### B. Global Archive & FTS5 Search (`/explore`)
* **Functionality:** A powerful search engine allowing users to filter by Region (Arctic, Antarctica, Himalaya) or Discipline (Glaciology, Oceanography, etc.).
* **Architecture:** When a user types a query, the frontend hits `/api/items?q=term`. The backend utilizes the `MATCH` operator against the `items_fts` SQLite virtual table. This returns sub-millisecond search results even as the dataset grows to thousands of records.

### C. AI Content Studio (`/studio`)
* **Functionality:** Scientists can select a complex research paper and automatically generate engaging social media posts (Twitter, Instagram, LinkedIn).
* **Architecture:** The frontend passes the document ID to the backend (`/api/studio/generate`). The backend retrieves the document's abstract from SQLite and injects it into a highly constrained prompt ("You are a science communicator... do not invent facts"). This prompt is sent to the **Google Gemini AI model**, which returns formatted strings that are saved as Drafts in the database and sent back to the frontend.

### D. Gamified Outreach & Education (`/outreach`)
* **Functionality:** An educational hub featuring "Polar Stories" and interactive modules for students. Features a "Student Passport" that saves digital badges.
* **Architecture:** Badges are managed via the browser's `localStorage` API, ensuring progress persists across sessions. When a user completes the interactive quiz with a perfect score or clicks to register a classroom for an expedition, React state updates the Passport UI and writes the new badge array to local storage.

### E. Researcher Workspace & Dashboard (`/dashboard`)
* **Functionality:** A personalized hub tracking a researcher's drafts, published datasets, and linked expeditions. Includes data visualization.
* **Architecture:** Utilizes `Recharts` to draw an `<AreaChart>` mapping historical "Antarctic Winter Sea Ice Extent". Suspense and lazy loading (`lazy(() => import(...))`) are used to ensure the heavy charting library doesn't block the initial page render.

### F. Automated Data Ingestion Pipeline (`/admin` and `server/ingest/`)
* **Functionality:** A backend chron-like system that reaches out to external APIs, normalizes the data, and saves it locally.
* **Architecture:** The `server/ingest/` directory contains modular scripts (e.g., `nasaImages.js`, `openAlex.js`). Each script fetches raw JSON from its respective source, maps the wildly different schemas into a standard POLARIS object (title, abstract, region, discipline), and executes an `UPSERT` (Insert or Update on conflict) into the SQLite database. The Admin UI allows triggering this pipeline manually and monitors the `ingest_runs` table for real-time status.

---

## 3. Methodology & System Data Flow

The project follows a standard Client-Server REST architecture, highly optimized for local development and rapid prototyping:

1. **Initialization:** When the backend starts (`npm run server` or via `concurrently`), `db.js` verifies the SQLite database. If the tables don't exist, it executes `schema.sql` to build the relational tables, the FTS5 virtual table, and the automatic synchronization triggers.
2. **Data Hydration:** The administrator clicks "Run Full Ingestion" on the Admin page. The backend spawns the ingestion scripts, filling the database with real-world scientific data.
3. **Client Interaction:** The user navigates to `http://localhost:5173`. Vite serves the React application. React Router matches the URL to a specific Route component.
4. **Data Fetching:** The Route component (e.g., `explore.tsx`) uses `useEffect` and the centralized `src/lib/api.ts` fetch wrapper to request data from the Express backend.
5. **Rendering:** The data is stored in React `useState`, triggering a re-render. `framer-motion` animates the incoming DOM nodes (like cards or modals) into view.

---

## 4. File Structure Overview

```text
/
├── server/                 # Express Backend
│   ├── config/             # Environment variables (Port, Gemini API Key)
│   ├── db/                 # SQLite setup, schema, and connection
│   ├── ingest/             # Modular data harvesting scripts (NASA, Zenodo, etc.)
│   ├── middleware/         # Express middleware (Auth mocks, error handling)
│   ├── routes/             # API endpoints (items, map, stats, studio)
│   └── index.js            # Express server entry point
├── src/                    # React Frontend
│   ├── components/         # Reusable UI components (Globe, Charts, Modals)
│   ├── lib/                # Utilities and API fetch wrappers
│   ├── routes/             # Page views mapped by React Router
│   ├── index.css           # Tailwind base styles and CSS variables
│   └── main.tsx            # React application entry point
├── package.json            # Project dependencies and concurrent run scripts
└── vite.config.ts          # Vite bundler and proxy configuration
```

## 5. Security & Constraints

* **Rate Limiting:** The backend ingestion scripts include artificial delays (`setTimeout`) between API calls to prevent IP blocking from NASA and Open-Meteo.
* **Database Safety:** All SQLite queries use Parameterized Statements (`db.prepare('...').run(var)`) to strictly prevent SQL Injection attacks.
* **API Key Protection:** The Gemini API Key is loaded via `.env` (handled by `dotenv`) and is strictly confined to the Node.js backend. The React frontend never exposes the key to the client's browser.
