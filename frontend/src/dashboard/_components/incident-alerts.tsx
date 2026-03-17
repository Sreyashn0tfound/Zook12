import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle, Construction, Wrench, Siren,
  TrendingUp, Clock, MapPin, ChevronDown, ChevronUp, X,
  Filter, BellRing
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { type TrafficIncident } from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

// ── Type & severity configs ───────────────────────────────────────────────────
const TYPE_CONFIG: Record<TrafficIncident["type"], {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  accident:   { icon: AlertTriangle, label: "Accident",   color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30"     },
  roadwork:   { icon: Construction,  label: "Roadwork",   color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  congestion: { icon: TrendingUp,    label: "Congestion", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30"},
  breakdown:  { icon: Wrench,        label: "Breakdown",  color: "text-sky-400",    bg: "bg-sky-500/10 border-sky-500/30"     },
  emergency:  { icon: Siren,         label: "Emergency",  color: "text-rose-400",   bg: "bg-rose-500/10 border-rose-500/30"   },
};

const SEV_CONFIG: Record<TrafficIncident["severity"], {
  label: string;
  dot: string;
  badge: string;
  border: string;
  pulse?: boolean;
}> = {
  high:   { label: "High",   dot: "bg-red-500",   badge: "text-red-400 bg-red-500/15 border-red-500/40",     border: "border-l-red-500",    pulse: true  },
  medium: { label: "Medium", dot: "bg-amber-500",  badge: "text-amber-400 bg-amber-500/15 border-amber-500/40", border: "border-l-amber-500" },
  low:    { label: "Low",    dot: "bg-sky-500",    badge: "text-sky-400 bg-sky-500/15 border-sky-500/40",     border: "border-l-sky-500"    },
};

const ZONE_COLORS: Record<string, string> = {
  north: "text-sky-400",
  south: "text-violet-400",
  east:  "text-amber-400",
  west:  "text-rose-400",
};

// ── Incident card ─────────────────────────────────────────────────────────────
function IncidentCard({ incident, index }: { incident: TrafficIncident; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const tc = TYPE_CONFIG[incident.type];
  const sc = SEV_CONFIG[incident.severity];
  const TypeIcon = tc.icon;

  // Accurately flag incidents that just happened (less than 30 seconds old)
  const isNew = (new Date().getTime() - incident.timestamp.getTime()) < 30000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, scale: 0.95 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
      className={cn(
        "rounded-lg border border-l-[3px] bg-card/80 transition-colors duration-200 overflow-hidden relative",
        sc.border, "border-border"
      )}
    >
      <button
        className="w-full text-left px-3 py-2.5 flex items-start gap-3 hover:bg-secondary/30 transition-colors duration-150"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 border mt-0.5", tc.bg)}>
          <TypeIcon className={cn("w-3.5 h-3.5", tc.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-xs font-semibold", tc.color)}>{tc.label}</span>
            <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border uppercase tracking-wider inline-flex items-center gap-1", sc.badge)}>
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", sc.dot, sc.pulse && "animate-pulse")} />
              {sc.label}
            </span>
            <span className={cn("text-[10px] font-medium capitalize", ZONE_COLORS[incident.zone])}>
              {incident.zone}
            </span>
            {isNew && (
              <span className="text-[9px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40 animate-pulse">
                NEW
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-[11px] text-foreground/80 truncate">{incident.location}</span>
          </div>
        </div>

        <div className="flex-shrink-0 flex flex-col items-end gap-1 ml-2">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Clock className="w-2.5 h-2.5" />
            {formatDistanceToNow(incident.timestamp, { addSuffix: true })}
          </div>
          {expanded ? (
            <ChevronUp className="w-3 h-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-1 border-t border-border/50">
              <p className="text-[11px] text-muted-foreground leading-relaxed">{incident.description}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono">
                <Clock className="w-2.5 h-2.5" />
                {incident.timestamp.toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IncidentSummary({ incidents }: { incidents: TrafficIncident[] }) {
  const high   = incidents.filter(i => i.severity === "high").length;
  const medium = incidents.filter(i => i.severity === "medium").length;
  const low    = incidents.filter(i => i.severity === "low").length;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {high > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/25">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-400">{high} Critical</span>
        </div>
      )}
      {medium > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-amber-400">{medium} Medium</span>
        </div>
      )}
      {low > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/25">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span className="text-xs font-semibold text-sky-400">{low} Low</span>
        </div>
      )}
      <span className="text-xs text-muted-foreground ml-auto">{incidents.length} active incidents</span>
    </div>
  );
}

type SevFilter = "all" | TrafficIncident["severity"];
type TypeFilter = "all" | TrafficIncident["type"];

const SEV_FILTERS: { value: SevFilter; label: string }[] = [
  { value: "all",    label: "All"    },
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
];

export default function IncidentAlerts({ incidents }: { incidents: TrafficIncident[] }) {
  const [sevFilter, setSevFilter]   = useState<SevFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  
  // 🔥 THE NOTIFICATION STATE
  const [liveAlert, setLiveAlert] = useState<TrafficIncident | null>(null);
  const prevIncidentCount = useRef(incidents.length);

  // 🔥 THE NOTIFICATION ENGINE
  useEffect(() => {
    // If a new incident was added to the array
    if (incidents.length > prevIncidentCount.current) {
      // Grab the absolute newest incident based on timestamp
      const newest = [...incidents].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
      
      // If it's an emergency or accident, trigger the pop-up!
      if (newest && (newest.type === "emergency" || newest.type === "accident" || newest.severity === "high")) {
        setLiveAlert(newest);
        // Auto dismiss after 6 seconds
        const timer = setTimeout(() => setLiveAlert(null), 6000);
        return () => clearTimeout(timer);
      }
    }
    prevIncidentCount.current = incidents.length;
  }, [incidents]);

  const active = useMemo(() => incidents.filter(i => i.active), [incidents]);

  const filtered = useMemo(() => {
    let list = active;
    if (sevFilter  !== "all") list = list.filter(i => i.severity === sevFilter);
    if (typeFilter !== "all") list = list.filter(i => i.type     === typeFilter);
    return [...list].sort((a, b) => {
      const sevOrder = { high: 0, medium: 1, low: 2 };
      if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [active, sevFilter, typeFilter]);

  const typeOptions = useMemo<{ value: TypeFilter; label: string }[]>(() => [
    { value: "all", label: "All Types" },
    ...Array.from(new Set(active.map(i => i.type))).map(t => ({
      value: t as TypeFilter,
      label: TYPE_CONFIG[t].label,
    })),
  ], [active]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 relative overflow-hidden">
      
      {/* 🔥 THE LIVE NOTIFICATION POP-UP 🔥 */}
      <AnimatePresence>
        {liveAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-50 bg-red-950/90 backdrop-blur-md border border-red-500/50 rounded-lg p-3 shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
              <BellRing className="w-4 h-4 text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                Priority Dispatch 
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              </h4>
              <p className="text-sm text-white font-medium mt-0.5">
                {liveAlert.type === "emergency" ? "Ambulance Override Triggered" : "Critical Accident Detected"}
              </p>
              <p className="text-[10px] text-red-200/70 mt-1 capitalize">
                Zone: {liveAlert.zone} • {liveAlert.location}
              </p>
            </div>
            <button onClick={() => setLiveAlert(null)} className="text-red-400/50 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Incident Alerts
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Live incident feed · click to expand
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3 h-3 text-muted-foreground" />
          <div className="flex items-center gap-0.5 bg-secondary/50 rounded-md p-0.5 border border-border">
            {SEV_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setSevFilter(f.value)}
                className={cn(
                  "px-2 py-0.5 text-[11px] font-medium rounded-sm transition-all duration-150 tracking-wide",
                  sevFilter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as TypeFilter)}
              className="text-[11px] font-medium bg-secondary/50 border border-border rounded-md px-2 py-1 text-muted-foreground hover:text-foreground transition-colors appearance-none pr-6 cursor-pointer"
            >
              {typeOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          </div>

          {(sevFilter !== "all" || typeFilter !== "all") && (
            <button
              onClick={() => { setSevFilter("all"); setTypeFilter("all"); }}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>

      <IncidentSummary incidents={active} />

      <div className="mt-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <AlertTriangle className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground/50">No incidents match the current filters</p>
            </motion.div>
          ) : (
            filtered.map((incident, i) => (
              <IncidentCard key={incident.id} incident={incident} index={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}