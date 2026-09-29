import type { FC } from 'react';
import { Radio, Activity, Link2 } from 'lucide-react';
import { useSimulationStore, type TelemetryType } from '../../store/simulationStore';

function formatTime(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const mins = String(d.getUTCMinutes()).padStart(2, '0');
  const secs = String(d.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${mins}:${secs}Z`;
}

function getColorForType(type: TelemetryType): string {
  switch (type) {
    case 'critical':
      return 'text-alert-red font-semibold drop-shadow-md';
    case 'warning':
      return 'text-alert-amber';
    case 'info':
    default:
      return 'text-cyber-green';
  }
}

export const StatusBar: FC = () => {
  const telemetryMessages = useSimulationStore((state) => state.telemetryMessages);

  // Take the latest 5 messages
  const latestMessages = telemetryMessages.slice(-5);

  return (
    <footer className="h-8 bg-space-900 border-t border-space-700/60 px-3 flex items-center justify-between text-xs font-mono select-none z-20 shrink-0 overflow-hidden">
      {/* Left: Telemetry Ticker Header */}
      <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-space-700/60">
        <span className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-space-800 border border-space-600 text-slate-300 text-[10px] font-bold tracking-wider">
          <Activity className="w-3 h-3 text-cyber-green " />
          TLM
        </span>
        <span className="text-[10px] text-slate-400 hidden sm:inline">LIVE FEED</span>
      </div>

      {/* Center: Scrolling Telemetry Ticker */}
      <div className="flex-1 mx-3 overflow-hidden whitespace-nowrap relative mask-fade">
        <div className="inline-flex items-center gap-6 animate-none overflow-x-auto scrollbar-none py-0.5">
          {latestMessages.map((msg) => (
            <div key={msg.id} className="inline-flex items-center gap-2 shrink-0 text-xs">
              <span className="text-slate-400 font-mono text-[10px]">
                [{formatTime(msg.timestamp)}]
              </span>
              <span className={getColorForType(msg.type)}>
                {msg.message}
              </span>
              <span className="text-space-600 mx-1">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Constellation & ISL Link Status Indicators */}
      <div className="flex items-center gap-4 shrink-0 pl-3 border-l border-space-700/60 text-[11px] font-mono">
        {/* Constellation Nodes Status */}
        <div className="flex items-center gap-1.5" title="All 12 Constellation Nodes Online & Synchronized">
          <Radio className="w-3.5 h-3.5 text-cyber-green" />
          <span className="text-slate-400">NODES:</span>
          <span className="text-cyber-green font-bold tracking-wider">12/12 ONLINE</span>
          <span className="w-2 h-2 rounded-full bg-cyber-green shadow-md " />
        </div>

        <span className="text-space-600">|</span>

        {/* ISL Status */}
        <div className="flex items-center gap-1.5" title="Laser Inter-Satellite Cross-Links Active">
          <Link2 className="w-3.5 h-3.5 text-cyber-blue" />
          <span className="text-slate-400">ISL:</span>
          <span className="text-cyber-blue font-bold tracking-wider">ACTIVE</span>
          <span className="w-2 h-2 rounded-full bg-cyber-blue shadow-md" />
        </div>
      </div>
    </footer>
  );
};
