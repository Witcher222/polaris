import { AnimatePresence, motion } from "framer-motion";
import { Bell, Bookmark, ChevronRight, Compass, Database, FileText, Globe2, Grid2X2, Layers3, Map, Menu, Moon, Search, Sparkles, Sun, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/polaris-hero.jpg";
import fieldImage from "@/assets/polaris-field.jpg";
import { cn } from "@/lib/utils";
import { datasets, expeditions, feedItems, publications, resources, researchers, stations, topics, type ResourceKind } from "@/lib/polaris-data";

export const assetImages = { hero: heroImage, field: fieldImage } as const;

const navItems = [
  ["Explore", "/explore", Compass], ["Expeditions", "/expeditions", Layers3], ["Knowledge", "/knowledge", FileText], ["Datasets", "/datasets", Database], ["Publications", "/publications", FileText], ["Media", "/media", Grid2X2], ["Polar Map", "/polar-map", Map], ["Outreach", "/outreach", Sparkles],
] as const;

export function PolarisShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [night, setNight] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } if (event.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <div className={cn("min-h-screen bg-background text-foreground transition-colors", night && "dark")}>
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 px-5 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="POLARIS home">
          <span className="grid size-8 place-items-center rounded-full bg-polar font-display text-sm text-icebright">P</span>
          <span className="font-display text-2xl tracking-tight text-polar">POLARIS</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-deep lg:flex">
          <Link to="/" activeProps={{ className: "bg-primary/10 text-polar" }} className="rounded-full px-3 py-1.5 hover:bg-primary/10">Home</Link>
          {navItems.map(([label, to]) => <Link key={label} to={to} activeProps={{ className: "bg-primary/10 text-polar" }} className="rounded-full px-3 py-1.5 hover:bg-primary/10">{label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)} className="hidden h-9 gap-2 rounded-full bg-ice font-mono text-xs text-deep hover:bg-icebright md:flex"><Search />⌘K Search</Button>
          <Button variant="ghost" size="icon" aria-label="Toggle polar night" onClick={() => setNight((value) => !value)} className="rounded-full text-deep hover:bg-ice">{night ? <Sun /> : <Moon />}</Button>
          <Button variant="ghost" size="icon" aria-label="Notifications" className="hidden rounded-full text-deep hover:bg-ice sm:inline-flex"><Bell /></Button>
          
          {/* Persona Switcher Dropdown */}
          <div className="relative group hidden sm:block">
            <Button variant="outline" className="rounded-full bg-teal/10 text-teal border-teal/20 hover:bg-teal/20 gap-2">
              Switch Persona <ChevronRight className="size-3 rotate-90" />
            </Button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col p-2">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest px-3 py-2">Demo Workflows</span>
              <Link to="/dashboard" className="px-3 py-2 text-sm text-deep hover:bg-ice rounded-lg hover:text-polar flex items-center gap-2"><Sparkles className="size-4" /> Scientist View</Link>
              <Link to="/admin" className="px-3 py-2 text-sm text-deep hover:bg-ice rounded-lg hover:text-polar flex items-center gap-2"><Database className="size-4" /> Admin View</Link>
              <Link to="/" className="px-3 py-2 text-sm text-deep hover:bg-ice rounded-lg hover:text-polar flex items-center gap-2"><Globe2 className="size-4" /> Public View</Link>
            </div>
          </div>

          <Button variant="ghost" size="icon" aria-label="Open navigation" onClick={() => setMobileOpen((value) => !value)} className="rounded-full text-deep hover:bg-ice lg:hidden"><Menu /></Button>
          <span className="hidden size-9 rounded-full bg-icebright ring-1 ring-border sm:block" />
        </div>
      </div>
      <AnimatePresence>{mobileOpen && <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border bg-background px-5 py-3 lg:hidden">
        <div className="grid grid-cols-2 gap-2 text-sm font-medium">{[["Home", "/"], ...navItems.map(([label, to]) => [label, to] as const)].map(([label, to]) => <Link key={label} to={to} onClick={() => setMobileOpen(false)} className={cn("rounded-lg px-3 py-2", pathname === to ? "bg-primary text-primary-foreground" : "bg-ice/60 text-deep")}>{label}</Link>)}</div>
      </motion.nav>}</AnimatePresence>
    </header>
    <main className="pb-20 lg:pb-0">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 py-2 backdrop-blur-md lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-5 gap-1">{[["Home", "/"], ["Explore", "/explore"], ["Feed", "/media"], ["Map", "/polar-map"], ["Profile", "/admin"]].map(([label, to], index) => { const Icon = [Globe2, Compass, Grid2X2, Map, Bookmark][index] as any; return <Link key={label} to={to as any} className={cn("flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium", pathname === (to as string) ? "bg-primary/10 text-polar" : "text-muted-foreground")}><Icon className="size-4" />{label}</Link>; })}</div></nav>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
  </div>;
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => { const all = [...expeditions, ...datasets, ...publications, ...researchers, ...stations, ...resources].map((i: any) => i?.title || i?.name || i) as string[]; return query ? all.filter((item) => String(item).toLowerCase().includes(query.toLowerCase())).slice(0, 8) : ["Aurora Traverse 2026", "Arctic Sea-Ice Extent 1979–2025", "Basal melt rates revised for 2026", "Halley VI", "Dr. Anika Voss"]; }, [query]);
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[70] bg-polar/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} onClick={(event) => event.stopPropagation()} className="mx-auto mt-[8vh] max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"><div className="flex items-center gap-3 border-b border-border px-5 py-4"><Search className="size-5 text-teal" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search expeditions, data, people, places..." className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" /><Button variant="ghost" size="icon" aria-label="Close search" onClick={onClose}><X /></Button></div><div className="p-3"><p className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{query ? "Results" : "Recent & suggested"}</p>{results.map((result, idx) => <button key={idx} onClick={onClose} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-deep hover:bg-ice"><ChevronRight className="size-4 text-teal" />{String(result)}</button>)}</div></motion.div></motion.div>}</AnimatePresence>;
}

export function SectionIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-12 lg:px-8 lg:pt-16"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[10px] uppercase tracking-[0.28em] text-teal">{eyebrow}</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-[0.9] tracking-tight text-polar md:text-7xl">{title}</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p></div>{action}</div></div>;
}

