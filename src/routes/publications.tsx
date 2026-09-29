import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, BookOpen, Search, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { items as itemsApi, type Item } from "@/lib/api";

export const Route = createFileRoute("/publications")({
  component: Publications,
});

function Publications() {
  const [pubs, setPubs] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchPubs = async (q?: string, p = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { type: "publication", page: String(p), limit: "12" };
      if (q) params['q'] = q;
      const data = await itemsApi.list(params);
      setPubs(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch publications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPubs(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPubs(searchQuery, 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border bg-paper py-24 px-5 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ice/30 to-background z-0" />
        <div className="relative z-10 mx-auto max-w-[1440px]">
          <h1 className="font-display text-5xl tracking-tight text-polar">PUBLICATIONS</h1>
          <p className="mt-4 max-w-2xl text-lg text-deep/80">Searchable library of peer-reviewed papers from real academic databases (OpenAlex, Crossref).</p>
          
          <form onSubmit={handleSearch} className="mt-6 flex gap-3 max-w-lg">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search publications..."
              className="flex-1 rounded-full border border-border bg-background px-5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <Button type="submit" className="rounded-full bg-polar text-white">
              <Search className="size-4 mr-2" /> Search
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
            <span className="ml-3 text-muted-foreground">Loading publications from archive...</span>
          </div>
        ) : pubs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="size-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">No publications found. Try a different search term.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pubs.map((pub, i) => (
                <motion.div key={pub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition hover:shadow-xl hover:shadow-teal/5 cursor-pointer" onClick={() => setSelectedItem(pub)}>
                  <div className="flex gap-4">
                    <div className="size-12 shrink-0 rounded-xl bg-teal/10 flex items-center justify-center">
                      <BookOpen className="size-6 text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-polar line-clamp-2">{pub.title}</h3>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-deep line-clamp-1">{pub.authors?.join(", ") || "Unknown authors"}</p>
                    <p className="mt-1 text-xs text-deep/70">{pub.published_at ? new Date(pub.published_at).getFullYear() : ""} {pub.region && `· ${pub.region}`} {pub.discipline && `· ${pub.discipline}`}</p>
                    {pub.url && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={(e) => { e.stopPropagation(); if (pub.url) window.open(pub.url, '_blank'); }}>
                          <ExternalLink className="size-3 mr-1" /> View Source
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button variant="outline" className="rounded-full" disabled={page <= 1} onClick={() => { setPage(p => p-1); fetchPubs(searchQuery, page-1); }}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" className="rounded-full" disabled={page >= totalPages} onClick={() => { setPage(p => p+1); fetchPubs(searchQuery, page+1); }}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/50 backdrop-blur-sm p-4" onClick={() => setSelectedItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="h-20 bg-gradient-to-r from-teal/20 to-ice/30 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="p-8 -mt-6 relative z-10">
              <div className="size-14 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center mb-4">
                <BookOpen className="size-7 text-teal" />
              </div>
              <h2 className="text-xl font-display text-polar mb-2">{selectedItem.title}</h2>
              <p className="text-sm font-medium text-deep mb-1">{selectedItem.authors?.join(", ")}</p>
              <p className="text-xs text-muted-foreground mb-4">{selectedItem.published_at} · {selectedItem.region} · {selectedItem.discipline}</p>
              {selectedItem.abstract && <p className="text-sm text-deep/80 mb-6 line-clamp-6">{selectedItem.abstract}</p>}
              <div className="flex gap-3">
                {selectedItem.url && (
                  <Button className="flex-1 rounded-full bg-polar text-white" onClick={() => window.open(selectedItem.url!, '_blank')}>
                    View Full Text <ExternalLink className="size-4 ml-2" />
                  </Button>
                )}
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setSelectedItem(null)}>Close</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
