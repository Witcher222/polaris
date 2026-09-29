import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, BookOpen, Share2, HelpCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { items as itemsApi, upload as uploadApi, type Item } from "@/lib/api";

export const Route = createFileRoute("/outreach")({
  component: Outreach,
});

function Outreach() {
  const [stories, setStories] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStory, setActiveStory] = useState<Item | null>(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isExpeditionOpen, setIsExpeditionOpen] = useState(false);
  const [quizState, setQuizState] = useState<'idle' | 'success' | 'error' | 'finished'>('idle');
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);

  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);

  useEffect(() => {
    const savedBadges = typeof window !== 'undefined' ? localStorage.getItem('polaris_badges') : null;
    if (savedBadges) {
      setBadges(JSON.parse(savedBadges));
    }
  }, []);

  const addBadge = (badge: string) => {
    if (!badges.includes(badge)) {
      const newBadges = [...badges, badge];
      setBadges(newBadges);
      localStorage.setItem('polaris_badges', JSON.stringify(newBadges));
    }
  };

  const quizQuestions = [
    {
      question: "How old is the oldest ice core ever recovered from Antarctica?",
      options: ["10,000 years old", "100,000 years old", "~800,000 years old", "2 million years old"],
      answerIndex: 2,
      fact: "The EPICA Dome C ice core drilled in Antarctica provides climate records dating back 800,000 years."
    },
    {
      question: "Which of these animals is NEVER found in the Arctic?",
      options: ["Polar Bear", "Walrus", "Penguin", "Narwhal"],
      answerIndex: 2,
      fact: "Penguins live almost exclusively in the Southern Hemisphere (Antarctica), while Polar bears live in the Arctic."
    },
    {
      question: "What percentage of the Earth's freshwater is stored in the Antarctic ice sheet?",
      options: ["20%", "50%", "70%", "90%"],
      answerIndex: 2,
      fact: "The Antarctic ice sheet contains about 70% of the world's freshwater."
    }
  ];

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const data = await itemsApi.list({ type: "story", limit: "9" });
        setStories(data.items);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const handleQuizAnswer = (selectedIndex: number) => {
    const currentQ = quizQuestions[quizIndex];
    if (!currentQ) return;
    const isCorrect = selectedIndex === currentQ.answerIndex;
    if (isCorrect) setScore(s => s + 1);
    setQuizState(isCorrect ? 'success' : 'error');
  };

  const nextQuestion = () => {
    if (quizIndex + 1 < quizQuestions.length) {
      setQuizIndex(i => i + 1);
      setQuizState('idle');
    } else {
      setQuizState('finished');
    }
  };

  const handleExpeditionJoin = (e: React.FormEvent) => {
    e.preventDefault();
    addBadge('Expedition Tracker');
    alert('Congratulations! You earned the "Expedition Tracker" badge!');
    setIsExpeditionOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-5 py-24 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <p className="font-mono text-sm uppercase tracking-widest text-teal mb-4 flex justify-center items-center gap-2"><BookOpen className="size-4" /> Polar Stories</p>
          <h1 className="font-display text-5xl sm:text-7xl tracking-tight text-polar">OUTREACH</h1>
          <p className="mt-6 text-xl text-deep/80 leading-relaxed">
            Bridging the gap between frontier science and global awareness. Read our editorial dispatches directly from the edge of the world.
          </p>
        </div>
        
        {/* Passport Widget */}
        <div className="bg-card border border-border rounded-[2rem] p-6 mb-12 flex flex-col md:flex-row items-center justify-between shadow-sm gap-6 mx-auto max-w-4xl">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-teal/10 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h3 className="font-display text-xl text-polar">Student Passport</h3>
              <p className="text-sm text-muted-foreground mt-1">Earn badges by completing interactive learning modules.</p>
            </div>
          </div>
          <div className="flex gap-4 bg-background p-3 rounded-2xl border border-border">
            <div className={`size-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${badges.includes('Glaciology Expert') ? 'border-teal bg-teal/10 scale-110 shadow-lg shadow-teal/20' : 'border-dashed border-border opacity-50 grayscale'}`} title="Glaciology Expert">
              ❄️
            </div>
            <div className={`size-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${badges.includes('Expedition Tracker') ? 'border-teal bg-teal/10 scale-110 shadow-lg shadow-teal/20' : 'border-dashed border-border opacity-50 grayscale'}`} title="Expedition Tracker">
              🧭
            </div>
            <div className={`size-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${badges.includes('Climate Ambassador') ? 'border-teal bg-teal/10 scale-110 shadow-lg shadow-teal/20' : 'border-dashed border-border opacity-50 grayscale'}`} title="Climate Ambassador">
              🌍
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="size-8 animate-spin text-teal" />
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No stories published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {stories.map((story, i) => (
              <motion.div 
                key={story.id} 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} 
                className="group rounded-3xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition duration-300 flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={story.thumbnail_url || `https://picsum.photos/seed/story${story.id}/800/600`} alt={story.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-polar">
                    {Math.max(1, Math.ceil((story.summary?.length || 500) / 1000))} min read
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-teal mb-3">{story.credit || "Editorial Team"}</p>
                    <h3 className="font-display text-2xl text-polar leading-snug">{story.title}</h3>
                    <p className="mt-3 text-deep/80 line-clamp-3">{story.abstract}</p>
                  </div>
                  <Button 
                    onClick={() => setActiveStory(story)}
                    variant="link" 
                    className="mt-6 px-0 text-teal self-start hover:text-polar"
                  >
                    Read Full Story <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-32 rounded-[2.5rem] bg-polar text-white overflow-hidden shadow-2xl relative">
          <div className="grid md:grid-cols-2">
            <div className="p-12 lg:p-20 relative z-10 flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-teal/40 to-transparent opacity-60" />
              <p className="relative z-10 font-mono text-sm uppercase tracking-widest text-teal mb-4">Smart Education Platform</p>
              <h2 className="relative z-10 font-display text-4xl sm:text-5xl leading-tight">Engage Classrooms with Polar Science</h2>
              <p className="relative z-10 mt-6 text-white/80 text-lg leading-relaxed max-w-md">
                Connect your students directly to live expeditions. Participate in interactive quizzes, earn digital glaciology badges, and track vessels in real-time.
              </p>
              <div className="relative z-10 mt-10 flex flex-wrap gap-4">
                <Button onClick={() => setIsExpeditionOpen(true)} className="rounded-full bg-white text-polar font-bold hover:bg-gray-100 shadow-xl h-14 px-8" size="lg">Join "Follow an Expedition"</Button>
                <Button onClick={() => { setIsQuizOpen(true); setQuizState('idle'); setQuizIndex(0); setScore(0); }} className="rounded-full border-2 border-white/20 bg-transparent text-white hover:bg-white/10 h-14 px-8" size="lg">Take a Quiz</Button>
              </div>
            </div>
            <div className="relative hidden md:block bg-ice h-full min-h-[500px]">
              <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1000&auto=format&fit=crop" alt="Students learning" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 grayscale contrast-150" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-polar/90" />
              
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="grid grid-cols-2 gap-6">
                  <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="bg-background/95 backdrop-blur-md rounded-3xl p-6 text-center shadow-2xl border border-white/10 transform -rotate-3 hover:rotate-0 transition duration-500">
                    <div className="size-16 mx-auto bg-gradient-to-br from-teal to-blue-500 rounded-full flex items-center justify-center text-3xl shadow-inner mb-4">🧊</div>
                    <p className="font-bold text-polar text-lg">Junior Glaciologist</p>
                    <p className="text-sm font-mono text-teal mt-1">Level 1 Badge Earned</p>
                  </motion.div>
                  <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-background/95 backdrop-blur-md rounded-3xl p-6 text-center shadow-2xl border border-white/10 transform translate-y-8 rotate-3 hover:rotate-0 transition duration-500">
                    <div className="size-16 mx-auto bg-gradient-to-br from-aurora to-purple-500 rounded-full flex items-center justify-center text-3xl shadow-inner mb-4">🐧</div>
                    <p className="font-bold text-polar text-lg">Wildlife Observer</p>
                    <p className="text-sm font-mono text-aurora mt-1">Quiz Passed: 95%</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Citizen Science Portal */}
        <div className="mt-20 pt-20 border-t border-border">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <p className="font-mono text-sm uppercase tracking-widest text-teal mb-4">Community Engagement</p>
              <h2 className="font-display text-4xl sm:text-5xl text-polar mb-6">Citizen Science Portal</h2>
              <p className="text-lg text-deep/80 leading-relaxed mb-8">
                Your local observations matter. Help researchers track climate shifts by submitting real-time data on unexpected wildlife sightings, local ice thickness, or severe weather events.
              </p>
              
              <div className="bg-card border border-border p-8 rounded-[2rem] shadow-sm">
                <form onSubmit={async (e) => { 
                  e.preventDefault(); 
                  setIsSubmittingObservation(true);
                  try {
                    const form = e.target as HTMLFormElement;
                    const type = (form.elements.namedItem('obsType') as HTMLSelectElement).value;
                    const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value;
                    
                    const formData = new FormData();
                    formData.append('title', `Citizen Science: ${type} at ${location}`);
                    formData.append('abstract', notes);
                    formData.append('type', 'activity');
                    formData.append('region', location);
                    formData.append('source', 'Citizen Science Portal');
                    
                    await uploadApi.file(formData);
                    alert("Observation submitted successfully! It is now pending review by our scientists. Thank you for contributing to polar science."); 
                    form.reset();
                  } catch (err) {
                    console.error(err);
                    alert('Failed to submit observation. Please try again.');
                  } finally {
                    setIsSubmittingObservation(false);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-polar">Observation Type</label>
                      <select name="obsType" className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-teal text-sm">
                        <option>Wildlife Sighting</option>
                        <option>Ice / Snow Condition</option>
                        <option>Extreme Weather</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-polar">Location</label>
                      <input name="location" required type="text" placeholder="e.g. Svalbard Coast" className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-teal text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-polar">Field Notes</label>
                    <textarea name="notes" required placeholder="Describe what you observed..." rows={3} className="w-full p-3 rounded-xl border border-border bg-background focus:outline-none focus:border-teal text-sm resize-none" />
                  </div>
                  <Button type="submit" disabled={isSubmittingObservation} className="w-full h-12 bg-teal hover:bg-teal/90 text-white font-bold rounded-xl text-lg mt-2">
                    {isSubmittingObservation ? "Submitting..." : "Submit Observation"}
                  </Button>
                </form>
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-teal/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />
              <img src="https://images.unsplash.com/photo-1518182170546-076616fdcbba?q=80&w=800&auto=format&fit=crop" alt="Citizen Science" className="relative z-10 w-full rounded-[2rem] shadow-2xl border border-border object-cover aspect-square md:aspect-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Story Reading Modal */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-card w-full max-w-3xl rounded-[2rem] overflow-hidden shadow-2xl border border-border my-auto relative max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-4 right-4 z-20 flex justify-end gap-2 pr-4 pt-4">
                <Button variant="secondary" size="icon" className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background shadow-md"><Share2 className="size-4 text-polar" /></Button>
                <Button variant="secondary" size="icon" onClick={() => setActiveStory(null)} className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background shadow-md"><X className="size-4 text-polar" /></Button>
              </div>

              <div className="aspect-[21/9] relative overflow-hidden bg-polar -mt-16">
                <img src={activeStory.thumbnail_url || `https://picsum.photos/seed/story${activeStory.id}/1200/500`} alt={activeStory.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-polar via-polar/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p className="text-xs font-mono uppercase tracking-widest text-teal mb-3">{activeStory.credit || "Editorial Team"} • {Math.max(1, Math.ceil((activeStory.summary?.length || 500) / 1000))} min read</p>
                  <h2 className="text-4xl sm:text-5xl font-display text-white leading-tight">{activeStory.title}</h2>
                </div>
              </div>
              
              <div className="p-8 sm:p-12 bg-background">
                <p className="text-xl text-polar font-medium italic leading-relaxed border-l-4 border-teal pl-6 mb-8">
                  "{activeStory.abstract}"
                </p>
                <div className="prose prose-lg prose-p:text-deep/90 prose-p:leading-relaxed max-w-none">
                  <p className="whitespace-pre-wrap">{activeStory.summary || "Content not available."}</p>
                </div>
                
                <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-full bg-ice flex items-center justify-center text-teal font-bold font-display text-xl">
                      {(activeStory.credit || "E").charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-polar text-sm">Written by</p>
                      <p className="text-sm text-deep">{activeStory.credit || "Editorial Team"}</p>
                    </div>
                  </div>
                  <Button onClick={() => setActiveStory(null)} variant="outline" className="rounded-full">Close Story</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quiz Modal */}
      <AnimatePresence>
        {isQuizOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/80 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-border p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-teal font-bold"><HelpCircle className="size-5" /> Pop Quiz!</div>
                <Button variant="ghost" size="icon" onClick={() => setIsQuizOpen(false)} className="rounded-full -mr-3 -mt-3"><X className="size-4" /></Button>
              </div>

              {quizState === 'idle' ? (
                <>
                  <p className="text-xs font-bold text-teal mb-2 uppercase tracking-widest">Question {quizIndex + 1} of {quizQuestions.length}</p>
                  <h3 className="font-display text-2xl text-polar mb-6">{quizQuestions[quizIndex]?.question}</h3>
                  <div className="space-y-3">
                    {quizQuestions[quizIndex]?.options?.map((opt, i) => (
                      <Button key={i} onClick={() => handleQuizAnswer(i)} variant="outline" className="w-full justify-start h-auto py-4 rounded-xl text-left font-normal hover:border-polar whitespace-normal">
                        {opt}
                      </Button>
                    ))}
                  </div>
                </>
              ) : quizState === 'success' || quizState === 'error' ? (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`size-20 rounded-full flex items-center justify-center mx-auto mb-4 ${quizState === 'success' ? 'bg-teal/20 text-teal' : 'bg-red-500/20 text-red-500'}`}>
                    {quizState === 'success' ? <CheckCircle2 className="size-10" /> : <X className="size-10" />}
                  </motion.div>
                  <h3 className={`font-display text-3xl mb-2 ${quizState === 'success' ? 'text-polar' : 'text-red-500'}`}>
                    {quizState === 'success' ? 'Correct!' : 'Not quite!'}
                  </h3>
                  <p className="text-deep mb-6 text-sm leading-relaxed border-l-2 border-border pl-4 text-left">
                    {quizQuestions[quizIndex]?.fact}
                  </p>
                  <Button onClick={nextQuestion} className="rounded-full bg-teal text-white w-full h-12">
                    {quizIndex + 1 < quizQuestions.length ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-5xl mb-4">{score === quizQuestions.length ? '🏆' : '📚'}</div>
                  <h3 className="font-display text-3xl text-polar mb-2">Quiz Complete!</h3>
                  <p className="text-deep mb-6">You scored {score} out of {quizQuestions.length}.</p>
                  <Button onClick={() => { 
                    if (score === quizQuestions.length) {
                      addBadge('Glaciology Expert');
                      alert('Perfect score! You earned the "Glaciology Expert" badge!');
                    }
                    setIsQuizOpen(false); 
                  }} className="rounded-full bg-polar text-white w-full h-12">Close</Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Join Expedition Modal */}
      <AnimatePresence>
        {isExpeditionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-polar/80 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card w-full max-w-md rounded-[2rem] overflow-hidden shadow-2xl border border-border p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl text-polar">Register Classroom</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsExpeditionOpen(false)} className="rounded-full -mr-3 -mt-3"><X className="size-4" /></Button>
              </div>
              <p className="text-sm text-deep mb-6">Sign up to receive live weekly telemetry drops and video journals directly from the 43-ISEA vessel.</p>
              <form onSubmit={handleExpeditionJoin} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Teacher Name</label>
                  <input required type="text" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">School Name</label>
                  <input required type="text" className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Grade Level</label>
                  <select className="w-full mt-1 bg-background border border-border rounded-xl px-4 py-3 text-polar outline-none focus:border-teal">
                    <option>Elementary School</option>
                    <option>Middle School</option>
                    <option>High School</option>
                  </select>
                </div>
                <Button type="submit" className="w-full rounded-full bg-teal text-white h-12 mt-4 shadow-lg shadow-teal/20">Join Expedition Tracker</Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
