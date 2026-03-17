import { useState } from "react";
import { useTrafficData, type Zone } from "@/hooks/use-traffic-data";
import DashboardHeader from "./_components/dashboard-header";
import MetricsCards from "./_components/metrics-cards";
import ZoneSummaries from "./_components/zone-summaries";
import SystemStatus from "./_components/system-status";
import SignalStatus from "./_components/signal-status";
import CameraMonitoring from "./_components/camera-monitoring";
import TrafficAnalytics from "./_components/traffic-analytics";
import IncidentAlerts from "./_components/incident-alerts";
import TrafficMap from "./_components/traffic-map";
import { BrainCircuit } from "lucide-react";

export default function DashboardPage() {
  const [zone, setZone] = useState<Zone>("global");
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // 🔥 Pulling the triggerEmergency function from our hook
  const { data, refresh, triggerEmergency } = useTrafficData(zone, autoRefresh, 1000);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <DashboardHeader
        zone={zone}
        onZoneChange={setZone}
        autoRefresh={autoRefresh}
        onAutoRefreshChange={setAutoRefresh}
        onRefresh={refresh}
        lastUpdated={data.lastUpdated}
        systemStatus={data.systemStatus}
      />

      <main className="flex-1 overflow-auto p-4 space-y-4 max-w-[1600px] mx-auto w-full">
        
        {/* HACKATHON FLEX: AI Status Banner */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg shadow-sm">
          <BrainCircuit className="w-5 h-5 animate-pulse" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest">Adaptive AI Engine Active</p>
            <p className="text-[10px] text-emerald-400/80">Signal timings are currently being dynamically optimized based on real-time intersection density.</p>
          </div>
        </div>

        <MetricsCards metrics={data.metrics} />
        <ZoneSummaries summaries={data.zoneSummaries} />

        {/* 🔥 PRO GRID LAYOUT 🔥 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT COLUMN (Wider) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Camera Network</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <CameraMonitoring cameras={data.cameras} signals={data.signals} onEmergency={triggerEmergency} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Map & Flow</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <TrafficMap vehicles={data.vehiclePositions} signals={data.signals} incidents={data.incidents} cameras={data.cameras} />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Analytics</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <TrafficAnalytics distribution={data.vehicleDistribution} hourlyFlow={data.hourlyFlow} metrics={data.metrics} zoneSummaries={data.zoneSummaries} />
            </div>
          </div>

          {/* RIGHT COLUMN (Narrower) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* 🔥 MOVED SIGNAL NETWORK TO TOP 🔥 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Signal Network</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <SignalStatus signals={data.signals} />
            </div>

            {/* 🔥 MOVED INCIDENTS RIGHT BELOW SIGNALS 🔥 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Incidents</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <IncidentAlerts incidents={data.incidents} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">System Health</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <SystemStatus status={data.systemStatus} />
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-border px-4 py-2 flex items-center justify-between text-[10px] text-muted-foreground/60">
        <span className="uppercase tracking-widest">TrafficOS v3.2.1</span>
        <span className="font-mono">
          {data.lastUpdated.toLocaleString([], { dateStyle: "short", timeStyle: "medium" })}
        </span>
        <span className="uppercase tracking-widest">Smart City Initiative</span>
      </footer>
    </div>
  );
}