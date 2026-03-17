import { Activity, Radio, Navigation2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Zone } from "@/hooks/use-traffic-data";

const ZONES: { value: Zone; label: string }[] = [
  { value: "global", label: "Global" },
  { value: "north",  label: "North"  },
  { value: "south",  label: "South"  },
  { value: "east",   label: "East"   },
  { value: "west",   label: "West"   },
];

interface DashboardHeaderProps {
  zone: Zone;
  onZoneChange: (zone: Zone) => void;
  autoRefresh: boolean;
  onAutoRefreshChange: (v: boolean) => void;
  onRefresh: () => void;
  lastUpdated: Date;
  systemStatus: "operational" | "degraded" | "critical";
}

const STATUS_CONFIG = {
  operational: { label: "Operational", color: "text-emerald-400", dot: "bg-emerald-400" },
  degraded:    { label: "Degraded",    color: "text-amber-400",   dot: "bg-amber-400"   },
  critical:    { label: "Critical",    color: "text-red-400",     dot: "bg-red-400"     },
};

export default function DashboardHeader({
  zone, onZoneChange, autoRefresh, onAutoRefreshChange, onRefresh, lastUpdated, systemStatus,
}: DashboardHeaderProps) {
  const sc = STATUS_CONFIG[systemStatus];
  const timeStr = lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = lastUpdated.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Navigation2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-primary leading-none"
                  style={{ fontFamily: "var(--font-display)" }}>
                TrafficOS
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none mt-0.5">
                Intelligent Traffic Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {autoRefresh && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="font-mono tracking-wider">LIVE</span>
            </div>
          )}
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-foreground">{timeStr}</p>
            <p className="text-[10px] text-muted-foreground">{dateStr}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-secondary/50 rounded-md p-0.5 border border-border">
          {ZONES.map(z => (
            <button
              key={z.value}
              onClick={() => onZoneChange(z.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-sm transition-all duration-200 tracking-wide",
                zone === z.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              {z.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-secondary/30">
            <span className={cn("w-2 h-2 rounded-full", sc.dot,
              systemStatus === "operational" && "animate-pulse")} />
            <span className={cn("text-xs font-medium", sc.color)}>
              {sc.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">Auto-Refresh</span>
            <button
              onClick={() => onAutoRefreshChange(!autoRefresh)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none",
                autoRefresh ? "bg-primary/80" : "bg-secondary"
              )}
            >
              <span className={cn(
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                autoRefresh ? "translate-x-5" : "translate-x-0"
              )} />
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border bg-secondary/30 hover:bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Refresh</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className="w-3 h-3" />
            <span className="font-mono hidden md:block">{timeStr}</span>
          </div>
        </div>
      </div>
    </header>
  );
}