import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Filter, Loader2, ExternalLink, BookOpen, Database, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { search as searchApi, stats as statsApi, type Item, type Facets } from "@/lib/api";

export const Route = createFileRoute("/explore")({
  component: Explore,
});

const topicImages: Record<string, string> = {
  Antarctica: "https://picsum.photos/seed/antarctica/800/400",
  Arctic: "https://picsum.photos/seed/arctic/800/400",
  Glaciology: "https://picsum.photos/seed/glaciology/800/400",
  Oceanography: "https://picsum.photos/seed/oceanography/800/400",
  Atmosphere: "https://picsum.photos/seed/atmosphere/800/400",
  "Marine Biology": "https://picsum.photos/seed/marinebiology/800/400",
  Geology: "https://picsum.photos/seed/geology/800/400",
  "Remote Sensing": "https://picsum.photos/seed/remotesensing/800/400",
  "General Science": "https://picsum.photos/seed/science/800/400",
  "Polar": "https://picsum.photos/seed/polar/800/400",
  "Himalaya": "https://picsum.photos/seed/himalaya/800/400",
};

const typeIcons: Record<string, typeof BookOpen> = {
  publication: BookOpen,
  dataset: Database,
  photo: ImageIcon,
};

function Explore() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [searching, setSearching] = useState(false);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    statsApi.facets().then(setFacets).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setHasSearched(true);
    try {
      const data = await searchApi.query(query);
      setResults(data.items);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleTopicClick = async (topic: string) => {
    setQuery(topic);
    setSearching(true);
    setHasSearched(true);
    try {
      const data = await searchApi.query(topic);
      setResults(data.items);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-ice/30 to-background pt-24 pb-12">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal">Discovery</p>
            <h1 className="mt-3 font-display text-5xl tracking-tight text-polar sm:text-7xl">
              EXPLORE TOPICS
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-deep/80">
              Search the real archive — {facets ? `${facets.types.reduce((a, b) => a + b.count, 0)} items across ${facets.types.length} types` : 'loading...'}.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-2xl">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the polar science archive..."
                className="flex-1 rounded-full border border-border bg-background px-6 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/30 shadow-sm"
              />
              <Button type="submit" size="lg" className="rounded-full bg-polar text-white px-8">
                <Search className="size-5 mr-2" /> Search
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Facet Summary */}
      {facets && !hasSearched && (
        <section className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {facets.types.map(t => (
              <button key={t.type} onClick={() => handleTopicClick(t.type)} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-deep hover:bg-teal/10 hover:border-teal/30 transition">
                {t.type} <span className="text-muted-foreground ml-1">({t.count})</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Topic Cards or Search Results */}
      <section className="mx-auto max-w-[1440px] px-5 py-6 lg:px-8">
        {searching ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
            <span className="ml-3 text-muted-foreground">Searching archive...</span>
          </div>
        ) : hasSearched ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-polar">Results ({results.length})</h2>
              <Button variant="outline" className="rounded-full" onClick={() => { setHasSearched(false); setResults([]); setQuery(""); }}>Clear</Button>
            </div>
            {results.length === 0 ? (
              <div className="text-center py-16">
                <Search className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found for "{query}". Try different keywords.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((item, i) => {
                  const Icon = typeIcons[item.type] || BookOpen;
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition cursor-pointer">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="size-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0">
                          <Icon className="size-5 text-teal" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-teal">{item.type}</span>
                          <h3 className="text-sm font-semibold text-polar line-clamp-2 mt-1">{item.title}</h3>
                        </div>
                      </div>
                      {item.authors?.length > 0 && <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{item.authors.join(", ")}</p>}
                      <div className="flex flex-wrap gap-1">
                        {item.region && <span className="text-[10px] bg-teal/10 text-teal px-2 py-0.5 rounded-full">{item.region}</span>}
                        {item.discipline && <span className="text-[10px] bg-aurora/10 text-aurora px-2 py-0.5 rounded-full">{item.discipline}</span>}
                        {item.published_at && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{new Date(item.published_at).getFullYear()}</span>}
                      </div>
                      {item.url && (
                        <Button variant="link" size="sm" className="mt-3 text-xs p-0 h-auto text-teal" onClick={() => window.open(item.url!, '_blank')}>
                          <ExternalLink className="size-3 mr-1" /> View source
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {([...(facets?.regions || []), ...(facets?.disciplines || [])] as any[]).slice(0, 12).map((facet: any, i: number) => {
              const name = facet.region || facet.discipline;
              if (!name) return null;
              const img = topicImages[name] || `https://picsum.photos/seed/${name}/800/600`;
              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button onClick={() => handleTopicClick(name)} className="group relative flex h-48 w-full flex-col justify-end overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:scale-[1.02] hover:shadow-xl hover:shadow-teal/10 text-left">
                    <img src={img} alt={name} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-polar/90 via-polar/20 to-transparent transition group-hover:from-polar" />
                    <h3 className="relative z-10 font-display text-2xl text-white transition group-hover:text-teal">{name}</h3>
                    <p className="relative z-10 mt-2 font-mono text-[10px] uppercase tracking-widest text-white/80">{facet.count} items →</p>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
