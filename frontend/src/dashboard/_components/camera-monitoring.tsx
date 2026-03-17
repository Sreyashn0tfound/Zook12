import { useState } from "react";
import { motion } from "motion/react";
import { Camera, Play, Wifi, WifiOff, Wrench, Car, X, Maximize2, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { type TrafficCamera, type TrafficSignal, type LocalZone } from "@/hooks/use-traffic-data";
import CameraFeed from "./camera-feed";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  online:      { icon: Wifi,    label: "Online",      style: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  offline:     { icon: WifiOff, label: "Offline",     style: "text-red-400     bg-red-500/10     border-red-500/30"     },
  maintenance: { icon: Wrench,  label: "Maintenance", style: "text-amber-400   bg-amber-500/10   border-amber-500/30"   },
};

const CONGESTION_CONFIG = {
  low:      { label: "Low",      bar: "bg-emerald-500", text: "text-emerald-400", w: "w-1/4"  },
  medium:   { label: "Medium",   bar: "bg-amber-500",   text: "text-amber-400",   w: "w-1/2"  },
  high:     { label: "High",     bar: "bg-orange-500",  text: "text-orange-400",  w: "w-3/4"  },
  critical: { label: "Critical", bar: "bg-red-500",     text: "text-red-400",     w: "w-full" },
};

function CameraPreview({ camera }: { camera: TrafficCamera }) {
  const isOnline = camera.status === "online";
  return (
    <div className="relative w-full aspect-video bg-[#181826] rounded-md overflow-hidden border border-border/50">
      <div className="absolute inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 3px)" }} />
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

      {isOnline ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <Camera className="w-6 h-6 text-primary/40" />
          <span className="text-[10px] text-primary/50 font-mono">CLICK TO VIEW LIVE FEED</span>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <WifiOff className="w-5 h-5 text-muted-foreground/30" />
          <span className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">
            {camera.status === "offline" ? "Signal Lost" : "Under Maintenance"}
          </span>
        </div>
      )}

      {isOnline && (
        <div className="absolute bottom-1 right-1.5">
          <span className="text-[9px] font-mono text-white/40">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      )}
      {isOnline && (
        <div className="absolute top-1 left-1.5 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-mono text-red-400">REC</span>
        </div>
      )}
      <div className="absolute top-1 right-1.5">
        <span className="text-[9px] font-mono text-cyan-400/70">{camera.name}</span>
      </div>
    </div>
  );
}

interface CameraCardProps {
  camera: TrafficCamera;
  signal?: TrafficSignal;
  index: number;
  onSelect: (camera: TrafficCamera) => void;
}

function CameraCard({ camera, signal, index, onSelect }: CameraCardProps) {
  const sc = STATUS_CONFIG[camera.status];
  const StatusIcon = sc.icon;
  const cc = CONGESTION_CONFIG[camera.congestion];
  const isOnline = camera.status === "online";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      className="rounded-lg border border-border bg-card p-3 hover:border-primary/30 transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Camera className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold font-mono">{camera.name}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[110px]" title={camera.intersection}>
              {camera.intersection}
            </p>
          </div>
        </div>
        <span className={cn("flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border", sc.style)}>
          <StatusIcon className="w-2.5 h-2.5" />
          {sc.label}
        </span>
      </div>

      <div
        className={cn("relative", isOnline && "cursor-pointer group")}
        onClick={() => isOnline && onSelect(camera)}
      >
        <CameraPreview camera={camera} />
        {isOnline && (
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-200 rounded-md flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/50 border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Play className="w-4 h-4 text-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Car className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">{camera.vehicles}</span>
          <span className="text-[10px] text-muted-foreground">vehicles</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-[10px] font-semibold", cc.text)}>{cc.label}</span>
          <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-700", cc.bar, cc.w)} />
          </div>
        </div>
      </div>

      {signal && (
        <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Linked signal</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full",
              signal.status === "green"  ? "bg-emerald-500 animate-pulse" :
              signal.status === "yellow" ? "bg-amber-500" : "bg-red-500"
            )} />
            <span className={cn("text-[10px] font-semibold uppercase tracking-wide",
              signal.status === "green"  ? "text-emerald-400" :
              signal.status === "yellow" ? "text-amber-400" : "text-red-400"
            )}>
              {signal.status}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">{signal.currentPhase}s</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CameraSummary({ cameras }: { cameras: TrafficCamera[] }) {
  const online  = cameras.filter(c => c.status === "online").length;
  const offline = cameras.filter(c => c.status === "offline").length;
  const maint   = cameras.filter(c => c.status === "maintenance").length;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-emerald-400">{online} Online</span>
      </div>
      {maint > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/25">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-amber-400">{maint} Maintenance</span>
        </div>
      )}
      {offline > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/25">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-red-400">{offline} Offline</span>
        </div>
      )}
      <span className="text-xs text-muted-foreground ml-auto">{cameras.length} cameras total</span>
    </div>
  );
}

