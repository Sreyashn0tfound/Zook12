import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, Car, Clock, Gauge } from "lucide-react";
import { type HourlyFlow, type VehicleDistribution, type TrafficMetrics } from "@/hooks/use-traffic-data";
import { cn } from "@/lib/utils";

// ── Custom tooltip ────────────────────────────────────────────────────────────
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm px-3 py-2 text-xs shadow-xl">
      {label && <p className="font-mono text-muted-foreground mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-semibold text-foreground tabular-nums">
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon: Icon, label, value, accent }: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-md border bg-card", accent)}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{label}</p>
        <p className="text-sm font-bold font-mono text-foreground">{value}</p>
      </div>
    </div>
  );
}

// ── Vehicle distribution donut ─────────────────────────────────────────────────
function VehicleDistributionChart({ distribution }: { distribution: VehicleDistribution[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <Car className="w-4 h-4 text-primary" />
          Vehicle Distribution
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          Fleet composition · current snapshot
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 flex-1">
        {/* Donut chart */}
        <div className="w-full sm:w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="78%"
                paddingAngle={3}
                dataKey="count"
                nameKey="type"
              >
                {distribution.map((entry) => (
                  <Cell key={entry.type} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="flex-1 w-full space-y-2.5">
          {distribution.map((d) => (
            <div key={d.type} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.fill }} />
              <span className="text-xs text-muted-foreground flex-1 truncate">{d.type}</span>
              <span className="text-xs font-semibold font-mono text-foreground tabular-nums">
                {d.count.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground/60 w-8 text-right tabular-nums">
                {d.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hourly flow area chart ─────────────────────────────────────────────────────
function HourlyFlowChart({ flow }: { flow: HourlyFlow[] }) {
  // Show last 12 hours for readability
  const visible = flow.slice(-12);

  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Hourly Traffic Flow
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          Optimized vs baseline · last 12 hours
        </p>
      </div>

      <div className="flex-1 min-h-0 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visible} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradOptimized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="oklch(0.76 0.155 195)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="oklch(0.76 0.155 195)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="oklch(0.65 0.15 30)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="oklch(0.65 0.15 30)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              formatter={(value: string) => (
                <span style={{ color: "rgba(255,255,255,0.55)", textTransform: "capitalize" }}>{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="oklch(0.65 0.15 30)"
              strokeWidth={1.5}
              fill="url(#gradBaseline)"
              dot={false}
              strokeDasharray="4 3"
            />
            <Area
              type="monotone"
              dataKey="optimized"
              name="Optimized"
              stroke="oklch(0.76 0.155 195)"
              strokeWidth={2}
              fill="url(#gradOptimized)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Congestion by zone bar chart ───────────────────────────────────────────────
interface ZoneBar {
  zone: string;
  efficiency: number;
  congestion: number;
}

function ZonePerformanceChart({ zoneData }: { zoneData: ZoneBar[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold tracking-wide flex items-center gap-2">
          <Gauge className="w-4 h-4 text-primary" />
          Zone Performance
        </h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
          Efficiency vs congestion index · per zone
        </p>
      </div>
      <div className="flex-1 min-h-0 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={zoneData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="zone"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              formatter={(value: string) => (
                <span style={{ color: "rgba(255,255,255,0.55)", textTransform: "capitalize" }}>{value}</span>
              )}
            />
            <Bar dataKey="efficiency"  name="Efficiency"  fill="oklch(0.76 0.155 195)" radius={[3, 3, 0, 0]} maxBarSize={28} />
            <Bar dataKey="congestion"  name="Congestion"  fill="oklch(0.65 0.22 25)"   radius={[3, 3, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
interface TrafficAnalyticsProps {
  distribution: VehicleDistribution[];
  hourlyFlow: HourlyFlow[];
  metrics: TrafficMetrics;
  zoneSummaries: Array<{ zone: string; efficiency: number; congestion: string }>;
}

const CONGESTION_TO_INDEX: Record<string, number> = {
  low: 15, medium: 42, high: 68, critical: 90,
};

export default function TrafficAnalytics({ distribution, hourlyFlow, metrics, zoneSummaries }: TrafficAnalyticsProps) {
  const zoneBarData: ZoneBar[] = useMemo(() => (
    zoneSummaries.map(z => ({
      zone: z.zone.charAt(0).toUpperCase() + z.zone.slice(1),
      efficiency: z.efficiency,
      congestion: CONGESTION_TO_INDEX[z.congestion] ?? 30,
    }))
  ), [zoneSummaries]);

  return (
    <div className="space-y-3">
      {/* Stat chips row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        <StatChip icon={TrendingUp} label="Throughput" value={`${metrics.throughput.toLocaleString()} veh/h`} accent="border-primary/20" />
        <StatChip icon={Car}        label="Avg Speed"  value={`${metrics.avgSpeed} km/h`}                    accent="border-sky-500/20"     />
        <StatChip icon={Gauge}      label="Congestion" value={`${metrics.congestionIndex}%`}                 accent="border-orange-500/20"  />
        <StatChip icon={Clock}      label="Vehicles"   value={metrics.totalVehicles.toLocaleString()}        accent="border-violet-500/20"  />
      </motion.div>

      {/* Charts grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-3"
      >
        <VehicleDistributionChart distribution={distribution} />
        <HourlyFlowChart flow={hourlyFlow} />
        <ZonePerformanceChart zoneData={zoneBarData} />
      </motion.div>
    </div>
  );
}