import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, CheckCircle, Clock, Search, Sparkles, BarChart3, Settings, CheckCircle2, XCircle, Upload, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { approvals as approvalsApi, admin as adminApi, stats as statsApi, auth, setToken, getToken, type Item, type Draft, type Stats } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());
  const [loginEmail, setLoginEmail] = useState("admin@ncpor.res.in");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [loginError, setLoginError] = useState("");
  
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [pendingDrafts, setPendingDrafts] = useState<Draft[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"approvals" | "ingest" | "users">("approvals");
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await auth.login(loginEmail, loginPassword);
      setToken(res.token);
      setIsLoggedIn(true);
      setLoginError("");
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appData, statsData] = await Promise.all([
        approvalsApi.list(),
        statsApi.get(),
      ]);
      setPendingItems(appData.items);
      setPendingDrafts(appData.drafts);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isLoggedIn) fetchData(); }, [isLoggedIn]);

  const handleApprove = async (type: string, id: number) => {
    setProcessingId(`${type}-${id}`);
    try {
      await approvalsApi.approve(type, id);
      fetchData();
    } catch (err) {
      console.error("Approval failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (type: string, id: number) => {
    setProcessingId(`${type}-${id}`);
    try {
      await approvalsApi.reject(type, id);
      fetchData();
    } catch (err) {
      console.error("Rejection failed:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleIngestAll = async () => {
    setIngesting(true);
    setIngestResult("");
    try {
      const res = await adminApi.ingestAll();
      setIngestResult(res.message);
      // Fetch stats to show the newly created "Running..." jobs
      setTimeout(fetchData, 1000);
    } catch (err: any) {
      setIngestResult(err.message || "Ingestion failed");
    } finally {
      setIngesting(false);
    }
  };

  // Login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-8 rounded-3xl border border-border bg-card shadow-xl">
          <h1 className="font-display text-3xl text-polar mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm mb-6">Sign in to access the POLARIS admin dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</label>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Password</label>
              <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
            </div>
            {loginError && <p className="text-sm text-red-500">{loginError}</p>}
            <Button type="submit" className="w-full rounded-full bg-polar text-white h-12">Sign In</Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-10 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-polar">ADMIN DASHBOARD</h1>
            <p className="mt-1 text-muted-foreground">Manage content, approvals, and data ingestion.</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => { setToken(null); setIsLoggedIn(false); }}>Logout</Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="font-display text-3xl text-polar">{stats.total}</span>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">Total Items</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="font-display text-3xl text-polar">{stats.publications}</span>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">Publications</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="font-display text-3xl text-polar">{stats.datasets}</span>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">Datasets</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="font-display text-3xl text-polar">{stats.photos}</span>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">Photos</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className="font-display text-3xl text-polar">{stats.videos}</span>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">Videos</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["approvals", "ingest", "users"] as const).map(tab => (
            <Button key={tab} variant={activeTab === tab ? "default" : "outline"} className="rounded-full capitalize" onClick={() => setActiveTab(tab)}>{tab}</Button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
          </div>
        ) : (
          <>
            {/* Approvals Tab */}
            {activeTab === "approvals" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-polar mb-4">Pending Approvals ({pendingItems.length + pendingDrafts.length})</h2>
                
                {pendingItems.length === 0 && pendingDrafts.length === 0 && (
                  <div className="text-center py-12 rounded-2xl border border-border bg-card">
                    <CheckCircle className="size-10 text-teal mx-auto mb-3" />
                    <p className="text-muted-foreground">All caught up! No pending approvals.</p>
                  </div>
                )}
                
                {pendingItems.map(item => (
                  <motion.div key={`item-${item.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-teal">{item.type} · Item #{item.id}</span>
                        <h3 className="text-lg font-semibold text-polar mt-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">{item.source} · {item.created_at}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full text-red-500 border-red-200" onClick={() => handleReject("item", item.id)} disabled={processingId === `item-${item.id}`}>
                          <XCircle className="size-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="rounded-full bg-teal text-white" onClick={() => handleApprove("item", item.id)} disabled={processingId === `item-${item.id}`}>
                          {processingId === `item-${item.id}` ? <Loader2 className="size-4 animate-spin mr-1" /> : <CheckCircle2 className="size-4 mr-1" />} Approve
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {pendingDrafts.map(draft => (
                  <motion.div key={`draft-${draft.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-widest text-aurora">Content Draft · {draft.channel}</span>
                        <h3 className="text-lg font-semibold text-polar mt-1">{draft.item_title || `Draft #${draft.id}`}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{draft.body?.substring(0, 150)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="rounded-full text-red-500 border-red-200" onClick={() => handleReject("draft", draft.id)}>
                          <XCircle className="size-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="rounded-full bg-teal text-white" onClick={() => handleApprove("draft", draft.id)}>
                          <CheckCircle2 className="size-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Ingestion Tab */}
            {activeTab === "ingest" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-polar mb-4">Data Ingestion</h2>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-muted-foreground mb-4">Run data ingestion from all configured sources (OpenAlex, Zenodo, NASA CMR, NASA Images, Wikimedia Commons).</p>
                  <Button className="rounded-full bg-polar text-white" onClick={handleIngestAll} disabled={ingesting}>
                    {ingesting ? <><Loader2 className="size-4 animate-spin mr-2" /> Running...</> : <><RefreshCw className="size-4 mr-2" /> Run Full Ingestion</>}
                  </Button>
                  {ingestResult && <p className="mt-4 text-sm text-teal">{ingestResult}</p>}
                </div>
                
                <h3 className="font-display text-xl text-polar mt-8 mb-4">Recent Ingestion Runs</h3>
                <div className="space-y-3">
                  {stats?.ingestRuns && stats.ingestRuns.length > 0 ? (
                    stats.ingestRuns.map(run => (
                      <div key={run.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-polar capitalize">{run.source.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(run.started_at).toLocaleString()} 
                            {run.finished_at ? ` - ${new Date(run.finished_at).toLocaleString()}` : ' - In Progress...'}
                          </p>
                        </div>
                        <div className="text-right">
                          {run.error ? (
                            <span className="text-red-500 text-sm font-medium">Failed: {run.error}</span>
                          ) : run.finished_at ? (
                            <div className="flex gap-4 text-sm font-medium">
                              <span className="text-teal">Fetched: {run.fetched || 0}</span>
                              <span className="text-polar">Inserted: {run.inserted || 0}</span>
                            </div>
                          ) : (
                            <span className="text-amber-500 text-sm font-medium animate-pulse">Running...</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No recent ingestion runs.</p>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-polar mb-4">Users ({stats?.users || 0})</h2>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-muted-foreground">User management coming soon. Currently {stats?.users || 0} user(s) registered.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
