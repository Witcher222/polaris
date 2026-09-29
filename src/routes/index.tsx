import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Play, Radio, Satellite, Waves, Loader2 } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AtlasMap, ContentCard, DetailModal, FeedCard, SectionIntro, assetImages } from "@/components/polaris";
import { pulse as pulseApi, stats as statsApi, items as itemsApi, type PulseData, type Stats, type Item } from "@/lib/api";
import { topics, type ResourceKind } from "@/lib/polaris-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "POLARIS — Discover the Science at the Ends of the Earth" }, { name: "description", content: "Explore polar expeditions, discoveries, datasets, publications, media and stories in the POLARIS living atlas." }, { property: "og:title", content: "POLARIS — Discover the Science at the Ends of the Earth" }, { property: "og:description", content: "A living atlas for polar science and outreach." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Home,
});

function Home() {
  const [activePost, setActivePost] = useState<string | null>(null);
  const [realStats, setRealStats] = useState<Stats | null>(null);
  const [pulseData, setPulseData] = useState<PulseData | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);

  useEffect(() => {
    // Fetch real stats
    statsApi.get().then(setRealStats).catch(console.error);
    // Fetch pulse
    pulseApi.get().then(setPulseData).catch(console.error);
    // Fetch recent items for feed
    itemsApi.list({ limit: "6" }).then(data => setRecentItems(data.items)).catch(console.error);
  }, []);

  const statsDisplay = realStats ? [
    [String(realStats.total), "Archive items"],
    [String(realStats.publications), "Publications"],
    [String(realStats.datasets), "Datasets"],
    [String(realStats.photos), "Photos"],
    [String(realStats.users || 1), "Researchers"],
  ] : [
    ["...", "Archive items"], ["...", "Publications"], ["...", "Datasets"], ["...", "Photos"], ["...", "Researchers"],
  ];

  const pulseItems = pulseData?.latestItems?.slice(0, 4).map(item => ({
    kind: item.type.toUpperCase(),
    tone: item.type === 'publication' ? 'teal' : item.type === 'dataset' ? 'aurora' : 'deep',
    text: item.title,
  })) || [];

  const feedItemsMapped = recentItems.slice(0, 3).map(item => ({
    title: item.title,
    meta: `${item.region || ''} · ${item.discipline || ''} · ${item.source || ''}`,
    tag: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    image: item.thumbnail_url || `https://picsum.photos/seed/${item.id}/800/600`,
  }));

  return <div>
    <section className="relative isolate overflow-hidden border-b border-border"><img src={assetImages.hero} alt="Research vessel crossing Antarctic sea ice beneath an aurora" width={1600} height={1000} className="absolute inset-0 -z-20 size-full object-cover object-center" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/20" /><div className="absolute inset-0 -z-10 atlas-grid opacity-40" /><div className="mx-auto flex min-h-[620px] max-w-[1440px] items-center px-5 py-20 lg:min-h-[690px] lg:px-8"><div className="max-w-2xl"><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[10px] uppercase tracking-[0.32em] text-teal">Polar Science Atlas · Live</motion.p><motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-5 font-display text-[18vw] leading-[0.82] tracking-tight text-polar sm:text-[9rem]">DISCOVER<br />THE ENDS<br /><span className="text-teal">OF EARTH.</span></motion.h1><motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-7 max-w-xl text-base leading-relaxed text-deep/80">A living atlas of polar expeditions, discoveries, research, datasets and stories — powered by real data from OpenAlex, NASA, Zenodo, and more.</motion.p><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-full bg-primary px-6 text-primary-foreground shadow-xl shadow-primary/20"><Link to="/explore">Explore polar science <ArrowUpRight /></Link></Button><Button asChild variant="outline" size="lg" className="rounded-full border-border bg-background/75 px-6 text-polar backdrop-blur"><Link to="/expeditions">Explore expeditions <ChevronRight /></Link></Button></motion.div></div></div><div className="absolute bottom-5 right-5 hidden items-center gap-3 rounded-full border border-border bg-background/80 px-4 py-2 backdrop-blur md:flex"><Radio className="size-4 text-teal" /><span className="font-mono text-[10px] uppercase tracking-widest text-deep">{realStats ? `${realStats.total} items in archive` : 'Loading...'}</span></div></section>
    <section className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 px-5 py-8 md:grid-cols-5 lg:px-8">{statsDisplay.map(([value, label], index) => <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-border bg-card px-4 py-4 shadow-sm"><span className="font-display text-3xl text-polar">{value}</span><p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-deep">{label}</p></motion.div>)}</section>
    <section className="mx-auto max-w-[1440px] px-5 pb-10 lg:px-8"><div className="mb-4 flex items-center gap-3"><span className="size-2 rounded-full bg-teal" style={{ animation: "pulse 2s infinite" }} /><h2 className="font-display text-2xl tracking-tight text-polar">POLAR PULSE</h2><span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-deep">Latest from archive</span></div><div className="flex gap-3 overflow-x-auto pb-2">{pulseItems.length > 0 ? pulseItems.map((item, index) => <motion.div key={item.text} initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="min-w-[270px] rounded-2xl border border-border bg-card p-4 shadow-sm"><p className={`font-mono text-[10px] text-${item.tone}`}>{item.kind}</p><p className="mt-2 text-sm font-medium leading-relaxed text-foreground line-clamp-2">{item.text}</p></motion.div>) : <div className="flex items-center gap-2 py-4"><Loader2 className="size-4 animate-spin text-teal" /><span className="text-sm text-muted-foreground">Loading pulse...</span></div>}</div></section>
    <section className="mx-auto max-w-[1440px] px-5 pb-14 lg:px-8"><div className="mb-4 flex flex-wrap items-center gap-4 border-b border-border pb-3"><h2 className="font-display text-2xl tracking-tight text-polar">POLAR FEED</h2><div className="ml-auto flex gap-1 text-sm font-medium"><span className="rounded-full bg-primary px-3 py-1 text-primary-foreground">For You</span><Link to="/media" className="rounded-full px-3 py-1 text-deep hover:bg-ice">Latest</Link><Link to="/expeditions" className="rounded-full px-3 py-1 text-deep hover:bg-ice">Expeditions</Link><Link to="/media" className="rounded-full px-3 py-1 text-deep hover:bg-ice">Photos</Link></div></div><div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">{feedItemsMapped.length > 0 ? feedItemsMapped.map((item, index) => <FeedCard key={item.title} item={item} index={index} onOpen={() => setActivePost(item.title)} />) : <div className="col-span-3 flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-teal" /></div>}</div></section>
    <section className="mx-auto max-w-[1440px] px-5 pb-14 lg:px-8"><div className="mb-4 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal">Browse the atlas</p><h2 className="mt-2 font-display text-3xl tracking-tight text-polar">EXPLORE TOPICS</h2></div><Link to="/explore" className="text-sm font-semibold text-deep">All topics →</Link></div><div className="flex flex-wrap gap-2">{topics.map((topic, index) => <Link key={topic} to="/explore" className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${index === 2 ? "border-teal/40 bg-teal/20 text-polar" : index === 4 ? "border-aurora/40 bg-aurora/15 text-polar" : "border-border bg-card text-deep"}`}>{topic}</Link>)}</div></section>
    <section className="mx-auto max-w-[1440px] px-5 pb-16 lg:px-8"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal">Live science infrastructure</p><h2 className="mt-2 font-display text-3xl tracking-tight text-polar">POLAR MAP</h2></div><Link to="/polar-map" className="text-sm font-semibold text-deep">Open full atlas →</Link></div><div className="grid gap-4 lg:grid-cols-[1fr_280px]"><AtlasMap compact /><div className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-[10px] uppercase tracking-widest text-teal">Station weather</p><h3 className="mt-2 font-display text-3xl text-polar">{pulseData?.stations?.[0]?.name || 'Loading...'}</h3>{pulseData?.stations?.[0]?.weather ? (<div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Temperature</span><span className="font-medium text-deep">{pulseData.stations[0].weather.temperature_2m}°C</span></div><div className="flex justify-between"><span className="text-muted-foreground">Wind Speed</span><span className="font-medium text-deep">{pulseData.stations[0].weather.wind_speed_10m} km/h</span></div><div className="flex justify-between"><span className="text-muted-foreground">Pressure</span><span className="font-medium text-deep">{pulseData.stations[0].weather.surface_pressure} hPa</span></div></div>) : <p className="mt-2 text-sm text-muted-foreground">Loading live weather...</p>}<Button asChild className="mt-5 w-full rounded-full bg-primary text-primary-foreground"><Link to="/polar-map">Open station <ChevronRight /></Link></Button></div></div></section>
    <section className="border-y border-border bg-paper/70"><SectionIntro eyebrow="A connected knowledge ecosystem" title="Every signal points somewhere." description="From a photograph to an expedition, researcher, dataset, publication and report — POLARIS keeps the relationships visible." action={<Button asChild variant="outline" className="rounded-full bg-card"><Link to="/knowledge">Open repository <ChevronRight /></Link></Button>} /><div className="mx-auto grid max-w-[1440px] gap-4 px-5 pb-16 md:grid-cols-3 lg:px-8"><ContentCard title={recentItems[0]?.title || "Loading..."} kind={(recentItems[0]?.type === 'publication' ? 'Publication' : recentItems[0]?.type === 'dataset' ? 'Dataset' : 'Media') as ResourceKind} meta={recentItems[0]?.region || ""} index={0} /><ContentCard title={recentItems[1]?.title || "Loading..."} kind={(recentItems[1]?.type === 'publication' ? 'Publication' : recentItems[1]?.type === 'dataset' ? 'Dataset' : 'Media') as ResourceKind} meta={recentItems[1]?.discipline || ""} index={1} /><ContentCard title={recentItems[2]?.title || "Loading..."} kind={(recentItems[2]?.type === 'publication' ? 'Publication' : recentItems[2]?.type === 'dataset' ? 'Dataset' : 'Media') as ResourceKind} meta={recentItems[2]?.source || ""} index={2} /></div></section>
    <footer className="border-t border-border bg-card"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between lg:px-8"><div><span className="font-display text-2xl tracking-tight text-polar">POLARIS</span><p className="mt-2 max-w-sm text-sm text-muted-foreground">Polar Science Knowledge & Outreach. Real data from OpenAlex, NASA, Zenodo, Wikimedia Commons.</p></div><div className="flex flex-wrap gap-4 text-sm text-muted-foreground"><Link to="/knowledge">Repository</Link><Link to="/polar-map">Polar Map</Link><Link to="/media">Media</Link><Link to="/outreach">Outreach</Link></div></div></footer>
    <AnimatePresence>{activePost && <DetailModal title={activePost} onClose={() => setActivePost(null)} />}</AnimatePresence>
  </div>;
}