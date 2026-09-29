import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, FileText, Image as ImageIcon, Send, RefreshCcw, Check, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { studio as studioApi, stats as statsApi, type Item } from "@/lib/api";

export const Route = createFileRoute("/studio")({
  component: Studio,
});

function Studio() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [content, setContent] = useState({ twitter: "", instagram: "", linkedin: "" });

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    // Fetch recent items for the sidebar
    statsApi.get().then(res => {
      setItems(res.recentItems || []);
      if (res.recentItems && res.recentItems.length > 0) setSelectedItem(res.recentItems[0] || null);
    }).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    if (!selectedItem) return;
    setGenerating(true);
    try {
      const res = await studioApi.generate({
        itemId: selectedItem.id,
        channels: ['twitter', 'instagram', 'linkedin'],
        language: 'en',
        readingLevel: 'public'
      });
      
      if (res.results) {
        setContent({
          twitter: res.results['twitter']?.body || '',
          instagram: res.results['instagram']?.body || '',
          linkedin: res.results['linkedin']?.body || ''
        });
        setGenerated(true);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to connect to backend server");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Publication Source */}
      <div className="w-1/3 border-r border-border bg-card p-6 overflow-y-auto hidden lg:block">
        <h2 className="font-display text-xl text-polar mb-6 flex items-center gap-2">
          <FileText className="size-5 text-teal" /> Source Material
        </h2>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-polar mb-2">Select Item to Generate From:</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {items.map(item => (
              <div 
                key={item.id} 
                onClick={() => { setSelectedItem(item); setGenerated(false); }}
                className={`p-3 rounded-xl border cursor-pointer transition ${selectedItem?.id === item.id ? 'border-teal bg-teal/10' : 'border-border bg-card hover:bg-ice/50'}`}
              >
                <h4 className="font-semibold text-polar text-sm line-clamp-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{item.type} • {item.region || 'Unknown'}</p>
              </div>
            ))}
          </div>
          
          {selectedItem && (
            <div className="p-4 rounded-xl border-2 border-teal bg-ice/30 mt-6">
              <p className="text-xs font-mono text-teal uppercase tracking-wider mb-2">Selected Document</p>
              <h3 className="font-semibold text-polar">{selectedItem.title}</h3>
              <p className="text-sm text-deep/80 mt-2 line-clamp-3">
                {selectedItem.abstract || 'No abstract available.'}
              </p>
            </div>
          )}
          <Button onClick={handleGenerate} disabled={generating || generated} className="w-full rounded-full bg-polar text-white h-12 text-lg group">
            {generating ? (
              <><RefreshCcw className="mr-2 size-5 animate-spin" /> Querying Gemini AI...</>
            ) : generated ? (
              <><Check className="mr-2 size-5" /> Content Generated</>
            ) : (
              <><Sparkles className="mr-2 size-5 text-teal group-hover:animate-pulse" /> Generate Social Content</>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - Generated Posts */}
      <div className="flex-1 bg-paper p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-4xl text-polar flex items-center gap-3">
              <Sparkles className="size-8 text-aurora" /> AI Content Studio
            </h1>
            <p className="text-deep/70 mt-2">Powered by Gemini AI. Automatically transform complex scientific research into accessible outreach content.</p>
          </div>

          {generated ? (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#1DA1F2]"><Twitter className="size-5" /> <span className="font-bold">X (Twitter) Thread</span></div>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => alert("Opening editor...")}>Edit</Button>
                </div>
                <div className="text-deep whitespace-pre-wrap">
                  {content.twitter}
                </div>
                <div className="mt-6 flex gap-2"><Button className="rounded-full bg-polar text-white" onClick={() => alert("Post scheduled successfully!")}>Schedule Post</Button></div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#E1306C]"><Instagram className="size-5" /> <span className="font-bold">Instagram Post</span></div>
                  </div>
                  <p className="text-deep text-sm whitespace-pre-wrap">
                    {content.instagram}
                  </p>
                  <div className="mt-6 flex gap-2"><Button className="rounded-full bg-polar text-white" onClick={() => alert("Post scheduled successfully!")}>Schedule Post</Button></div>
                </div>
                <div className="w-full md:w-64 shrink-0 bg-ice rounded-xl overflow-hidden aspect-square border border-border">
                  <img src="https://picsum.photos/seed/arctic123/400/400" alt="Instagram Square" className="w-full h-full object-cover" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-[#0A66C2]"><Linkedin className="size-5" /> <span className="font-bold">LinkedIn Article Summary</span></div>
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => alert("Opening editor...")}>Edit</Button>
                </div>
                <p className="text-deep leading-relaxed whitespace-pre-wrap">
                  {content.linkedin}
                </p>
                <div className="mt-6 flex gap-2"><Button className="rounded-full bg-polar text-white" onClick={() => alert("Submitted to Admin Dashboard for approval!")}>Submit for PR Approval</Button></div>
              </motion.div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-background/50">
              <Sparkles className="size-12 text-muted-foreground mb-4" />
              <p className="text-lg text-deep">Select a source document on the left and click Generate.</p>
              <p className="text-sm text-muted-foreground mt-2">The AI Studio will automatically write optimized copy for all platforms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