export function FilterBar({ filters = ["All regions", "Any year", "Research field", "Institution"], placeholder = "Search the archive" }: { filters?: string[]; placeholder?: string }) {
  return <div className="mx-auto flex max-w-[1440px] flex-wrap gap-2 px-5 pb-8 lg:px-8"><div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5"><Search className="size-4 text-teal" /><input placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div>{filters.map((filter) => <Button key={filter} variant="outline" className="rounded-full border-border bg-card text-xs font-medium text-deep hover:bg-ice">{filter}<ChevronRight className="size-3" /></Button>)}</div>;
}

export function FeedCard({ item, index = 0, onOpen }: { item: { title: string; meta: string; tag: string; image: string }; index?: number; onOpen?: () => void }) {
  const imgSrc = item.image.startsWith('http') ? item.image : assetImages[item.image as keyof typeof assetImages];
  return <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.05 }} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><button onClick={onOpen} className="block w-full text-left"><div className="relative aspect-[4/3] overflow-hidden bg-ice"><img src={imgSrc} alt={item.title} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-deep backdrop-blur">{item.tag}</div><span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-background/80 text-deep backdrop-blur"><Bookmark className="size-4" /></span></div><div className="p-4"><h3 className="font-medium text-foreground line-clamp-2">{item.title}</h3><p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">{item.meta}</p><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>POLARIS field note</span><span className="text-teal">View story →</span></div></div></button></motion.article>;
}

