import { useRef, useEffect, useCallback, useState } from "react";
import { motion } from "motion/react";
import type { ElementType } from "react";
import { Map as MapIcon, Flame, Wind } from "lucide-react";
import {
  type VehiclePosition, type TrafficSignal, type TrafficIncident,
  type TrafficCamera,
} from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

// ── View modes ────────────────────────────────────────────────────────────────
type MapMode = "live" | "heatmap" | "flow";

// ── City grid (normalized 0–1 coords) ────────────────────────────────────────
const H_ROADS = [0.22, 0.42, 0.58, 0.78];
const V_ROADS = [0.15, 0.32, 0.50, 0.68, 0.85];

// ── Fixed positions for signals / cameras / incidents ────────────────────────
const SIG_POS: Record<string, { x: number; y: number }> = {
  s1:  { x: V_ROADS[0], y: H_ROADS[0] },
  s2:  { x: V_ROADS[1], y: H_ROADS[0] },
  s3:  { x: V_ROADS[2], y: H_ROADS[0] },
  s4:  { x: V_ROADS[3], y: H_ROADS[0] },
  s5:  { x: V_ROADS[1], y: H_ROADS[3] },
  s6:  { x: V_ROADS[2], y: H_ROADS[3] },
  s7:  { x: V_ROADS[3], y: H_ROADS[3] },
  s8:  { x: V_ROADS[4], y: H_ROADS[3] },
  s9:  { x: V_ROADS[4], y: H_ROADS[0] },
  s10: { x: V_ROADS[4], y: H_ROADS[1] },
  s11: { x: V_ROADS[4], y: H_ROADS[2] },
  s12: { x: V_ROADS[3], y: H_ROADS[2] },
  s13: { x: V_ROADS[0], y: H_ROADS[1] },
  s14: { x: V_ROADS[0], y: H_ROADS[2] },
  s15: { x: V_ROADS[1], y: H_ROADS[2] },
  s16: { x: V_ROADS[0], y: H_ROADS[3] },
};

const CAM_POS: Record<string, { x: number; y: number }> = {
  c1: { x: V_ROADS[0], y: H_ROADS[0] },
  c2: { x: V_ROADS[1], y: H_ROADS[0] },
  c3: { x: V_ROADS[1], y: H_ROADS[3] },
  c4: { x: V_ROADS[3], y: H_ROADS[3] },
  c5: { x: V_ROADS[4], y: H_ROADS[0] },
  c6: { x: V_ROADS[4], y: H_ROADS[2] },
  c7: { x: V_ROADS[0], y: H_ROADS[2] },
  c8: { x: V_ROADS[0], y: H_ROADS[3] },
};

