export type ResourceKind = "Expedition" | "Dataset" | "Publication" | "Media" | "Station" | "Story";

export const topics = ["Antarctica", "Arctic", "Glaciology", "Oceanography", "Atmosphere", "Marine Biology", "Geology", "Remote Sensing", "Wildlife", "Ecosystems"];

export const stats = [
  ["248", "Expeditions"], ["1.2k", "Research resources"], ["940", "Publications"], ["560", "Datasets"], ["3.4k", "Media assets"],
] as const;

export const pulse = [
  { kind: "DISCOVERY", tone: "teal", text: "New sub-ice lake mapped beneath Dome C, 880m depth." },
  { kind: "DATASET", tone: "aurora", text: "Arctic sea-ice extent 1979–2025, daily, released." },
  { kind: "EXPEDITION", tone: "deep", text: "RV Kestrel departs for Weddell Sea survey." },
  { kind: "PUBLICATION", tone: "teal", text: "Basal melt rates revised for 2026 in Nature Polar." },
];

export const feedItems = [
  { title: "Vessel transit, Ross Sea", meta: "-77.8° · 167.1° · RV Kestrel", tag: "Expedition", image: "hero" },
  { title: "Calving event, Pine Island", meta: "Remote Sensing · Sentinel-2", tag: "Discovery", image: "hero" },
  { title: "Ice core, 40k yr record", meta: "Glaciology · Halley VI", tag: "Research", image: "field" },
  { title: "Aurora ionosphere sounding", meta: "Atmosphere · Ny-Ålesund", tag: "Station", image: "hero" },
  { title: "Krill biomass transect", meta: "Marine Biology · Ross Sea", tag: "Field note", image: "field" },
  { title: "Sea-ice fracture atlas", meta: "Dataset · 12,800 scenes", tag: "Dataset", image: "hero" },
];

export const expeditions = [
  ["Aurora Traverse 2026", "Antarctica", "Active", "12 researchers · 3 stations"],
  ["Meridian Passage", "Arctic", "In transit", "9 researchers · RV Meridian"],
  ["Svalbard Ice Core", "Svalbard", "Field ops", "7 researchers · Ny-Ålesund"],
  ["Weddell Sea Survey", "Antarctica", "Planning", "14 researchers · 4 instruments"],
  ["Ross Sea Food Web", "Antarctica", "Analysis", "6 researchers · RV Kestrel"],
  ["Fram Strait Watch", "Arctic", "Active", "11 researchers · 18 sensors"],
  ["Dome C Subglacial", "Antarctica", "Analysis", "8 researchers · 880m depth"],
  ["Greenland Meltwater", "Greenland", "Active", "10 researchers · 2 aircraft"],
  ["Beaufort Carbon Cycle", "Arctic", "Planning", "5 researchers · 29 datasets"],
  ["Southern Ocean Carbon", "Southern Ocean", "In transit", "13 researchers · CTD array"],
  ["Antarctic Peninsula Bio", "Antarctica", "Field ops", "9 researchers · 64 samples"],
  ["Iceberg Drift Tracking", "Weddell Sea", "Ongoing", "6 researchers · 31 beacons"],
];

export const researchers = ["Dr. Anika Voss", "Prof. Mateo Silva", "Dr. Inés Laurent", "Dr. Nia Okafor", "Dr. Thomas Reed", "Prof. Edda Nilsen", "Dr. Samira Chen", "Dr. Luca Moretti", "Dr. Amina Hassan", "Prof. Riku Aalto", "Dr. Helen Ward", "Dr. Noor Patel", "Dr. Erik Lund", "Dr. Maya Torres", "Dr. Jules Bennett"];
export const stations = ["Halley VI", "McMurdo", "Concordia", "Neumayer III", "Ny-Ålesund", "Kongsfjord", "Palmer", "Rothera", "Zackenberg", "Troll"];
export const datasets = ["Arctic Sea-Ice Extent 1979–2025", "Antarctic Ice Sheet Velocity Mosaic", "Southern Ocean Carbon Flux", "Ross Sea Krill Biomass Transects", "Greenland Surface Melt Index", "Dome C Subglacial Lake Radar", "Fram Strait Ocean Profiles", "Svalbard Snow Accumulation", "Pine Island Calving Fronts", "Polar Night Ionosphere Soundings", "Antarctic Peninsula Species Census", "Iceberg Drift Beacon Network", "Beaufort Gyre Freshwater", "Weddell Sea CTD Casts", "Sea-Ice Fracture Atlas", "Tundra Carbon Exchange", "Marine Acoustic Observations", "Blue Whale Sighting Logs", "Aerosol Optical Depth Polar", "Permafrost Active Layer"];
export const publications = ["Basal melt rates revised for 2026", "A living atlas of polar carbon", "Sea-ice fractures and wave energy", "Subglacial lakes of East Antarctica", "Krill corridors in a changing Ross Sea", "Aurora-driven ion chemistry", "Tipping points in outlet glaciers", "The microbial edge of sea ice", "Satellite methods for polar change", "A field guide to Antarctic stations", "Snow albedo feedbacks at scale", "Ocean heat beneath ice shelves", "Migration of Arctic apex predators", "Forty thousand years in an ice core", "The geometry of calving fronts", "Freshwater pathways in the Beaufort", "Atmospheric rivers over Antarctica", "The soundscape of a polar night", "A decade of Fram Strait change", "Remote sensing for field science", "Climate signals in blue ice", "Building open polar observatories"];
export const resources = ["Reports", "Documents", "Datasets", "Publications", "Photographs", "Videos", "Activities", "Educational resources", "Station logs", "Expedition diaries", "Instrument notes", "Researcher profiles", "Conference posters", "Policy briefs", "Story maps", "Field protocols", "Model outputs", "Satellite scenes", "Species records", "Open notebooks"];