export function ContentCard({ title, kind, meta, index = 0 }: { title: string; kind: ResourceKind; meta: string; index?: number }) {
  return <motion.article initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.04 }} className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><div className="flex items-start justify-between gap-3"><span className="rounded-full bg-ice px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-deep">{kind}</span><Button variant="ghost" size="icon" aria-label={`Save ${title}`} className="-mr-2 -mt-2 rounded-full text-muted-foreground hover:bg-ice"><Bookmark className="size-4" /></Button></div><h3 className="mt-5 font-medium leading-snug text-foreground group-hover:text-deep">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{meta}</p><div className="mt-5 flex items-center justify-between border-t border-border pt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"><span>Demo content</span><span className="text-teal">Open →</span></div></motion.article>;
}

export function AtlasMap({ compact = false }: { compact?: boolean }) {
  const markers = [[18, 34, "teal"], [37, 57, "aurora"], [55, 28, "deep"], [68, 62, "teal"], [82, 40, "aurora"], [47, 78, "deep"]] as const;
  return <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-ice", compact ? "aspect-[2/1]" : "min-h-[520px]")}><div className="absolute inset-0 atlas-grid opacity-80" /><div className="absolute inset-[10%] rounded-[50%] border border-deep/20 bg-background/25 shadow-inner"><div className="absolute inset-[8%] rounded-[50%] border border-deep/10" /><div className="absolute left-[28%] top-[20%] h-[58%] w-[44%] rotate-[18deg] rounded-[48%] bg-icebright/80" /><div className="absolute bottom-[18%] left-[16%] h-[20%] w-[60%] rotate-[-8deg] rounded-[50%] bg-card/70" /></div>{markers.map(([left, top, tone]) => <motion.span key={`${left}-${top}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: left / 100 }} className={cn("absolute grid size-3 place-items-center rounded-full", tone === "teal" && "bg-teal", tone === "aurora" && "bg-aurora", tone === "deep" && "bg-deep")} style={{ left: `${left}%`, top: `${top}%`, animation: "pulse 2.4s infinite" }} />)}<div className="absolute bottom-4 left-4 rounded-xl border border-border bg-background/85 px-4 py-3 backdrop-blur"><p className="font-mono text-[9px] uppercase tracking-widest text-teal">LIVE ATLAS</p><p className="mt-1 text-sm font-medium text-polar">42 active signals</p></div><div className="absolute right-4 top-4 flex gap-2"><Button variant="outline" size="icon" aria-label="Map layers" className="rounded-full bg-background/85 backdrop-blur"><Layers3 /></Button><Button variant="outline" size="icon" aria-label="Globe view" className="rounded-full bg-background/85 backdrop-blur"><Globe2 /></Button></div></div>;
}

export function DetailModal({ title, onClose }: { title: string; onClose: () => void }) {
  return <motion.div className="fixed inset-0 z-[65] grid place-items-center bg-polar/30 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}><motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-widest text-teal">POLARIS story view</p><h2 className="mt-2 font-display text-4xl text-polar">{title}</h2></div><Button variant="ghost" size="icon" aria-label="Close details" onClick={onClose}><X /></Button></div><img src={heroImage} alt="Polar research vessel among sea ice" width={1600} height={1000} className="mt-6 aspect-[16/8] w-full rounded-xl object-cover" /><div className="mt-5 grid gap-4 sm:grid-cols-3"><div><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Location</p><p className="mt-1 text-sm text-deep">Ross Sea sector</p></div><div><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Expedition</p><p className="mt-1 text-sm text-deep">POL-26 / Kestrel</p></div><div><p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Captured</p><p className="mt-1 text-sm text-deep">14 Feb 2026</p></div></div><p className="mt-6 leading-relaxed text-muted-foreground">Demonstration content showing how a media item connects outward to its expedition, researchers, dataset and related publication.</p><div className="mt-6 flex flex-wrap gap-2"><Button asChild onClick={onClose} className="rounded-full bg-primary text-primary-foreground"><Link to="/expeditions">Open expedition</Link></Button><Button asChild variant="outline" onClick={onClose} className="rounded-full"><Link to="/knowledge">Related resources</Link></Button></div></motion.div></motion.div>;
}
