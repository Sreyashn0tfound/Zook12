import { motion } from "motion/react";
import { Compass, Car, TrafficCone, Camera, Zap } from "lucide-react";
import { type ZoneSummary, type CongestionLevel } from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

const ZONE_ICONS: Record<string, React.ReactNode> = {
  north: <Compass className="w-4 h-4" style={{ transform: "rotate(0deg)" }} />,
  south: <Compass className="w-4 h-4" style={{ transform: "rotate(180deg)" }} />,
  east:  <Compass className="w-4 h-4" style={{ transform: "rotate(90deg)" }} />,
  west:  <Compass className="w-4 h-4" style={{ transform: "rotate(270deg)" }} />,
};

const CONGESTION_CONFIG: Record<CongestionLevel, { label: string; bar: string; text: string; bg: string; border: string }> = {
  low:      { label: "Low",      bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  medium:   { label: "Medium",   bar: "bg-amber-500",   text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30"   },
  high:     { label: "High",     bar: "bg-orange-500",  text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/30"  },
  critical: { label: "Critical", bar: "bg-red-500",     text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/30"     },
};

const CONGESTION_WIDTH: Record<CongestionLevel, string> = {
  low: "w-1/4", medium: "w-1/2", high: "w-3/4", critical: "w-full",
};

interface ZoneSummaryCardProps {
  summary: ZoneSummary;
  delay?: number;
}

function ZoneSummaryCard({ summary, delay = 0 }: ZoneSummaryCardProps) {
  const cc = CONGESTION_CONFIG[summary.congestion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            {ZONE_ICONS[summary.zone]}
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">{summary.label} Zone</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Zone {summary.zone.charAt(0).toUpperCase()}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wider", cc.text, cc.bg, cc.border)}>
          {cc.label}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Congestion</span>
          <span className={cn("text-[10px] font-medium", cc.text)}>{cc.label}</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-700", cc.bar, CONGESTION_WIDTH[summary.congestion])} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-1.5 rounded-md bg-secondary/40">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Car className="w-3 h-3 text-cyan-400" />
          </div>
          <p className="text-sm font-bold text-cyan-400">{(summary.vehicles / 1000).toFixed(1)}k</p>
          <p className="text-[10px] text-muted-foreground">Vehicles</p>
        </div>
        <div className="text-center p-1.5 rounded-md bg-secondary/40">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <TrafficCone className="w-3 h-3 text-amber-400" />
          </div>
          <p className="text-sm font-bold text-amber-400">{summary.activeSignals}/{summary.totalSignals}</p>
          <p className="text-[10px] text-muted-foreground">Signals</p>
        </div>
        <div className="text-center p-1.5 rounded-md bg-secondary/40">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <Camera className="w-3 h-3 text-violet-400" />
          </div>
          <p className="text-sm font-bold text-violet-400">{summary.onlineCameras}/{summary.totalCameras}</p>
          <p className="text-[10px] text-muted-foreground">Cameras</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Signal Efficiency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${summary.efficiency}%` }} />
          </div>
          <span className="text-xs font-semibold text-emerald-400">{summary.efficiency}%</span>
        </div>
      </div>
    </motion.div>
  );
}

interface ZoneSummariesProps {
  summaries: ZoneSummary[];
}

export default function ZoneSummaries({ summaries }: ZoneSummariesProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Zone Overview</h2>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {summaries.map((s, i) => (
          <ZoneSummaryCard key={s.zone} summary={s} delay={i * 0.07} />
        ))}
      </div>
    </div>
  );
}