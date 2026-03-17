import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Car, AlertTriangle } from "lucide-react";
import { type TrafficSignal, type Zone } from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

function TrafficLight({ status }: { status: TrafficSignal["status"] }) {
  const isRed    = status === "red";
  const isYellow = status === "yellow";
  const isGreen  = status === "green";
  return (
    <svg width="22" height="56" viewBox="0 0 22 56" className="flex-shrink-0">
      <rect x="1" y="1" width="20" height="54" rx="10" fill="#080812" stroke="#1a1a2e" strokeWidth="1" />
      <circle cx="11" cy="13" r="7"
        fill={isRed ? "#ff2020" : "#1e0000"}
        style={isRed ? { filter: "drop-shadow(0 0 5px #ff2020)" } : undefined}
      />
      <motion.circle cx="11" cy="28" r="7"
        fill={isYellow ? "#ffcc00" : "#1e1a00"}
        style={isYellow ? { filter: "drop-shadow(0 0 5px #ffcc00)" } : undefined}
        animate={isYellow ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={isYellow ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      />
      <circle cx="11" cy="43" r="7"
        fill={isGreen ? "#00e040" : "#001e0a"}
        style={isGreen ? { filter: "drop-shadow(0 0 5px #00e040)" } : undefined}
      />
    </svg>
  );
}

function PhaseCountdown({ phase, status }: { phase: number; status: TrafficSignal["status"] }) {
  const [count, setCount] = useState(phase);
  const prevPhaseRef = useRef(phase);

  useEffect(() => {
    if (phase !== prevPhaseRef.current) {
      setCount(phase);
      prevPhaseRef.current = phase;
    }
  }, [phase]);

  useEffect(() => {
    const id = setInterval(() => setCount(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const colors: Record<TrafficSignal["status"], string> = {
    green: "text-emerald-400", yellow: "text-amber-400", red: "text-red-400",
  };
  return (
    <span className={cn("text-xs font-mono font-bold tabular-nums", colors[status])}>
      {count}s
    </span>
  );
}

const STATUS_BG: Record<TrafficSignal["status"], string> = {
  green:  "border-emerald-500/25 bg-emerald-500/5",
  yellow: "border-amber-500/25 bg-amber-500/5",
  red:    "border-red-500/25 bg-red-500/5",
};
const ZONE_COLORS: Record<string, string> = {
  north: "text-sky-400  bg-sky-400/10  border-sky-400/30",
  south: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  east:  "text-amber-400 bg-amber-400/10 border-amber-400/30",
  west:  "text-rose-400  bg-rose-400/10  border-rose-400/30",
};

function SignalCard({ signal, index }: { signal: TrafficSignal; index: number }) {
  // Check if this signal has an active ambulance override
  const isEmergency = signal.emergencyActive;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: "easeOut" }}
      className={cn(
        "rounded-lg border p-3 hover:brightness-110 transition-all duration-200 relative overflow-hidden",
        isEmergency ? "border-blue-500 bg-blue-500/10 animate-pulse" : STATUS_BG[signal.status]
      )}
    >
      {/* EVPR Badge */}
      {isEmergency && (
        <div className="absolute -top-1 left-0 right-0 bg-red-500 text-white text-[9px] font-bold text-center py-0.5 tracking-widest uppercase">
          🚨 EVPR Override Active
        </div>
      )}

      <div className={cn("flex items-center justify-between mb-2", isEmergency && "mt-3")}>
        <span className="text-xs font-bold font-mono text-foreground">{signal.name}</span>
        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider", ZONE_COLORS[signal.zone])}>
          {signal.zone.charAt(0).toUpperCase()}
        </span>
      </div>

      <p className="text-[10px] text-muted-foreground mb-3 leading-tight truncate" title={signal.intersection}>
        {signal.intersection}
      </p>

      <div className="flex items-center gap-3">
        <TrafficLight status={signal.status} />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Phase</span>
            <PhaseCountdown phase={signal.currentPhase} status={signal.status} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Car className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Vehicles</span>
            </div>
            <span className={cn("text-xs font-semibold", isEmergency ? "text-blue-400" : "text-foreground")}>
              {signal.vehicles}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {isEmergency ? (
                <AlertTriangle className="w-3 h-3 text-red-400" />
              ) : (
                <Zap className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground">
                {isEmergency ? "Priority" : "Efficiency"}
              </span>
            </div>
            <span className={cn("text-xs font-semibold", isEmergency ? "text-red-400" : "text-emerald-400")}>
              {isEmergency ? "MAX" : `${signal.efficiency}%`}
            </span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={cn("h-full rounded-full", isEmergency ? "bg-red-500" : "bg-emerald-500")}
              initial={{ width: 0 }}
              animate={{ width: isEmergency ? "100%" : `${signal.efficiency}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SignalSummary({ signals }: { signals: TrafficSignal[] }) {
  const green  = signals.filter(s => s.status === "green" && !s.emergencyActive).length;
  const yellow = signals.filter(s => s.status === "yellow" && !s.emergencyActive).length;
  const red    = signals.filter(s => s.status === "red" && !s.emergencyActive).length;
  const emergency = signals.filter(s => s.emergencyActive).length;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-emerald-400">{green} Green</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="text-xs font-semibold text-amber-400">{yellow} Yellow</span>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/25">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs font-semibold text-red-400">{red} Red</span>
      </div>
      
      {emergency > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-500/40 animate-pulse">
          <span className="text-xs font-bold text-blue-400">🚨 {emergency} EVPR Active</span>
        </div>
      )}

      <span className="text-xs text-muted-foreground ml-auto">{signals.length} total signals</span>
    </div>
  );
}

const ZONE_FILTERS: { value: Zone | "all"; label: string }[] = [
  { value: "all",   label: "All"   },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "east",  label: "East"  },
  { value: "west",  label: "West"  },
];

export default function SignalStatus({ signals }: { signals: TrafficSignal[] }) {
  const [filter, setFilter] = useState<Zone | "all">("all");
  const visible = filter === "all" ? signals : signals.filter(s => s.zone === filter);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide">Traffic Signal Status</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Adaptive signal control · real-time
          </p>
        </div>
        <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-0.5 border border-border">
          {ZONE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-sm transition-all duration-150 tracking-wide",
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <SignalSummary signals={visible} />

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        <AnimatePresence mode="popLayout">
          {visible.map((signal, i) => (
            <SignalCard key={signal.id} signal={signal} index={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}