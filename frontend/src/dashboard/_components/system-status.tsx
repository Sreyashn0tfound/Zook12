import { motion } from "motion/react";
import { Shield, Cpu, Camera, Wifi, BrainCircuit, Bell, Server } from "lucide-react";
import { type SystemStatus } from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

type SubStatus = "online" | "degraded" | "offline";

interface Subsystem {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: SubStatus;
  detail: string;
}

const STATUS_STYLES: Record<SubStatus, { dot: string; text: string; label: string }> = {
  online:   { dot: "bg-emerald-400", text: "text-emerald-400", label: "Online"   },
  degraded: { dot: "bg-amber-400",   text: "text-amber-400",   label: "Degraded" },
  offline:  { dot: "bg-red-400",     text: "text-red-400",     label: "Offline"  },
};

function getSubsystems(status: SystemStatus): Subsystem[] {
  return [
    {
      id: "controller",
      label: "Signal Controller",
      icon: <Cpu className="w-3.5 h-3.5" />,
      status: status === "critical" ? "degraded" : "online",
      detail: status === "critical" ? "Failover active" : "16 signals synced",
    },
    {
      id: "cameras",
      label: "Camera Network",
      icon: <Camera className="w-3.5 h-3.5" />,
      status: "degraded",
      detail: "6/8 cameras online",
    },
    {
      id: "comms",
      label: "Data Link",
      icon: <Wifi className="w-3.5 h-3.5" />,
      status: status === "critical" ? "offline" : "online",
      detail: status === "critical" ? "Connection lost" : "Latency: 12ms",
    },
    {
      id: "ai",
      label: "AI Optimization",
      icon: <BrainCircuit className="w-3.5 h-3.5" />,
      status: "online",
      detail: "Model v3.2 active",
    },
    {
      id: "alerts",
      label: "Alert System",
      icon: <Bell className="w-3.5 h-3.5" />,
      status: "online",
      detail: "6 active incidents",
    },
    {
      id: "server",
      label: "Core Server",
      icon: <Server className="w-3.5 h-3.5" />,
      status: "online",
      detail: "CPU 34% · RAM 61%",
    },
  ];
}

const OVERALL_CONFIG: Record<SystemStatus, { label: string; color: string; border: string; glow: string; icon: string }> = {
  operational: { label: "All Systems Operational", color: "text-emerald-400", border: "border-emerald-500/30", glow: "bg-emerald-500/10", icon: "●" },
  degraded:    { label: "System Degraded",          color: "text-amber-400",   border: "border-amber-500/30",   glow: "bg-amber-500/10",   icon: "◐" },
  critical:    { label: "Critical Failure",         color: "text-red-400",     border: "border-red-500/30",     glow: "bg-red-500/10",     icon: "○" },
};

interface SystemStatusProps {
  status: SystemStatus;
}

export default function SystemStatus({ status }: SystemStatusProps) {
  const cfg = OVERALL_CONFIG[status];
  const subsystems = getSubsystems(status);
  const onlineCount = subsystems.filter(s => s.status === "online").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("rounded-lg border p-4", cfg.border, cfg.glow)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-md flex items-center justify-center border", cfg.border, cfg.glow)}>
            <Shield className={cn("w-4 h-4", cfg.color)} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">System Status</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Signal Controller</p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", cfg.color)}>
            <span className={cn("w-2 h-2 rounded-full", STATUS_STYLES.online.dot,
              status === "operational" && "animate-pulse")} />
            <span>{cfg.label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">{onlineCount}/{subsystems.length} systems nominal</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {subsystems.map((sub, i) => {
          const ss = STATUS_STYLES[sub.status];
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
              className="flex items-start gap-2 p-2.5 rounded-md bg-secondary/40 border border-border hover:border-primary/20 transition-colors duration-200"
            >
              <div className={cn("mt-0.5 flex-shrink-0", ss.text)}>{sub.icon}</div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", ss.dot,
                    sub.status === "online" && "animate-pulse")} />
                  <p className="text-xs font-medium truncate">{sub.label}</p>
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub.detail}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}