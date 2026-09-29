import { motion, AnimatePresence } from "framer-motion";
import { X, Edit3, Save, Share2, Download, CheckCircle2, Network, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function UniversalModal({ 
  item, 
  onClose,
  type = "Asset"
}: { 
  item: any; 
  onClose: () => void;
  type?: string;
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    title: item.title || item.name || "",
    desc: item.desc || item.description || item.authors || "Detailed information regarding this asset.",
    image: item.image || item.img || item.cover || "https://picsum.photos/seed/polar/800/600",
  });

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsEditMode(false);
    }, 1500);
  };

  // Mock related graph data to show interconnectedness
  const relatedGraph = [
    { type: "Dataset", name: "Associated Telemetry Data 2026", icon: "📊" },
    { type: "Expedition", name: "Indian Antarctic Mission (43-ISEA)", icon: "🚢" },
    { type: "Publication", name: "Peer-Reviewed Analysis", icon: "📄" },
    { type: "Media", name: "Field Photography Gallery", icon: "📸" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-polar/60 backdrop-blur-md p-4">
        <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh]">
          
          {/* Header Image */}
          <div className="h-48 relative shrink-0 bg-ice">
            <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur hover:bg-background" onClick={() => setIsEditMode(!isEditMode)}>
                <Edit3 className="size-4" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full bg-background/80 backdrop-blur hover:bg-background" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="absolute bottom-4 left-6">
              <span className="bg-teal text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">{type}</span>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 lg:p-8 overflow-y-auto flex-1 custom-scrollbar">
            {isEditMode ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-aurora/10 text-aurora px-4 py-2 rounded-lg text-sm font-medium border border-aurora/20 flex items-center gap-2 mb-4">
                  <Edit3 className="size-4" /> Admin Edit Mode Active
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Asset Title</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar font-medium outline-none focus:border-teal transition" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Description / Metadata</label>
                  <textarea value={formData.desc} onChange={(e) => setFormData({...formData, desc: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-deep outline-none focus:border-teal transition min-h-[120px]" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Image Source URL</label>
                  <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-deep text-sm outline-none focus:border-teal transition" />
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-3xl font-display text-polar mb-4">{formData.title}</h2>
                <div className="prose prose-sm max-w-none text-deep/80">
                  <p className="text-lg leading-relaxed">{formData.desc}</p>
                </div>
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {Object.entries(item).filter(([k]) => !['id', 'title', 'name', 'desc', 'image', 'img', 'cover', 'description'].includes(k)).slice(0,4).map(([key, val]) => (
                    <div key={key} className="bg-ice/50 p-3 rounded-xl border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono truncate">{key}</p>
                      <p className="font-semibold text-polar text-sm truncate mt-1">{String(val)}</p>
                    </div>
                  ))}
                </div>

                {/* Knowledge Graph / Related Content */}
                <div className="mt-10">
                  <h3 className="text-sm font-bold text-polar uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-border pb-2">
                    <Network className="size-4 text-teal" /> Knowledge Graph Connections
                  </h3>
                  <div className="grid gap-2">
                    {relatedGraph.map((related, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-teal/50 hover:bg-teal/5 transition cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{related.icon}</span>
                          <div>
                            <p className="text-[10px] text-teal font-mono uppercase tracking-wider">{related.type}</p>
                            <p className="text-sm font-medium text-deep group-hover:text-polar transition">{related.name}</p>
                          </div>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground group-hover:text-teal transition" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-background flex gap-3 shrink-0">
            {isEditMode ? (
              <Button className="flex-1 rounded-full bg-teal text-white h-12" onClick={handleSave}>
                {isSaved ? <><CheckCircle2 className="mr-2 size-5" /> Saved to Database</> : <><Save className="mr-2 size-5" /> Save Changes</>}
              </Button>
            ) : (
              <>
                <Button className="flex-1 rounded-full bg-polar text-white h-12">
                  Access Resource
                </Button>
                <Button variant="outline" className="rounded-full size-12" aria-label="Share">
                  <Share2 className="size-5" />
                </Button>
                <Button variant="outline" className="rounded-full size-12" aria-label="Download">
                  <Download className="size-5" />
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
