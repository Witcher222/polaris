import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Users, Search, ArrowRight, X, Ship, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { expeditions as expeditionsApi, type Expedition } from "@/lib/api";

export const Route = createFileRoute("/expeditions")({
  component: Expeditions,
});

function Expeditions() {
  const [expeditions, setExpeditions] = useState<Expedition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);

  useEffect(() => {
    expeditionsApi.list().then(data => {
      setExpeditions(data.expeditions);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getExpeditionImage = (exp: Expedition) => {
    const name = exp.name?.toLowerCase() || '';
    if (name.includes('43-isea')) return "/isea_expedition.jpg";
    if (name.includes('himalaya')) return "/himalaya_expedition.jpg";
    if (name.includes('endurance')) return "/endurance_ship.jpg";
    if (name.includes('polarstern') || name.includes('mosaic')) return "https://picsum.photos/seed/polarstern/800/600";
    if (name.includes('thor') || name.includes('thwaites')) return "https://picsum.photos/seed/thwaites/800/600";
    if (name.includes('tara')) return "https://picsum.photos/seed/tara/800/600";
    
    // Fallback to region
    switch(exp.region?.toLowerCase()) {
      case 'antarctica': return "https://picsum.photos/seed/antarctica/800/600";
      case 'arctic': return "https://picsum.photos/seed/arctic/800/600";
      default: return `https://picsum.photos/seed/${exp.id}/800/600`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-paper pb-16 pt-24">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-display text-5xl tracking-tight text-polar sm:text-7xl">
            EXPEDITIONS
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-8 flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[280px] max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
              <input type="text" placeholder="Search expeditions by region, discipline..." className="w-full rounded-full border border-border bg-card py-3 pl-12 pr-6 shadow-sm focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal" />
            </div>
            <Button size="lg" variant="outline" className="rounded-full">Filters</Button>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
          </div>
        ) : expeditions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No expeditions found.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {expeditions.map((exp, i) => (
              <motion.div key={exp.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="relative h-60 overflow-hidden">
                  <img src={getExpeditionImage(exp)} alt={exp.name} className="size-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${exp.status === 'Active' ? 'bg-teal/90 text-white' : exp.status === 'Planning' ? 'bg-amber-500/90 text-white' : 'bg-background/80 text-polar'}`}>
                    {exp.status}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl text-polar truncate">{exp.name}</h3>
                  <div className="mt-4 space-y-2 text-sm text-deep/80">
                    <div className="flex items-center gap-2"><MapPin className="size-4 text-teal" /> {exp.region}</div>
                    <div className="flex items-center gap-2"><Calendar className="size-4 text-teal" /> {formatDate(exp.start_date || '')} - {formatDate(exp.end_date || '')}</div>
                    <div className="flex items-center gap-2"><Ship className="size-4 text-teal" /> {exp.vessel_or_station}</div>
                  </div>
                  <Button className="mt-6 w-full rounded-full" variant="secondary" onClick={() => setSelectedExpedition(exp)}>View Expedition Details <ArrowRight className="ml-2 size-4" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedExpedition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-card w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl border border-border my-auto relative max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-4 right-4 z-20 flex justify-end gap-2 pr-4 pt-4">
                <Button variant="secondary" size="icon" onClick={() => setSelectedExpedition(null)} className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background shadow-md"><X className="size-4 text-polar" /></Button>
              </div>

              <div className="aspect-[21/9] relative overflow-hidden bg-polar -mt-16">
                <img src={getExpeditionImage(selectedExpedition)} alt={selectedExpedition.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-polar via-polar/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xs font-mono uppercase tracking-widest text-teal mb-3">{selectedExpedition.status} Expedition</p>
                  <h2 className="text-4xl sm:text-5xl font-display text-white leading-tight">{selectedExpedition.name}</h2>
                </div>
              </div>
              
              <div className="p-8 sm:p-12 bg-background">
                <div className="flex flex-wrap gap-4 mb-8 pb-8 border-b border-border">
                  <div className="bg-ice/50 rounded-xl p-4 flex-1 min-w-[150px]">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Region</p>
                    <p className="font-medium text-polar flex items-center gap-2"><MapPin className="size-4 text-teal" />{selectedExpedition.region}</p>
                  </div>
                  <div className="bg-ice/50 rounded-xl p-4 flex-1 min-w-[150px]">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Timeline</p>
                    <p className="font-medium text-polar flex items-center gap-2"><Calendar className="size-4 text-teal" />{formatDate(selectedExpedition.start_date || '')} - {formatDate(selectedExpedition.end_date || '')}</p>
                  </div>
                  <div className="bg-ice/50 rounded-xl p-4 flex-1 min-w-[150px]">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Base / Vessel</p>
                    <p className="font-medium text-polar flex items-center gap-2"><Ship className="size-4 text-teal" />{selectedExpedition.vessel_or_station}</p>
                  </div>
                </div>

                <div className="prose prose-lg prose-p:text-deep/90 prose-p:leading-relaxed max-w-none mb-12">
                  <h3 className="text-2xl font-display text-polar mb-4">Mission Overview</h3>
                  <p className="whitespace-pre-wrap">{selectedExpedition.summary || "No overview available for this expedition."}</p>
                </div>
                
                {selectedExpedition.status === 'Active' && (
                  <div className="bg-teal/5 border border-teal/20 rounded-2xl p-6">
                    <h3 className="font-display text-xl text-polar flex items-center gap-2 mb-2"><Activity className="size-5 text-teal" /> Live Tracking Available</h3>
                    <p className="text-sm text-deep mb-4">This expedition is currently active. You can track telemetry data and weather on the Polar Map.</p>
                    <Button asChild className="rounded-full bg-teal text-white">
                      <Link to="/polar-map">Open Polar Map</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
