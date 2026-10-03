import type { FC } from 'react';
import { Play, Pause, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Mission Dashboard',
  orbital: '3D Orbital View',
  conjunction: 'Conjunction Assessment',
  mesh: 'Mesh Network & ISL',
  architecture: 'System Architecture',
  'clm-lab': 'Stanford CLM Lab',
  'clm-gpu': 'GPU Inference Proof',
  backend: 'Backend Console',
  verification: 'V&V Proof & Math Engine',
};

const TIME_SCALES = [1, 10, 100, 1000] as const;

function formatUtcTime(epochSeconds: number): string {
  if (!epochSeconds || isNaN(epochSeconds)) return '--:--:-- UTC';
  const d = new Date(epochSeconds * 1000);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  const seconds = String(d.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

export const Header: FC = () => {
  const activeView = useSimulationStore((state) => state.activeView);
  const setActiveView = useSimulationStore((state) => state.setActiveView);
  const simulationTime = useSimulationStore((state) => state.simulationTime);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const activeAlerts = useSimulationStore((state) => state.activeAlerts);
  const togglePlayback = useSimulationStore((state) => state.togglePlayback);
  const setTimeScale = useSimulationStore((state) => state.setTimeScale);

  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'high' || a.severity === 'medium').length;
  const totalAlerts = activeAlerts.length;

  return (
    <header className="h-14 bg-space-900 border-b border-space-700/60 px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left: AEGIS-MESH Title + NASA Space Apps Badge + Current View Name */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-base tracking-widest text-slate-100">
            AEGIS<span className="text-cyber-green">-</span>MESH
          </span>
          <span className="text-space-600 font-mono">/</span>
          <span className="font-mono text-xs sm:text-sm font-semibold text-cyber-green uppercase tracking-wider">
            {VIEW_TITLES[activeView] || activeView}
          </span>
        </div>

        {/* NASA Space Apps 2026 Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/50 text-[10px] font-mono tracking-wider text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider text-slate-100">NASA SPACE APPS 2026</span>
        </div>

        <span className="hidden 2xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wider bg-space-800 border border-space-600 text-slate-300">
          AUTONOMOUS CLM v4.2
        </span>
      </div>

      {/* Center: Simulation Clock & Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Clock Display */}
        <div className="flex items-center gap-2 px-3 py-1 bg-space-800/90 rounded border border-space-700/80 font-mono text-xs sm:text-sm text-slate-200 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyber-green " />
          <span className="tracking-wider">{formatUtcTime(simulationTime)}</span>
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlayback}
          className={`flex items-center justify-center w-8 h-8 rounded border transition-colors ${
            isPlaying
              ? 'bg-space-800 border-space-600 text-cyber-green hover:bg-space-700'
              : 'bg-alert-amber/20 border-alert-amber/60 text-alert-amber  hover:bg-alert-amber/30'
          }`}
          title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          aria-label={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Speed Controls (1x, 10x, 100x, 1000x) */}
        <div className="flex items-center rounded bg-space-800/80 p-0.5 border border-space-700">
          {TIME_SCALES.map((scale) => {
            const isCurrent = timeScale === scale;
            return (
              <button
                key={scale}
                type="button"
                onClick={() => setTimeScale(scale)}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/60 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {scale}x
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: System Status Indicators & Active Alerts */}
      <div className="flex items-center gap-4">
        {/* 3 Small Colored Status Dots */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-space-800/60 border border-space-700 text-xs font-mono">
          {/* Green: Nominal Systems */}
          <div className="flex items-center gap-1.5" title="Systems: Nominal">
            <span className="w-2.5 h-2.5 rounded-full bg-cyber-green shadow-md animate-pulse" />
            <span className="hidden lg:inline text-[11px] text-slate-300">NOM</span>
          </div>

          <span className="text-space-600">|</span>

          {/* Amber: Warnings */}
          <div className="flex items-center gap-1.5" title={`${warningCount} Warning(s)`}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                warningCount > 0
                  ? 'bg-alert-amber shadow-md '
                  : 'bg-alert-amber/30'
              }`}
            />
            <span className="hidden lg:inline text-[11px] text-slate-300">WARN</span>
          </div>

          <span className="text-space-600">|</span>

          {/* Red: Critical */}
          <div className="flex items-center gap-1.5" title={`${criticalCount} Critical Event(s)`}>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                criticalCount > 0
                  ? 'bg-alert-red shadow-md '
                  : 'bg-alert-red/30'
              }`}
            />
            <span className="hidden lg:inline text-[11px] text-slate-300">CRIT</span>
          </div>
        </div>

        {/* Count of Active Alerts */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-bold ${
            criticalCount > 0
              ? 'bg-alert-red/20 border-alert-red/60 text-alert-red shadow-md '
              : totalAlerts > 0
              ? 'bg-alert-amber/20 border-alert-amber/60 text-alert-amber'
              : 'bg-space-800 border-space-700 text-cyber-green'
          }`}
          title={`${totalAlerts} Active Alerts (${criticalCount} Critical)`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{totalAlerts} ALERTS</span>
        </div>

        {/* Quick Link to V&V Proof Tab for Judges */}
        <button
          type="button"
          onClick={() => setActiveView('verification')}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-mono font-bold transition-all cursor-pointer ${
            activeView === 'verification'
              ? 'bg-cyber-green/20 border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(16,185,129,0.25)]'
              : 'bg-space-800 hover:bg-cyber-green/10 border-space-600 hover:border-cyber-green/50 text-slate-300 hover:text-cyber-green'
          }`}
          title="Verify live astrodynamics math (Foster B-plane, Hamilton-Jacobi, CBF) in the V&V Proof pipeline"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyber-green" />
          <span>V&V PROOF</span>
        </button>
      </div>
    </header>
  );
};
