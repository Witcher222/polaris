import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Database, Download, ExternalLink, Activity, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { items as itemsApi, type Item } from "@/lib/api";

export const Route = createFileRoute("/datasets")({
  component: Datasets,
});

function Datasets() {
  const [datasets, setDatasets] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDataset, setSelectedDataset] = useState<Item | null>(null);

  const fetchDatasets = async (q?: string, p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { type: "dataset", page: String(p), limit: "12" };
      if (q) params['q'] = q;
      const data = await itemsApi.list(params);
      setDatasets(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatasets(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDatasets(searchQuery, 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-polar text-primary-foreground py-24 px-5 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-polar to-deep/80" />
        <div className="relative z-10 mx-auto max-w-[1440px]">
          <Database className="size-10 text-teal mb-4" />
          <h1 className="font-display text-5xl tracking-tight">DATASETS</h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Real datasets from Zenodo, NASA CMR, and other open repositories. Browse polar science data collections.
          </p>
          
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-lg">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets..."
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-teal/30 backdrop-blur"
            />
            <Button type="submit" className="rounded-full bg-teal text-white">
              <Search className="size-4 mr-2" /> Search
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
            <span className="ml-3 text-muted-foreground">Loading datasets from archive...</span>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-20">
            <Database className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No datasets found. Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {datasets.map((data, i) => (
                <motion.div key={data.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
                    <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto flex-1">
                      <div className="size-16 shrink-0 rounded-2xl bg-teal/10 flex items-center justify-center">
                        <Database className="size-8 text-teal" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-lg font-display text-polar leading-tight line-clamp-2">{data.title}</h3>
                        </div>
                        <p className="text-sm text-deep/70 line-clamp-2">{data.abstract || 'Polar science dataset from open repository.'}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-deep/70 pt-1">
                          {data.source && <span className="bg-muted px-2 py-1 rounded">Source: {data.source}</span>}
                          {data.region && <span className="bg-teal/10 text-teal px-2 py-1 rounded">{data.region}</span>}
                          {data.discipline && <span className="bg-aurora/10 text-aurora px-2 py-1 rounded">{data.discipline}</span>}
                          {data.published_at && <span className="bg-muted px-2 py-1 rounded">{new Date(data.published_at).getFullYear()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button variant="outline" className="rounded-full" onClick={() => setSelectedDataset(data)}>Details <ExternalLink className="ml-2 size-4" /></Button>
                      {data.url && (
                        <Button className="rounded-full bg-polar text-white" onClick={() => window.open(data.url!, '_blank')}>View Source <ExternalLink className="ml-2 size-4" /></Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" className="rounded-full" disabled={page <= 1} onClick={() => { setPage(p => p-1); fetchDatasets(searchQuery, page-1); }}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" className="rounded-full" disabled={page >= totalPages} onClick={() => { setPage(p => p+1); fetchDatasets(searchQuery, page+1); }}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedDataset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/50 backdrop-blur-sm p-4" onClick={() => setSelectedDataset(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="h-20 bg-gradient-to-r from-teal/20 to-ice/30 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-8 -mt-6 relative z-10">
              <div className="size-14 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center mb-4">
                <Database className="size-7 text-teal" />
              </div>
              <h2 className="text-xl font-display text-polar mb-2">{selectedDataset.title}</h2>
              {selectedDataset.abstract && <p className="text-sm text-deep/80 mb-4 line-clamp-4">{selectedDataset.abstract}</p>}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {selectedDataset.source && <div className="bg-muted p-3 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Source</p><p className="font-bold text-polar text-sm">{selectedDataset.source}</p></div>}
                {selectedDataset.region && <div className="bg-muted p-3 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Region</p><p className="font-bold text-polar text-sm">{selectedDataset.region}</p></div>}
              </div>
              <div className="flex gap-3">
                {selectedDataset.url && <Button className="flex-1 rounded-full bg-polar text-white" onClick={() => window.open(selectedDataset.url!, '_blank')}>View Source</Button>}
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setSelectedDataset(null)}>Close</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