const INC_POS: Record<string, { x: number; y: number }> = {
  i1: { x: V_ROADS[4], y: H_ROADS[2] },
  i2: { x: V_ROADS[1], y: H_ROADS[3] },
  i3: { x: V_ROADS[0], y: H_ROADS[3] },
  i4: { x: V_ROADS[1], y: H_ROADS[0] },
  i5: { x: V_ROADS[1], y: H_ROADS[2] },
  i6: { x: V_ROADS[4], y: H_ROADS[1] },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function px(val: number, dim: number): number { return val * dim; }

// ── City base: background, zones, roads, labels ───────────────────────────────
function drawCityBase(ctx: CanvasRenderingContext2D, W: number, H: number) {
  // Sky background
  ctx.fillStyle = "#09091a";
  ctx.fillRect(0, 0, W, H);

  // Zone quadrant fills
  const zones = [
    { x1: 0,   y1: 0,   x2: 0.5, y2: 0.5, fill: "rgba(14,165,233,0.055)", label: "NORTH", lx: 0.03, ly: 0.04 },
    { x1: 0.5, y1: 0,   x2: 1,   y2: 0.5, fill: "rgba(245,158,11,0.055)", label: "EAST",  lx: 0.53, ly: 0.04 },
    { x1: 0,   y1: 0.5, x2: 0.5, y2: 1,   fill: "rgba(244,63,94,0.055)",  label: "WEST",  lx: 0.03, ly: 0.54 },
    { x1: 0.5, y1: 0.5, x2: 1,   y2: 1,   fill: "rgba(139,92,246,0.055)", label: "SOUTH", lx: 0.53, ly: 0.54 },
  ];
  zones.forEach(z => {
    ctx.fillStyle = z.fill;
    ctx.fillRect(px(z.x1, W), px(z.y1, H), px(z.x2 - z.x1, W), px(z.y2 - z.y1, H));
  });

  // Zone center dividers
  ctx.strokeStyle = "rgba(255,255,255,0.055)";
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H);
  ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // City blocks (dark fill between road segments)
  const rw = W * 0.016;
  ctx.fillStyle = "#0d0d20";
  for (let vi = 0; vi < V_ROADS.length - 1; vi++) {
    for (let hi = 0; hi < H_ROADS.length - 1; hi++) {
      const bx = px(V_ROADS[vi], W) + rw / 2;
      const by = px(H_ROADS[hi], H) + rw / 2;
      const bw = px(V_ROADS[vi + 1] - V_ROADS[vi], W) - rw;
      const bh = px(H_ROADS[hi + 1] - H_ROADS[hi], H) - rw;
      ctx.fillRect(bx, by, bw, bh);
    }
  }

  // Horizontal roads
  H_ROADS.forEach(ry => {
    const y = px(ry, H);
    ctx.fillStyle = "#191930";
    ctx.fillRect(0, y - rw / 2, W, rw);
    // Center stripe
    ctx.setLineDash([10, 9]);
    ctx.strokeStyle = "rgba(255,210,0,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(W, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Vertical roads
  V_ROADS.forEach(rx => {
    const x = px(rx, W);
    ctx.fillStyle = "#191930";
    ctx.fillRect(x - rw / 2, 0, rw, H);
    // Center stripe
    ctx.setLineDash([10, 9]);
    ctx.strokeStyle = "rgba(255,210,0,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Intersection squares (brighter)
  H_ROADS.forEach(ry => {
    V_ROADS.forEach(rx => {
      ctx.fillStyle = "#20203c";
      ctx.fillRect(px(rx, W) - rw / 2, px(ry, H) - rw / 2, rw, rw);
    });
  });

  // Zone labels
  const fs = Math.max(9, Math.round(W * 0.016));
  ctx.font = `bold ${fs}px monospace`;
  zones.forEach(z => {
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillText(z.label, px(z.lx, W), px(z.ly + 0.025, H));
  });
}

// ── LIVE MODE ─────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  car: "#29b6f6", bus: "#ffa726", truck: "#ef5350", motorcycle: "#ab47bc",
};
const SIG_COLORS: Record<string, string> = { green: "#00e040", yellow: "#ffcc00", red: "#ff2222" };

function drawLiveMode(
  ctx: CanvasRenderingContext2D, W: number, H: number, frame: number,
  vehicles: VehiclePosition[], signals: TrafficSignal[],
  incidents: TrafficIncident[], cameras: TrafficCamera[],
) {
  // Vehicle dots
  vehicles.forEach(v => {
    const x = px(v.x / 100, W);
    const y = px(v.y / 100, H);
    const r = v.type === "bus" ? 4.5 : v.type === "truck" ? 4 : 3;
    const color = TYPE_COLORS[v.type] ?? "#29b6f6";
    const speedFrac = Math.min(1, v.speed / 80);
    // Speed glow
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r + 5);
    grd.addColorStop(0, color + Math.round(speedFrac * 0x44).toString(16).padStart(2, "0"));
    grd.addColorStop(1, "transparent");
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    // Dot
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  // Signal lights
  signals.forEach(sig => {
    const pos = SIG_POS[sig.id];
    if (!pos) return;
    const x = px(pos.x, W);
    const y = px(pos.y, H);
    const color = SIG_COLORS[sig.status];
    // Glow aura
    const grd = ctx.createRadialGradient(x, y, 0, x, y, 12);
    grd.addColorStop(0, color + "66");
    grd.addColorStop(1, color + "00");
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
    // Core dot
    const pulse = sig.status === "green" && (frame % 70 < 35);
    ctx.beginPath();
    ctx.arc(x, y, pulse ? 5.5 : 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    // White ring
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Cameras (tiny cyan squares offset from signal)
  cameras.forEach(cam => {
    const pos = CAM_POS[cam.id];
    if (!pos) return;
    const x = px(pos.x, W) + 10;
    const y = px(pos.y, H) - 10;
    const color = cam.status === "online" ? "#00e5ff" : cam.status === "offline" ? "#ff4444" : "#ffcc00";
    ctx.fillStyle = color + "cc";
    ctx.fillRect(x - 3, y - 3, 6, 6);
    ctx.strokeStyle = color;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x - 3, y - 3, 6, 6);
  });

  // Incident markers
  incidents.filter(i => i.active).forEach(inc => {
    const pos = INC_POS[inc.id];
    if (!pos) return;
    const x = px(pos.x, W);
    const y = px(pos.y, H);
    const blink = frame % 45 < 22;
    const color = inc.severity === "high" ? "#ff2222" : inc.severity === "medium" ? "#ffa726" : "#38bdf8";
    if (blink || inc.severity !== "high") {
      // Outer ring pulse
      if (inc.severity === "high") {
        ctx.beginPath();
        ctx.arc(x - 14, y - 14, 10 + (frame % 45) * 0.15, 0, Math.PI * 2);
        ctx.strokeStyle = color + "44";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Triangle
      ctx.beginPath();
      ctx.moveTo(x - 14, y - 23);
      ctx.lineTo(x - 6,  y - 9);
      ctx.lineTo(x - 22, y - 9);
      ctx.closePath();
      ctx.fillStyle = color + "bb";
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // ! label
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${Math.round(W * 0.012)}px monospace`;
      ctx.textAlign = "center";
      ctx.fillText("!", x - 14, y - 13);
      ctx.textAlign = "left";
    }
  });
}

// ── HEATMAP MODE ──────────────────────────────────────────────────────────────
function drawHeatmapMode(ctx: CanvasRenderingContext2D, W: number, H: number, vehicles: VehiclePosition[]) {
  ctx.globalCompositeOperation = "lighter";
  vehicles.forEach(v => {
    const x = px(v.x / 100, W);
    const y = px(v.y / 100, H);
    const r = 28 + (v.type === "bus" || v.type === "truck" ? 14 : 0);
    const speedFrac = Math.min(1, v.speed / 80);
    // slow → red/orange, fast → cyan/blue
    const alpha = 0.07;
    const hot  = `rgba(255,${Math.round(80 + 60 * speedFrac)},0,${alpha})`;
    const cool = `rgba(0,${Math.round(160 + 80 * speedFrac)},255,${alpha})`;
    const heatColor = speedFrac > 0.5 ? cool : hot;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, heatColor);
    grd.addColorStop(0.4, heatColor.replace(`${alpha})`, `${alpha * 0.5})`));
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
  // Mode label
  ctx.font = `${Math.round(W * 0.012)}px monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("DENSITY  ·  SPEED HEATMAP", 10, 20);
}

// ── FLOW MODE ─────────────────────────────────────────────────────────────────
function drawFlowMode(
  ctx: CanvasRenderingContext2D, W: number, H: number, frame: number,
  vehicles: VehiclePosition[],
) {
  const rw = W * 0.016;
  const dash = 14;
  const gap  = 9;
  const period = dash + gap;

  // Horizontal roads
  H_ROADS.forEach(ry => {
    const y = px(ry, H);
    const nearby = vehicles.filter(v => Math.abs(v.y / 100 - ry) < 0.07);
    const count = nearby.length;
    const avgSpeed = count > 0 ? nearby.reduce((s, v) => s + v.speed, 0) / count : 40;
    const eastCount = nearby.filter(v => v.heading < 90 || v.heading > 270).length;
    const isEast = count === 0 || eastCount >= count / 2;

    const speedFrac = Math.min(1, avgSpeed / 60);
    const r = Math.round(255 * (1 - speedFrac));
    const g = Math.round(200 * speedFrac);
    const a = Math.min(0.9, 0.4 + count * 0.018);
    const color = `rgba(${r},${g},50,${a})`;

    const offset1 = ((frame * 1.6) % period);
    const offset2 = (period - (frame * 1.6) % period);

    // East lane
    ctx.setLineDash([dash, gap]);
    ctx.lineDashOffset = -(isEast ? offset1 : offset2);
    ctx.strokeStyle = color;
    ctx.lineWidth = rw * 0.36;
    ctx.beginPath();
    ctx.moveTo(0, y + rw * 0.22); ctx.lineTo(W, y + rw * 0.22);
    ctx.stroke();

    // West lane
    ctx.lineDashOffset = -(isEast ? offset2 : offset1);
    ctx.beginPath();
    ctx.moveTo(0, y - rw * 0.22); ctx.lineTo(W, y - rw * 0.22);
    ctx.stroke();
  });

  // Vertical roads
  V_ROADS.forEach(rx => {
    const x = px(rx, W);
    const nearby = vehicles.filter(v => Math.abs(v.x / 100 - rx) < 0.06);
    const count = nearby.length;
    const avgSpeed = count > 0 ? nearby.reduce((s, v) => s + v.speed, 0) / count : 40;
    const southCount = nearby.filter(v => v.heading > 0 && v.heading < 180).length;
    const isSouth = count === 0 || southCount >= count / 2;

    const speedFrac = Math.min(1, avgSpeed / 60);
    const r = Math.round(255 * (1 - speedFrac));
    const g = Math.round(200 * speedFrac);
    const a = Math.min(0.9, 0.4 + count * 0.025);
    const color = `rgba(${r},${g},50,${a})`;

    const offset1 = ((frame * 1.6) % period);
    const offset2 = (period - (frame * 1.6) % period);

    // South lane
    ctx.setLineDash([dash, gap]);
    ctx.lineDashOffset = -(isSouth ? offset1 : offset2);
    ctx.strokeStyle = color;
    ctx.lineWidth = rw * 0.36;
    ctx.beginPath();
    ctx.moveTo(x + rw * 0.22, 0); ctx.lineTo(x + rw * 0.22, H);
    ctx.stroke();

    // North lane
    ctx.lineDashOffset = -(isSouth ? offset2 : offset1);
    ctx.beginPath();
    ctx.moveTo(x - rw * 0.22, 0); ctx.lineTo(x - rw * 0.22, H);
    ctx.stroke();
  });

  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  // Mode label
  ctx.font = `${Math.round(W * 0.012)}px monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText("DIRECTIONAL FLOW  ·  GREEN=FAST  RED=CONGESTED", 10, 20);
}

// ── Canvas component ──────────────────────────────────────────────────────────
interface MapCanvasProps {
  mode: MapMode;
  vehicles: VehiclePosition[];
  signals: TrafficSignal[];
  incidents: TrafficIncident[];
  cameras: TrafficCamera[];
}

function MapCanvas({ mode, vehicles, signals, incidents, cameras }: MapCanvasProps) {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const frameRef    = useRef(0);

  // Live refs so the animation loop always reads fresh data without re-creating
  const vehiclesRef  = useRef(vehicles);
  const signalsRef   = useRef(signals);
  const incidentsRef = useRef(incidents);
  const camerasRef   = useRef(cameras);
  const modeRef      = useRef(mode);

  useEffect(() => { vehiclesRef.current  = vehicles;  }, [vehicles]);
  useEffect(() => { signalsRef.current   = signals;   }, [signals]);
  useEffect(() => { incidentsRef.current = incidents; }, [incidents]);
  useEffect(() => { camerasRef.current   = cameras;   }, [cameras]);
  useEffect(() => { modeRef.current      = mode;      }, [mode]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) return;
    frameRef.current++;
    const frame = frameRef.current;
    drawCityBase(ctx, W, H);
    switch (modeRef.current) {
      case "live":    drawLiveMode(ctx, W, H, frame, vehiclesRef.current, signalsRef.current, incidentsRef.current, camerasRef.current); break;
      case "heatmap": drawHeatmapMode(ctx, W, H, vehiclesRef.current); break;
      case "flow":    drawFlowMode(ctx, W, H, frame, vehiclesRef.current); break;
    }
  }, []);

  // Responsive canvas size
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const setSize = (w: number) => {
      if (w < 1) return;
      canvas.width  = w;
      canvas.height = Math.round(Math.max(300, Math.min(520, w * 0.52)));
    };
    setSize(container.clientWidth);
    const obs = new ResizeObserver(entries => setSize(entries[0].contentRect.width));
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Animation loop
  useEffect(() => {
    const loop = () => { tick(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} className="w-full block rounded-lg" />
    </div>
  );
}

// ── Legend ────────────────────────────────────────────────────────────────────
function LiveLegend() {
  const items = [
    { color: "#29b6f6", label: "Car"          },
    { color: "#ffa726", label: "Bus"          },
    { color: "#ef5350", label: "Truck"        },
    { color: "#ab47bc", label: "Motorcycle"   },
    { color: "#00e040", label: "Signal Green" },
    { color: "#ff2222", label: "Signal Red"   },
    { color: "#00e5ff", label: "Camera"       },
    { color: "#ff4444", label: "Incident"     },
  ];
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
          <span className="text-[10px] text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function HeatmapLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Speed map:</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-orange-400">Slow / Congested</span>
        <div className="w-24 h-2 rounded-full" style={{ background: "linear-gradient(to right, rgba(255,100,0,0.9), rgba(0,210,255,0.9))" }} />
        <span className="text-[10px] text-cyan-400">Fast / Free-flow</span>
      </div>
      <span className="text-[10px] text-muted-foreground/50">Intensity = vehicle density</span>
    </div>
  );
}

function FlowLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Flow:</span>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-[10px] text-muted-foreground">Fast flow</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-[10px] text-muted-foreground">Congested</span>
      </div>
      <span className="text-[10px] text-muted-foreground/50">Dash animation speed = traffic speed</span>
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ vehicles, signals, incidents }: {
  vehicles: VehiclePosition[];
  signals: TrafficSignal[];
  incidents: TrafficIncident[];
}) {
  const greenCount    = signals.filter(s => s.status === "green").length;
  const highIncidents = incidents.filter(i => i.active && i.severity === "high").length;
  const avgSpeed      = vehicles.length > 0
    ? Math.round(vehicles.reduce((s, v) => s + v.speed, 0) / vehicles.length)
    : 0;

  const stats = [
    { label: "Vehicles on Map",  value: vehicles.length.toString(),          color: "text-cyan-400"      },
    { label: "Green Signals",    value: `${greenCount} / ${signals.length}`, color: "text-emerald-400"   },
    { label: "Critical Alerts",  value: highIncidents.toString(),             color: highIncidents > 0 ? "text-red-400" : "text-muted-foreground" },
    { label: "Avg Vehicle Speed", value: `${avgSpeed} km/h`,                  color: "text-sky-400"        },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {stats.map(stat => (
        <div key={stat.label} className="rounded-md bg-secondary/30 border border-border px-3 py-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">{stat.label}</p>
          <p className={cn("text-sm font-bold font-mono mt-0.5", stat.color)}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const MODES: { value: MapMode; icon: ElementType; label: string }[] = [
  { value: "live",    icon: MapIcon, label: "Live Map" },
  { value: "heatmap", icon: Flame,   label: "Heatmap"  },
  { value: "flow",    icon: Wind,    label: "Flow"     },
];

interface TrafficMapProps {
  vehicles: VehiclePosition[];
  signals: TrafficSignal[];
  incidents: TrafficIncident[];
  cameras: TrafficCamera[];
}

export default function TrafficMap({ vehicles, signals, incidents, cameras }: TrafficMapProps) {
  const [mode, setMode] = useState<MapMode>("live");

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Header + tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-primary" />
            Traffic Command Map
          </h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            {vehicles.length} vehicles · {signals.length} signals · {incidents.filter(i => i.active).length} active incidents
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-secondary/50 rounded-md p-0.5 border border-border">
          {MODES.map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-sm transition-all duration-150",
                  mode === m.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas — remounts on mode change for a clean transition */}
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg overflow-hidden border border-border/40"
      >
        <MapCanvas
          mode={mode}
          vehicles={vehicles}
          signals={signals}
          incidents={incidents}
          cameras={cameras}
        />
      </motion.div>

      {/* Stats */}
      <StatsStrip vehicles={vehicles} signals={signals} incidents={incidents} />

      {/* Legend */}
      <div className="pt-2 border-t border-border/50">
        {mode === "live"    && <LiveLegend />}
        {mode === "heatmap" && <HeatmapLegend />}
        {mode === "flow"    && <FlowLegend />}
      </div>
    </div>
  );
}