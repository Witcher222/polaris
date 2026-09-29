import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, UploadCloud, X, User, Tag, Loader2, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { items as itemsApi, type Item } from "@/lib/api";

export const Route = createFileRoute("/media")({
  component: Media,
});

function Media() {
  const [mediaItems, setMediaItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchMedia = async (q?: string) => {
    setLoading(true);
    try {
      // Fetch photos and videos
      const params: Record<string, string> = { limit: "30" };
      if (q) params['q'] = q;
      
      const [photos, videos] = await Promise.all([
        itemsApi.list({ ...params, type: "photo" }),
        itemsApi.list({ ...params, type: "video" }),
      ]);
      
      const combined = [...photos.items, ...videos.items];
      setMediaItems(combined);
    } catch (err) {
      console.error("Failed to fetch media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(searchQuery);
  };

  const handleUpload = (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      const newItem: Item = {
        id: Date.now(),
        type: "photo",
        title: e.target.title.value,
        thumbnail_url: e.target.url.value || "https://images.unsplash.com/photo-1534008103522-8636ba0eb692?q=80&w=800",
        authors: [e.target.author.value],
        credit: e.target.author.value,
        licence: "User contributed",
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setMediaItems([newItem, ...mediaItems]);
      setIsSubmitting(false);
      setIsModalOpen(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-12">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="font-display text-5xl tracking-tight text-polar">MEDIA CENTER</h1>
            <p className="mt-2 max-w-2xl text-lg text-deep/80">Real polar imagery from NASA, Wikimedia Commons, and contributors. Every asset includes licence and credit.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="rounded-full bg-teal text-white shadow-lg shadow-teal/20 hover:bg-teal/90 h-12 px-6">
            <UploadCloud className="mr-2 size-5" /> Contribute Media
          </Button>
        </div>
        
        <form onSubmit={handleSearch} className="mb-8 flex gap-3 max-w-lg">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search polar media..."
            className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/30"
          />
          <Button type="submit" className="rounded-full bg-polar text-white">
            <Search className="size-4 mr-2" /> Search
          </Button>
        </form>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
            <span className="ml-3 text-muted-foreground">Loading media from archive...</span>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No media found. Try a different search term.</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {mediaItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="relative group break-inside-avoid overflow-hidden rounded-3xl cursor-pointer border border-border shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <img 
                    src={item.thumbnail_url || `https://picsum.photos/seed/polar${item.id}/800/600`} 
                    alt={item.title} 
                    className="w-full object-cover transition duration-700 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/polar${item.id}/800/600`; }}
                  />
                  
                  {item.type === "video" && <Play className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white size-14 opacity-80 backdrop-blur-md bg-white/10 rounded-full p-4" />}
                  
                  {/* Meta Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-polar/90 via-polar/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-display text-lg leading-tight mb-2 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-white/80 border-t border-white/20 pt-3">
                      <User className="size-3" /> {item.credit || item.authors?.join(", ") || "Unknown"}
                      {item.licence && <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur ml-auto text-[10px]">{item.licence}</span>}
                    </div>
                    {item.source && <span className="text-[10px] text-white/60 mt-1">Source: {item.source}</span>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/70 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border bg-ice/50">
                <h2 className="text-2xl font-display text-polar">Upload Polar Media</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full bg-background"><X className="size-4" /></Button>
              </div>
              
              <form onSubmit={handleUpload} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><Tag className="size-3"/> Media Title</label>
                  <input required name="title" type="text" placeholder="e.g. Weddell Sea Ice Samples" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><User className="size-3"/> Contributor Name</label>
                    <input required name="author" type="text" placeholder="e.g. Dr. Scientist" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Role / Tag</label>
                    <select required name="role" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal">
                      <option value="Scientist">Scientist</option>
                      <option value="Expedition Team">Expedition Team</option>
                      <option value="NCPOR Admin">NCPOR Admin</option>
                      <option value="Photographer">Photographer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Image URL (or drag file below)</label>
                  <input name="url" type="url" placeholder="Leave empty for a random polar image" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal text-sm" />
                </div>

                <div className="border-2 border-dashed border-teal/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-teal/5">
                  <UploadCloud className="size-8 text-teal mb-3" />
                  <p className="text-sm font-bold text-polar">Drag & drop raw files here</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports JPG/PNG up to 50MB</p>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-polar text-white h-14 text-lg mt-4 shadow-lg shadow-polar/20">
                  {isSubmitting ? (
                    <span className="animate-pulse flex items-center"><UploadCloud className="animate-bounce mr-2 size-5" /> Processing Upload...</span>
                  ) : (
                    "Publish to Media Center"
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
