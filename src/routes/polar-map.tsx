import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Map as MapIcon, MapPin, Activity, Navigation, Wind, ThermometerSnowflake, Gauge, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { map as mapApi } from "@/lib/api";
import { lazy, Suspense } from "react";

const MapComponent = lazy(() => import('@/components/MapComponent'));
const GlobeComponent = lazy(() => import('@/components/GlobeComponent'));

export const Route = createFileRoute("/polar-map")({
  component: PolarMap,
});

interface MapLocation {
  id: string;
  name: string;
  region: string;
  type: string;
  lat: number;
  lon: number;
  status: string;
  temp: string;
  wind: string;
  pressure: string;
  data: string;
}

function PolarMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapLocation | null>(null);
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [mapLayer, setMapLayer] = useState<"satellite" | "terrain">("satellite");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const data = await mapApi.get();
        
        // Map stations to location format with real weather
        const stationLocations: MapLocation[] = data.stations.map((station: any, i: number) => {
          return {
            id: station.id,
            name: station.name,
            region: station.region,
            type: "Research Base",
            lat: station.lat || (station.id === 'maitri' ? -70.76 : station.id === 'bharati' ? -69.40 : 78.92),
            lon: station.lon || (station.id === 'maitri' ? 11.73 : station.id === 'bharati' ? 76.19 : 11.93),
            status: station.stale ? "Active (stale data)" : "Active",
            temp: station.weather ? `${station.weather.temperature_2m}°C` : "N/A",
            wind: station.weather ? `${station.weather.wind_speed_10m} km/h` : "N/A",
            pressure: station.weather ? `${station.weather.surface_pressure} hPa` : "N/A",
            data: station.weather ? "Live weather data from Open-Meteo" : "Weather data unavailable",
          };
        });
        const expeditionLocations: MapLocation[] = (data.expeditions || []).map((exp: any) => ({
          id: `exp-${exp.id}`,
          name: exp.name,
          region: exp.region,
          type: "Expedition",
          lat: exp.lat,
          lon: exp.lon,
          status: exp.stale ? `${exp.status} (stale data)` : exp.status,
          temp: exp.weather ? `${exp.weather.temperature_2m}°C` : "N/A",
          wind: exp.weather ? `${exp.weather.wind_speed_10m} km/h` : "N/A",
          pressure: exp.weather ? `${exp.weather.surface_pressure} hPa` : "N/A",
          data: exp.weather ? "Live weather data from Open-Meteo" : "Expedition marker",
        }));

        const itemLocations: MapLocation[] = (data.items || []).map((item: any) => ({
          id: `item-${item.id}`,
          name: item.title,
          region: item.region || 'Unknown',
          type: item.itemType || "Resource",
          lat: item.lat,
          lon: item.lon,
          status: "Archived",
          temp: "N/A", wind: "N/A", pressure: "N/A",
          data: item.thumbnail_url || "Geo-tagged item",
        }));
        
        setLocations([...stationLocations, ...expeditionLocations, ...itemLocations]);
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        // Fallback
        setLocations([
          { id: "maitri", name: "Maitri Station", region: "Antarctica", type: "Research Base", lat: -70.76, lon: 11.73, status: "Loading...", temp: "...", wind: "...", pressure: "...", data: "Connecting..." },
          { id: "bharati", name: "Bharati Station", region: "Antarctica", type: "Research Base", lat: -69.40, lon: 76.19, status: "Loading...", temp: "...", wind: "...", pressure: "...", data: "Connecting..." },
          { id: "himadri", name: "Himadri Station", region: "Arctic (Svalbard)", type: "Research Base", lat: 78.92, lon: 11.93, status: "Loading...", temp: "...", wind: "...", pressure: "...", data: "Connecting..." },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
    const interval = setInterval(fetchMapData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-[60px] bg-background">
      
      {/* Sidebar Dashboard */}
      <div className="w-full lg:w-96 border-r border-border bg-card flex flex-col h-full shrink-0 z-20 shadow-xl">
        <div className="p-6 border-b border-border bg-ice/50">
          <h2 className="font-display text-2xl text-polar flex items-center gap-2"><MapIcon className="size-6 text-teal" /> POLAR ATLAS</h2>
          <p className="text-sm text-muted-foreground mt-2">Real-time weather from Indian polar research stations via Open-Meteo API.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex gap-2 p-1 bg-background border border-border rounded-lg mb-6">
            <button onClick={() => setMapLayer("satellite")} className={`flex-1 text-xs font-bold uppercase tracking-widest py-2 rounded-md transition ${mapLayer === "satellite" ? "bg-teal text-white shadow-md" : "text-deep hover:bg-ice"}`}>Satellite</button>
            <button onClick={() => setMapLayer("terrain")} className={`flex-1 text-xs font-bold uppercase tracking-widest py-2 rounded-md transition ${mapLayer === "terrain" ? "bg-teal text-white shadow-md" : "text-deep hover:bg-ice"}`}>Terrain</button>
          </div>

          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Locations ({locations.length})</h3>
          {locations.map((loc) => (
            <div 
              key={loc.id} 
              onClick={() => setSelectedPin(loc)}
              className={`p-4 rounded-xl border transition cursor-pointer ${selectedPin?.id === loc.id ? 'border-teal bg-teal/5' : 'border-border bg-background hover:border-teal/50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-polar">{loc.name}</h4>
                  <p className="text-xs text-deep/70 mt-1">{loc.region}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${loc.type === 'Expedition' ? 'bg-aurora/20 text-aurora' : 'bg-teal/20 text-teal'}`}>
                  {loc.type}
                </span>
              </div>
              {selectedPin?.id === loc.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-deep"><ThermometerSnowflake className="size-4 text-teal" /> {loc.temp}</div>
                  <div className="flex items-center gap-2 text-sm text-deep"><Wind className="size-4 text-teal" /> {loc.wind}</div>
                  <div className="flex items-center gap-2 text-sm text-deep col-span-2"><Gauge className="size-4 text-teal" /> {loc.pressure}</div>
                </motion.div>
              )}
            </div>
          ))}

          <div className="mt-8 p-4 bg-teal/10 border border-teal/20 rounded-xl">
            <h4 className="text-sm font-bold text-teal flex items-center gap-2"><Activity className="size-4" /> Live Data Feed</h4>
            <p className="text-xs text-teal/80 mt-1">Weather data refreshes every 30 minutes from Open-Meteo API.</p>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 w-full h-full relative bg-polar overflow-hidden z-10">
        <Suspense fallback={<div className="flex w-full h-full items-center justify-center bg-polar"><Loader2 className="size-8 animate-spin text-teal" /></div>}>
          <GlobeComponent locations={locations} selectedPin={selectedPin} onSelectPin={setSelectedPin} />
        </Suspense>

        {/* Floating Info Panel */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-6 right-6 z-[1000] w-80 bg-card/95 backdrop-blur-md border border-teal/30 rounded-2xl shadow-2xl p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display text-xl text-polar">{selectedPin.name}</h3>
                  <p className="text-xs font-mono uppercase text-teal mt-1">{selectedPin.status}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPin(null)} className="rounded-full size-8 -mr-2 -mt-2"><X className="size-4" /></Button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-ice/50 p-3 rounded-xl border border-border">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Temperature</p>
                    <p className="text-lg font-display text-polar">{selectedPin.temp}</p>
                  </div>
                  <div className="bg-ice/50 p-3 rounded-xl border border-border">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Wind Speed</p>
                    <p className="text-lg font-display text-polar">{selectedPin.wind}</p>
                  </div>
                </div>
                <div className="bg-ice/50 p-3 rounded-xl border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Pressure</p>
                  <p className="text-sm text-deep">{selectedPin.pressure}</p>
                </div>
                <p className="text-xs text-muted-foreground">{selectedPin.data}</p>
                {selectedPin.type === 'Expedition' && (
                  <Button onClick={() => setIsDiaryOpen(true)} className="w-full mt-2 bg-polar hover:bg-polar/90 text-white rounded-xl">
                    Open Field Diary
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expedition Field Diary Modal */}
        <AnimatePresence>
          {isDiaryOpen && selectedPin && (
            <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-polar/80 backdrop-blur-md p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2rem] overflow-hidden shadow-2xl border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                  <div>
                    <h3 className="font-display text-2xl text-polar">Field Diary: {selectedPin.name}</h3>
                    <p className="text-sm font-mono text-teal mt-1">Live Expedition Logbook</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsDiaryOpen(false)} className="rounded-full"><X className="size-5" /></Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                  <div className="relative pl-6 border-l-2 border-teal/30 space-y-8">
                    {/* Entry 1 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 size-4 rounded-full bg-teal shadow-[0_0_10px_rgba(13,148,136,0.5)] border-2 border-card" />
                      <p className="text-xs font-mono text-teal mb-2">Today, 08:30 AM • Lat {selectedPin.lat}, Lon {selectedPin.lon}</p>
                      <div className="bg-ice/50 p-5 rounded-2xl border border-border">
                        <p className="text-polar font-medium mb-3">Deploying the autonomous sensors</p>
                        <p className="text-sm text-deep/90 leading-relaxed mb-4">The weather broke long enough for us to deploy the first wave of autonomous sensors on the ice shelf. Surface temp is dropping rapidly.</p>
                        <div className="grid grid-cols-2 gap-2">
                          <img src="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400&q=80" alt="Ice shelf" className="rounded-xl w-full h-32 object-cover" />
                          <img src="https://images.unsplash.com/photo-1518182170546-076616fdcbba?w=400&q=80" alt="Researchers" className="rounded-xl w-full h-32 object-cover" />
                        </div>
                      </div>
                    </div>
                    {/* Entry 2 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 size-4 rounded-full bg-polar border-2 border-card" />
                      <p className="text-xs font-mono text-muted-foreground mb-2">Yesterday, 14:15 PM</p>
                      <div className="bg-card p-5 rounded-2xl border border-border">
                        <p className="text-polar font-medium mb-2">Arrival at coordinates</p>
                        <p className="text-sm text-deep/90 leading-relaxed">We have reached our target coordinates. Setting up base camp before the expected blizzard hits tonight. Morale is high.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border bg-ice/30">
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-2">
                    <Activity className="size-3" /> Story Engine auto-syncing from satellite feed...
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
