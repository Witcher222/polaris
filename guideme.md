# 🧊 POLARIS: Complete User Guide & Walkthrough

Welcome to **POLARIS** (Polar & Oceanographic Live Archive and Research Information System). This prototype is a next-generation platform designed to unify polar research, visualize real-time expedition data, and bridge the gap between complex science and public education.

Here is a complete, step-by-step walkthrough of every page in the application, what you can click, and exactly what you will experience.

---

## 1. 🏠 The Homepage (`/`)
**What it is:** The grand entrance to the POLARIS ecosystem.
**What to do:** 
- Scroll down to see the beautifully designed, modern interface featuring glassmorphism and subtle micro-animations. 
- You will see quick links routing you to the main pillars of the platform: The Global Archive, The Interactive Globe, and the Researcher Workspace.

## 2. 🌍 The 3D Polar Atlas (`/polar-map`)
**What it is:** A stunning, fully interactive 3D WebGL globe mapping permanent research bases and live expeditions.
**What to do:**
- **Spin the Globe:** Click and drag the Earth to spin it around. 
- **View Active Locations:** Look at the sidebar to see a list of 17 Active Locations. This includes real permanent bases (like Maitri Station and McMurdo) and active expeditions (like the Endurance22 and MOSAiC).
- **Cinematic Zoom:** Click on *any* location in the sidebar list (or click the glowing marker directly on the globe). The camera will dynamically swoop in and zoom **extremely close** to the exact coordinates on the Earth's surface.
- **Live Telemetry:** Once zoomed in, a dashboard will appear on the right side of the screen. This is pulling **100% real, live weather data** (temperature, wind speed, surface pressure) for those exact coordinates using the Open-Meteo API.

## 3. 📚 The Explore Archive (`/explore`)
**What it is:** The central repository for all data ingested into POLARIS (documents, datasets, media).
**What to do:**
- **Browse Categories:** Click on the filter chips at the top (e.g., "Antarctica", "Glaciology", "Remote Sensing") to filter the massive archive. 
- **View Real Data:** Every item you see here is real scientific data that was pulled into your local SQLite database from external sources like NASA CMR, Zenodo, OpenAlex, and Wikimedia Commons.
- **Interact:** Click on any document or dataset card to open a detailed modal showing the full abstract, source citations, authors, and external links.

## 4. 🎓 Outreach & Education (`/outreach`)
**What it is:** A gamified educational hub designed for students, classrooms, and the general public.
**What to do:**
- **Read Polar Stories:** Browse high-quality editorial articles summarizing complex research. Click "Read Full Story" to open a beautiful, immersive reading modal.
- **Student Passport:** Notice the "Student Passport" widget at the top. This tracks your achievements using local storage!
- **Take the Quiz:** Click the "Take a Quiz" button. Answer the interactive questions. If you get a perfect score, you will instantly earn the **"Glaciology Expert"** badge, which will permanently light up in your Passport!
- **Join an Expedition:** Click "Join 'Follow an Expedition'". Register your classroom, and you will instantly earn the **"Expedition Tracker"** badge.

## 5. 🔬 Researcher Workspace (`/dashboard`)
**What it is:** The personalized dashboard for scientists (currently logged in as "Dr. Scientist").
**What to do:**
- **Track Activity:** View the tabs for "Overview", "My Research", "Datasets", and "Expeditions" to see the researcher's published work and ongoing drafts.
- **Data Visualization:** Scroll down in the Overview tab to see the **Key Metrics** section. Here, you will find a beautiful, interactive Recharts Area Chart displaying the historical trend of the "Antarctic Winter Sea Ice Extent". Hover over the graph to see dynamic tooltips!
- **Quick Actions:** Click the buttons on the right to simulate uploading new NetCDF/CSV datasets or linking new expeditions.

## 6. 🤖 AI Content Studio (`/studio`)
**What it is:** A powerful internal tool helping scientists easily communicate their dense academic research to the public.
**What to do:**
- **Select Source Material:** In the left sidebar, click on any of the real research documents (these are pulled directly from your database).
- **Generate:** Click the **"Generate Social Content"** button.
- **Watch the AI Work:** The app will contact your backend, which utilizes the **Google Gemini SDK**. Gemini will read the complex abstract of the selected document and automatically generate a custom, easy-to-understand **Twitter Thread, Instagram Caption, and LinkedIn Post**, complete with emojis and hashtags!

## 7. ⚙️ Admin System (`/admin`)
**What it is:** The hidden backend control center for the platform administrators.
**What to do:**
- **System Health:** View the live status of the database and API connections.
- **Data Ingestion:** Scroll down to the "Data Ingestion Pipeline". Click the **"Run Full Ingestion"** button.
- **Live Logs:** Watch the terminal box below the button. It will stream real-time logs as the backend reaches out to NASA, Zenodo, Wikimedia, and OpenAlex, fetches new scientific data, and injects it into your local database!

---
*End of Walkthrough. Enjoy exploring POLARIS!*
