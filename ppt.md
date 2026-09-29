# Slide 1: IDEA TITLE
**POLARIS: Polar & Oceanographic Live Archive and Research Information System**

* **Proposed Solution (Idea/Prototype):** 
  POLARIS is a unified, real-time digital ecosystem designed to centralize fragmented polar research data, visualize live expedition telemetry, and bridge the gap between complex climate science and public awareness.
* **Detailed Explanation:** 
  The platform automates the aggregation of scientific publications, datasets, and media from massive global repositories (NASA, OpenAlex, Zenodo) into a single, searchable archive. It features a 3D WebGL interactive globe that tracks live research vessels and bases, a dedicated Researcher Workspace, and a Gamified Education hub for classrooms.
* **How It Addresses the Problem:** 
  Currently, critical climate and polar data is siloed across disparate academic databases, making it inaccessible to the public and cumbersome for researchers to cross-reference. POLARIS breaks down these silos, transforming raw data into accessible visual dashboards and interactive stories.
* **Innovation & Uniqueness:** 
  POLARIS uniquely integrates an **AI Content Studio** (powered by Google Gemini) that automatically translates dense, jargon-heavy scientific abstracts into engaging social media content. It pairs live weather telemetry with a high-resolution 3D WebGL globe to track expeditions. Furthermore, it introduces a **Citizen Science Portal** allowing the public to report ground-level climate observations directly into a secure **Admin Approval Workflow** for scientific review.

---

# Slide 2: TECHNICAL APPROACH
* **Technologies Used:**
  * **Frontend:** React (Vite), Tailwind CSS 4.0, Shadcn UI, Framer Motion (for fluid animations), Recharts (for data visualization).
  * **3D Visualization:** `react-globe.gl` and `three.js` for the interactive 3D WebGL globe.
  * **Backend & Database:** Node.js with Express; local SQLite database utilizing `better-sqlite3` and FTS5 (Full-Text Search) for blazing-fast local querying.
  * **External APIs:** Google Gemini SDK (Generative AI), Open-Meteo API (Live Weather Telemetry), NASA CMR, OpenAlex, Zenodo, Wikimedia.
* **Methodology & Process Flow:**
  1. **Automated Ingestion Pipeline:** A Node.js backend cron/manual job queries external scientific APIs, normalizes the data, and stores it in the local SQLite database.
  2. **Data Presentation layer:** The React frontend queries the local database to serve the "Explore Archive" via FTS5 lightning-fast search.
  3. **Live Telemetry & 3D Rendering:** The globe component fetches coordinates from the local DB, then asynchronously pings the Open-Meteo API to overlay live weather conditions on a high-resolution 3D Earth model.
  4. **AI Processing:** When researchers select an ingested publication, the backend sends the abstract to the Gemini model with a structured prompt, returning ready-to-post social media strings.
  5. **Unified Submission Workflow:** Citizen science observations from the Outreach portal and new dataset submissions from the Researcher Dashboard are sent via `FormData` to a central Node.js API, queuing them with a "pending" status for the Admin Portal.

---

# Slide 3: FEASIBILITY AND VIABILITY
* **Analysis of Feasibility:**
  The solution is highly feasible because it leverages well-documented, free, open-source APIs (NASA, OpenAlex, Zenodo, Open-Meteo). Using SQLite simplifies deployment and minimizes hosting costs while providing robust Full-Text Search capabilities. The prototype is fully functional as a lightweight Node/React stack.
* **Potential Challenges & Risks:**
  * **Data Normalization:** Different APIs (e.g., NASA vs. OpenAlex) return data in vastly different JSON structures.
  * **API Rate Limiting:** Fetching real-time weather and performing bulk ingestions can trigger rate limits from third-party providers.
  * **AI Hallucinations:** Generative AI might misinterpret complex scientific numbers when summarizing.
* **Strategies for Overcoming Challenges:**
  * Implement strict data-mapping interfaces in the backend to normalize all incoming JSON into a unified schema before inserting it into SQLite.
  * Implement caching for the Open-Meteo API data (e.g., refreshing every 30 mins) and use batch-processing with delays for ingestion runs to respect API limits.
  * Use highly constrained "System Prompts" for Gemini, instructing it to *only* use the provided abstract context and never invent numbers, ensuring high factual accuracy.

---

# Slide 4: IMPACT AND BENEFITS
* **Potential Impact on Target Audience:**
  * **Scientists/Researchers:** Drastically reduces the time spent tracking down datasets across multiple archives and simplifies science communication to the public via the AI Studio.
  * **Students & Educators:** The Gamified "Student Passport" and live expedition tracking turn abstract climate science into highly engaging, interactive classroom experiences.
* **Benefits of the Solution:**
  * **Social/Educational:** Democratizes access to frontier science. By making polar research visually appealing and allowing direct participation through the Citizen Science Portal, it fosters a scientifically literate and engaged society.
  * **Environmental:** Increases global awareness of the rapidly changing polar cryosphere (e.g., sea ice extent drop), which is critical for driving climate action and policy.
  * **Economic:** By open-sourcing the data aggregation and providing free educational tools, it lowers the financial barrier for institutions and schools to access premium environmental data.

---

# Slide 5: RESEARCH AND REFERENCES
* **APIs & Data Sources:**
  * Open-Meteo (Live Telemetry): [https://open-meteo.com/](https://open-meteo.com/)
  * NASA Common Metadata Repository (CMR): [https://cmr.earthdata.nasa.gov/](https://cmr.earthdata.nasa.gov/)
  * OpenAlex (Open scientific catalog): [https://openalex.org/](https://openalex.org/)
  * Zenodo (OpenAIRE datasets): [https://zenodo.org/](https://zenodo.org/)
* **Technology References:**
  * React Globe GL: [https://globe.gl/](https://globe.gl/)
  * Google Gemini AI SDK: [https://ai.google.dev/](https://ai.google.dev/)
  * SQLite FTS5 (Full-Text Search): [https://www.sqlite.org/fts5.html](https://www.sqlite.org/fts5.html)