interface CameraMonitoringProps {
  cameras: TrafficCamera[];
  signals: TrafficSignal[];
  onEmergency?: (zoneName: LocalZone) => void; 
}

export default function CameraMonitoring({ cameras, signals, onEmergency }: CameraMonitoringProps) {
  const [selectedCamera, setSelectedCamera] = useState<TrafficCamera | null>(null);
  const [spawnTrigger, setSpawnTrigger] = useState(false); // 🔥 Added local trigger state

  const linkedSignal = (cam: TrafficCamera) =>
    signals.find(s => s.intersection === cam.intersection) ?? signals.find(s => s.zone === cam.zone);

  const dialogSignal = selectedCamera ? linkedSignal(selectedCamera) : undefined;

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-wide">Camera Network</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
              Intersection monitoring · click to view live feed
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Click camera to expand</span>
          </div>
        </div>

        <CameraSummary cameras={cameras} />

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {cameras.map((cam, i) => (
            <CameraCard
              key={cam.id}
              camera={cam}
              signal={linkedSignal(cam)}
              index={i}
              onSelect={setSelectedCamera}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!selectedCamera} onOpenChange={open => { if (!open) setSelectedCamera(null); }}>
        <DialogContent className="max-w-2xl w-[95vw] bg-card border-border p-0 overflow-hidden [&>button]:hidden shadow-2xl">
          <DialogHeader className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between">
              
              <div className="flex flex-col items-start text-left">
                <DialogTitle className="text-sm font-bold font-mono text-primary leading-none mt-1">
                  {selectedCamera?.name}
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-1.5 leading-none">{selectedCamera?.intersection}</p>
              </div>

              <div className="flex items-center gap-3">
                
                {/* 🔥 THE AMBULANCE TRIGGER BUTTON 🔥 */}
                {selectedCamera && onEmergency && (
                  <button
                    onClick={() => {
                      onEmergency(selectedCamera.zone);
                      // 🔥 Send the pulse to the canvas
                      setSpawnTrigger(true);
                      setTimeout(() => setSpawnTrigger(false), 1000); 
                    }}
                    className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 rounded text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Spawn Ambulance
                  </button>
                )}

                {dialogSignal && (
                  <div className={cn("flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border",
                    dialogSignal.status === "green"  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
                    dialogSignal.status === "yellow" ? "text-amber-400   bg-amber-500/10   border-amber-500/30"   :
                                                       "text-red-400     bg-red-500/10     border-red-500/30"
                  )}>
                    <span className={cn("w-2 h-2 rounded-full",
                      dialogSignal.status === "green"  ? "bg-emerald-500 animate-pulse" :
                      dialogSignal.status === "yellow" ? "bg-amber-500" : "bg-red-500"
                    )} />
                    {dialogSignal.status.toUpperCase()}
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedCamera(null)}
                  className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 bg-[#09091a]">
            {selectedCamera && (
              <CameraFeed
                signalStatus={dialogSignal?.status ?? "green"}
                cameraName={selectedCamera.name}
                vehicleCount={selectedCamera.vehicles}
                intersection={selectedCamera.intersection}
                active={true}
                isEmergency={spawnTrigger} // 🔥 Passes the pulse to the physics engine
              />
            )}
          </div>

          {selectedCamera && (
            <div className="px-4 pb-4 grid grid-cols-3 gap-3 bg-[#09091a]">
              {[
                { label: "Zone",       value: selectedCamera.zone.charAt(0).toUpperCase() + selectedCamera.zone.slice(1) },
                { label: "Vehicles",   value: selectedCamera.vehicles.toString()            },
                { label: "Congestion", value: CONGESTION_CONFIG[selectedCamera.congestion].label },
              ].map(item => (
                <div key={item.label} className="rounded-md bg-secondary/40 p-2.5 text-center border border-border shadow-sm">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.label}</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}