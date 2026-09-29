import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Database, FileText, Image as ImageIcon, Video, Box, Sparkles, Loader2, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { items as itemsApi, ask as askApi, stats as statsApi, type Item, type AskResponse, type Facets } from "@/lib/api";

export const Route = createFileRoute("/knowledge")({
  component: Knowledge,
});

const tabs = [
  { name: "All Resources", icon: Box, type: "" },
  { name: "Datasets", icon: Database, type: "dataset" },
  { name: "Publications", icon: FileText, type: "publication" },
  { name: "Photos", icon: ImageIcon, type: "photo" },
  { name: "Videos", icon: Video, type: "video" },
];

function Knowledge() {
  const [activeTab, setActiveTab] = useState(0);
  const [knowledgeItems, setKnowledgeItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [askQuery, setAskQuery] = useState("");
  const [askResponse, setAskResponse] = useState<AskResponse | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [showAskPanel, setShowAskPanel] = useState(false);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const fetchItems = async (type?: string, region?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { limit: "20" };
      if (type) params['type'] = type;
      if (region) params['region'] = region;
      const data = await itemsApi.list(params);
      setKnowledgeItems(data.items);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    statsApi.facets().then(setFacets).catch(console.error);
  }, []);

  const handleTabChange = (idx: number) => {
    setActiveTab(idx);
    fetchItems(tabs[idx]?.type || undefined, selectedRegion || undefined);
  };

  const handleRegionFilter = (region: string | null) => {
    setSelectedRegion(region);
    fetchItems(tabs[activeTab]?.type || undefined, region || undefined);
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    setAskLoading(true);
    setShowAskPanel(true);
    try {
      const data = await askApi.query(askQuery);
      setAskResponse(data);
    } catch (err) {
      console.error("Ask failed:", err);
      setAskResponse({ answer: "Failed to query the archive. Please try again.", citations: [], grounded: false });
    } finally {
      setAskLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-paper pb-10 pt-20 border-b border-border">
        <div className="mx-auto max-w-[1440px] px-5 lg:px-8">
          <h1 className="font-display text-5xl sm:text-6xl text-polar tracking-tight">KNOWLEDGE HUB</h1>
          <p className="mt-4 max-w-2xl text-lg text-deep/80">
            A unified repository for {facets ? `${facets.types.reduce((a: number, b: any) => a + b.count, 0)} items` : 'all'} from real polar science databases.
          </p>
          <form onSubmit={handleAsk} className="mt-8 relative max-w-3xl">
            <div className="absolute inset-0 bg-gradient-to-r from-teal to-aurora blur-xl opacity-20 rounded-full" />
            <div className="relative flex items-center rounded-full border border-teal/30 bg-card/90 p-2 shadow-lg backdrop-blur">
              <Sparkles className="ml-4 mr-2 size-5 text-teal" />
              <input 
                type="text" 
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask the Archive (e.g. 'What research exists on Antarctic sea ice decline?')" 
                className="flex-1 bg-transparent px-2 py-3 outline-none text-polar placeholder:text-muted-foreground" 
              />
              <Button type="submit" className="rounded-full bg-gradient-to-r from-polar to-teal text-white px-8 h-12 shadow-md" disabled={askLoading}>
                {askLoading ? <Loader2 className="size-4 animate-spin" /> : "AI Search"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Ask the Archive Response */}
      <AnimatePresence>
        {showAskPanel && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mx-auto max-w-[1440px] px-5 lg:px-8">
            <div className="my-6 rounded-2xl border border-teal/20 bg-teal/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl text-polar flex items-center gap-2"><MessageSquare className="size-5 text-teal" /> Archive Response</h3>
                <Button variant="ghost" size="sm" className="rounded-full" onClick={() => setShowAskPanel(false)}>Close</Button>
              </div>
              {askLoading ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 className="size-5 animate-spin text-teal" />
                  <span className="text-muted-foreground">Searching archive and generating response...</span>
                </div>
              ) : askResponse ? (
                <div>
                  <div className="prose prose-sm max-w-none text-deep/90 whitespace-pre-wrap mb-4">{askResponse.answer}</div>
                  {!askResponse.grounded && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 mb-4">
                      ⚠️ This topic isn't well covered in the archive yet.
                    </div>
                  )}
                  {askResponse.citations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Sources ({askResponse.citations.length})</p>
                      <div className="space-y-2">
                        {askResponse.citations.map((c, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-deep/80">
                            <span className="text-teal font-bold">[{i+1}]</span>
                            <div>
                              <span className="font-medium">{c.title}</span>
                              {c.url && <Button variant="link" size="sm" className="text-xs p-0 h-auto ml-2 text-teal" onClick={() => window.open(c.url, '_blank')}><ExternalLink className="size-3" /></Button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-4">
          {tabs.map((tab, i) => (
            <button key={tab.name} onClick={() => handleTabChange(i)} className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${i === activeTab ? "bg-polar text-white" : "bg-card border border-border text-deep hover:bg-ice"}`}>
              <tab.icon className="size-4" /> {tab.name}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-1 border border-border bg-card rounded-3xl p-6 h-fit">
            <h3 className="font-semibold text-polar mb-4">Filters</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-deep mb-2">Region</p>
                <div className="space-y-2 text-deep/70">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedRegion === 'Antarctica'} onChange={() => handleRegionFilter(selectedRegion === 'Antarctica' ? null : 'Antarctica')} /> Antarctica {facets?.regions.find((r: any) => r.region === 'Antarctica') && <span className="text-xs text-muted-foreground">({(facets.regions.find((r: any) => r.region === 'Antarctica') as any)?.count})</span>}</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedRegion === 'Arctic'} onChange={() => handleRegionFilter(selectedRegion === 'Arctic' ? null : 'Arctic')} /> Arctic {facets?.regions.find((r: any) => r.region === 'Arctic') && <span className="text-xs text-muted-foreground">({(facets.regions.find((r: any) => r.region === 'Arctic') as any)?.count})</span>}</label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={selectedRegion === 'Himalaya'} onChange={() => handleRegionFilter(selectedRegion === 'Himalaya' ? null : 'Himalaya')} /> Himalaya {facets?.regions.find((r: any) => r.region === 'Himalaya') && <span className="text-xs text-muted-foreground">({(facets.regions.find((r: any) => r.region === 'Himalaya') as any)?.count})</span>}</label>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="size-8 animate-spin text-teal" />
              </div>
            ) : knowledgeItems.length === 0 ? (
              <div className="text-center py-16">
                <Box className="size-10 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No items found for this filter combination.</p>
              </div>
            ) : (
              knowledgeItems.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex flex-col sm:flex-row gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-teal">{item.type}</span>
                      {item.source && <span className="text-[10px] text-muted-foreground">· {item.source}</span>}
                    </div>
                    <h4 className="text-lg font-semibold text-polar line-clamp-2">{item.title}</h4>
                    {item.authors?.length > 0 && <p className="mt-1 text-sm text-deep/70 line-clamp-1">{item.authors.join(", ")}</p>}
                    {item.abstract && <p className="mt-2 text-sm text-deep/80 line-clamp-2">{item.abstract}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.region && <span className="rounded bg-teal/10 text-teal px-2 py-1 text-xs">{item.region}</span>}
                      {item.discipline && <span className="rounded bg-aurora/10 text-aurora px-2 py-1 text-xs">{item.discipline}</span>}
                      {item.published_at && <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{new Date(item.published_at).getFullYear()}</span>}
                    </div>
                    {item.url && (
                      <Button variant="link" size="sm" className="mt-2 text-xs p-0 h-auto text-teal" onClick={() => window.open(item.url!, '_blank')}>
                        <ExternalLink className="size-3 mr-1" /> View source
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
