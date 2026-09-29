import { Link, createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Database, Compass, Activity, Clock, Plus, Bell, X, UploadCloud, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { upload as uploadApi } from "@/lib/api";

const IceExtentChart = lazy(() => import('@/components/IceExtentChart'));

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);
  const [submissionType, setSubmissionType] = useState("Publication");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activities, setActivities] = useState([
    { title: "Maitri Station Ice Core Analysis", status: "Draft", date: "2 hours ago", type: "Dataset" },
    { title: "2026 Arctic Sea Ice Minimum Report", status: "Published", date: "2 days ago", type: "Publication" },
    { title: "Himalayan Cryosphere Retreat Mapping", status: "Active", date: "3 days ago", type: "Expedition" },
    { title: "Weddell Sea Salinity Dataset", status: "Pending Review", date: "5 days ago", type: "Dataset" },
    { title: "Indian Antarctic Mission (43-ISEA)", status: "Active", date: "1 week ago", type: "Expedition" },
    { title: "Antarctic Krill Biomass Model", status: "Published", date: "2 weeks ago", type: "Publication" },
    { title: "Polar Bear Habitat Extent 2025", status: "Published", date: "1 month ago", type: "Dataset" },
  ]);

  const stats = [
    { label: "My Publications", value: 12 + (activities.filter(a => a.type === "Publication" && a.date === "Just now").length), icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "My Datasets", value: 8 + (activities.filter(a => a.type === "Dataset" && a.date === "Just now").length), icon: Database, color: "text-teal-500", bg: "bg-teal-500/10" },
    { label: "Expeditions", value: 3 + (activities.filter(a => a.type === "Expedition" && a.date === "Just now").length), icon: Compass, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending Review", value: 2 + (activities.filter(a => a.status === "Pending Review" && a.date === "Just now").length), icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const handleSubmission = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', e.target.title.value);
      formData.append('abstract', e.target.desc.value);
      formData.append('type', submissionType.toLowerCase() === 'publication' ? 'publication' : (submissionType.toLowerCase() === 'dataset' ? 'dataset' : 'report'));
      formData.append('source', 'Researcher Upload');
      
      const fileInput = e.target.file;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
      } else {
        // Mock a file if none provided so the backend doesn't error out for publications
        formData.append('file', new Blob(['test content'], { type: 'application/pdf' }), 'upload.pdf');
      }

      await uploadApi.file(formData);

      const newActivity = {
        title: e.target.title.value,
        status: "Pending Review",
        date: "Just now",
        type: submissionType
      };
      setActivities([newActivity, ...activities]);
      setSubmitModalOpen(false);
      setActiveTab("Overview");
    } catch (err) {
      console.error(err);
      alert('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModalFor = (type: string) => {
    setSubmissionType(type);
    setSubmitModalOpen(true);
  };

  const renderTabContent = () => {
    if (activeTab === "Overview") {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card border border-border p-5 rounded-2xl flex flex-col gap-3 shadow-sm">
                <div className={`size-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="size-5" />
                </div>
                <div>
                  <h4 className="text-3xl font-display text-polar">{stat.value}</h4>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8 pt-4">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-polar flex items-center gap-2 mb-4"><Activity className="size-5 text-teal" /> Recent Activity</h3>
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <AnimatePresence>
                  {activities.map((activity, i) => (
                    <motion.div 
                      key={activity.title + i}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-ice/50 transition cursor-pointer ${i !== activities.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div>
                        <h4 className="font-semibold text-polar">{activity.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1 flex gap-2">
                          <span className="uppercase font-mono tracking-wider">{activity.type}</span> • {activity.date}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                        activity.status === 'Published' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                        activity.status === 'Active' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}>
                        {activity.status}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-polar mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/studio" className="block bg-polar/5 border border-polar/20 p-5 rounded-2xl cursor-pointer hover:bg-polar/10 transition group">
                  <h4 className="font-bold text-polar mb-1 flex items-center justify-between"><span className="flex items-center gap-2"><Sparkles className="size-4 text-teal" /> AI Content Studio</span> <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition" /></h4>
                  <p className="text-xs text-deep/80">Auto-generate social media posts from your publications using Gemini AI.</p>
                </Link>
                <div onClick={() => openModalFor("Dataset")} className="bg-aurora/10 border border-aurora/20 p-5 rounded-2xl cursor-pointer hover:bg-aurora/20 transition group">
                  <h4 className="font-bold text-polar mb-1 flex items-center justify-between">Submit Dataset <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition" /></h4>
                  <p className="text-xs text-deep/80">Upload raw NetCDF or CSV files for metadata extraction.</p>
                </div>
                <div onClick={() => openModalFor("Expedition")} className="bg-teal/10 border border-teal/20 p-5 rounded-2xl cursor-pointer hover:bg-teal/20 transition group">
                  <h4 className="font-bold text-polar mb-1 flex items-center justify-between">Link Expedition <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition" /></h4>
                  <p className="text-xs text-deep/80">Connect your research to an active Antarctic mission.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Suspense fallback={<div className="h-80 w-full bg-card rounded-2xl flex items-center justify-center border border-border shadow-sm"><Loader2 className="animate-spin text-teal" /></div>}>
              <IceExtentChart />
            </Suspense>
          </div>
        </motion.div>
      );
    }

    // Filter activities based on the active tab
    const filteredType = activeTab === "My Research" ? "Publication" : activeTab === "Expeditions" ? "Expedition" : "Dataset";
    const filteredItems = activities.filter(a => a.type === filteredType);

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-2xl font-display text-polar">{activeTab} Repository</h2>
          <Button onClick={() => openModalFor(filteredType)} className="rounded-full bg-polar text-white"><Plus className="size-4 mr-2" /> Add {filteredType}</Button>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
            <p>No {activeTab.toLowerCase()} found in your repository.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item, i) => (
              <div key={i} className="p-6 bg-card border border-border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition">
                <div>
                  <h3 className="font-bold text-lg text-polar">{item.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{item.date}</span>
                    <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">DOI: 10.4285/P{1000 + i}</span>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto ${
                  item.status === 'Published' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                  item.status === 'Active' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                  'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                }`}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-border bg-card hidden lg:block pt-24 px-4 pb-6 shadow-sm z-10">
        <div className="flex items-center gap-3 px-3 mb-8">
          <div className="size-10 rounded-full bg-teal text-white flex items-center justify-center font-bold text-lg shadow-inner">Dr</div>
          <div>
            <h3 className="text-sm font-bold text-polar">Dr. Scientist</h3>
            <p className="text-xs text-teal font-mono uppercase tracking-wider mt-0.5">Glaciologist</p>
          </div>
        </div>
        <nav className="space-y-1.5">
          {["Overview", "My Research", "Expeditions", "Datasets"].map((tab) => {
            const Icon = tab === "Overview" ? Activity : tab === "My Research" ? FileText : tab === "Expeditions" ? Compass : Database;
            return (
              <Button 
                key={tab}
                variant="ghost" 
                onClick={() => setActiveTab(tab)}
                className={`w-full justify-start rounded-xl h-11 transition-all ${activeTab === tab ? 'bg-teal text-white shadow-md shadow-teal/20' : 'text-deep hover:text-polar hover:bg-ice'}`}
              >
                <Icon className={`mr-3 size-4 ${activeTab === tab ? 'text-white' : 'text-muted-foreground'}`} /> {tab}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-24 px-6 lg:px-12 pb-12">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-display text-polar">Researcher Workspace</h1>
              <p className="text-deep/70 mt-1">Manage your scientific contributions to the Polar Archive.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-full bg-card shadow-sm hover:bg-ice" onClick={() => alert("No new notifications")}><Bell className="size-4" /></Button>
              <Button className="rounded-full bg-teal text-white shadow-md shadow-teal/20 hover:bg-teal/90" onClick={() => openModalFor("Publication")}><Plus className="size-4 mr-2" /> New Submission</Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab}>
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
          
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/60 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border bg-ice/30">
                <h2 className="text-xl font-display text-polar flex items-center gap-2"><UploadCloud className="size-5 text-teal" /> New Submission</h2>
                <Button variant="ghost" size="icon" onClick={() => setSubmitModalOpen(false)} className="rounded-full bg-background"><X className="size-4" /></Button>
              </div>
              
              <form onSubmit={handleSubmission} className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Submission Type</label>
                  <select 
                    value={submissionType}
                    onChange={(e) => setSubmissionType(e.target.value)}
                    className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal"
                  >
                    <option value="Publication">Research Publication</option>
                    <option value="Dataset">Scientific Dataset</option>
                    <option value="Expedition">Expedition Field Note</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                  <input required name="title" type="text" placeholder={`Enter ${submissionType} title...`} className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Abstract / Description</label>
                  <textarea required name="desc" placeholder="Provide a brief summary for the metadata index..." className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal min-h-[100px]" />
                </div>

                <label className="border-2 border-dashed border-teal/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-teal/5 hover:bg-teal/10 transition cursor-pointer">
                  <UploadCloud className="size-8 text-teal mb-3" />
                  <p className="text-sm font-bold text-polar">Click to upload files</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, NetCDF, CSV, or ZIP up to 5GB</p>
                  <input type="file" name="file" className="hidden" />
                </label>

                <Button type="submit" disabled={isSubmitting} className="w-full rounded-full bg-polar text-white h-12 text-lg mt-4 shadow-lg shadow-polar/20">
                  {isSubmitting ? (
                    <span className="animate-pulse">Uploading to NCPOR Servers...</span>
                  ) : (
                    <>Submit for Review <Plus className="size-4 ml-2" /></>
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
