import { motion } from "motion/react";
import { 
  ArrowRight, Activity, BrainCircuit, 
  Map, Video, Zap, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06080F] text-foreground overflow-hidden selection:bg-cyan-500/30 font-sans">
      
      {/* Background abstract elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-900/10 blur-[100px] rounded-full mix-blend-screen" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} 
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center p-[1px]">
               <div className="w-full h-full bg-black/50 rounded-[7px] flex items-center justify-center backdrop-blur-sm">
                  <span className="text-cyan-400 font-bold font-mono text-lg">A</span>
               </div>
            </div>
            <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              TrafficOS
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Platform</a>
            <a href="#solution" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Solution</a>
            <Link to="/dashboard" className="group flex items-center gap-2 text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full hover:bg-cyan-500/20 transition-all">
              Launch Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={stagger}
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5" />
              Smarter City Traffic Management
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Solve <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">Congestion.</span><br />
              Automate <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Flow.</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-[17px] text-muted-foreground leading-relaxed max-w-xl">
              Urban traffic congestion is a major challenge in growing cities, often caused by static traffic signal systems that cannot adapt to changing traffic conditions. Inefficient signal timing leads to longer travel times, increased fuel consumption, and higher carbon emissions, impacting both urban mobility and environmental sustainability. 
              <br/><br/>
              The objective of this challenge is to design an intelligent traffic management solution capable of analyzing real-time vehicle density, traffic camera feeds, and road network data to dynamically optimize traffic signal timings. The system should help improve traffic flow, reduce congestion, and provide a monitoring dashboard for smarter and more sustainable city traffic management.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-wrap items-center gap-4 pt-4">
              <Link 
                to="/dashboard" 
                className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                Enter Platform
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features" 
                className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                How it works
              </a>
            </motion.div>

            <motion.div variants={fadeIn} className="pt-8 flex items-center gap-6 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time AI</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Dynamic Optimization</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Predictive Analytics</span>
            </motion.div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full" />
            <div className="relative bg-[#0c0f1a] rounded-2xl border border-white/10 p-2 shadow-2xl overflow-hidden group">
               {/* Mock Dashboard Sneak Peek */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f1a] via-transparent to-transparent z-10 pointer-events-none" />
               <div className="bg-[#06080F] rounded-xl border border-white/5 overflow-hidden">
                  <div className="h-8 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                     <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                     <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="p-6 space-y-4">
                     <div className="flex gap-4">
                        <div className="w-1/3 h-24 rounded-lg border border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden">
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
                           <div className="p-4 relative z-10">
                              <div className="text-emerald-400 text-xs font-mono mb-1">OPT_SCORE</div>
                              <div className="text-3xl font-light text-white">98.4%</div>
                           </div>
                        </div>
                        <div className="w-2/3 h-24 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center p-4">
                           <div className="w-full flex items-end gap-1 h-full opacity-50">
                              {[30, 40, 25, 50, 60, 45, 80, 55, 70, 40, 60].map((h, i) => (
                                <motion.div 
                                  key={i} 
                                  initial={{ height: 0 }} 
                                  animate={{ height: `${h}%` }}
                                  transition={{ delay: 0.5 + i * 0.05, duration: 1 }}
                                  className="flex-1 bg-cyan-500/40 rounded-t-sm" 
                                />
                              ))}
                           </div>
                        </div>
                     </div>
                     <div className="h-48 rounded-lg border border-white/5 bg-white/5 relative overflow-hidden flex items-center justify-center">
                        <Map className="w-12 h-12 text-white/10" />
                        <div className="absolute w-6 h-6 rounded-full border border-emerald-500 bg-emerald-500/20 top-1/3 left-1/4 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <div className="absolute w-6 h-6 rounded-full border border-red-500 bg-red-500/20 bottom-1/3 right-1/4 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-[#0a0d17] border-y border-white/5 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">The Solution to Static Timing</h2>
            <p className="text-lg text-muted-foreground">
              Inefficient signal timing leads to longer travel times and higher carbon emissions. TrafficOS brings city grids to life with reactive intelligence.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<BrainCircuit className="w-6 h-6 text-cyan-400" />}
              title="Dynamic AI Engine"
              desc="Analyzes live vehicle density via simulated physics to dynamically adjust signal loops, preventing gridlocks before they form."
            />
            <FeatureCard 
              icon={<Video className="w-6 h-6 text-emerald-400" />}
              title="Computer Vision Integration"
              desc="Processes live feeds tracking object bounds, flow probability, and lane-specific queuing metrics in real-time."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-amber-400" />}
              title="Throughput Optimization"
              desc="Ensures maximum vehicles per hour safely cross intersections by syncing consecutive signals across corridors."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="relative z-10 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-8">
          <h2 className="text-4xl font-bold tracking-tight">Ready to see it in action?</h2>
          <p className="text-muted-foreground text-lg">
            Experience the simulated urban environment and watch the AI dynamically route traffic for a sustainable future.
          </p>
          <Link 
             to="/dashboard" 
             className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-105"
          >
             Access Dashboard
             <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-8 rounded-2xl hover:bg-white/10 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
