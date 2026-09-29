import React, { useMemo } from 'react';
import {
  Satellite,
  ShieldAlert,
  Zap,
  Activity,
  Radio,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ThreatMatrix } from './ThreatMatrix';
import { SystemHealthPanel } from './SystemHealthPanel';
import { LatencyComparison } from './LatencyComparison';
import { ManeuverLog } from './ManeuverLog';
import { DataSelectorPanel } from './DataSelectorPanel';
import debrisScenariosData from '../../data/debrisScenarios.json';
import constellationData from '../../data/constellation.json';

interface DashboardViewProps {
  className?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ className = '' }) => {
  // Compute dynamic stats
  const totalNodes = constellationData.length; // 12
  const activeThreatsCount = useMemo(() => {
    // Count active threats (events where maneuver is not aborted or severity is medium/high/critical)
    return debrisScenariosData.filter((s) => s.maneuver.status !== 'aborted').length;
  }, []);

  const criticalThreatsCount = useMemo(() => {
    return debrisScenariosData.filter((s) => s.severity === 'critical').length;
  }, []);

  return (
    <div className={`w-full space-y-6 text-slate-100 ${className}`}>
      {/* Top Mission Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-space-600/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyber-green animate-pulse"></span>
            <span className="text-xs font-mono tracking-widest text-cyber-green uppercase font-semibold">
              AEGIS-MESH MISSION CONTROL
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-mono text-slate-400">LEO ORBITAL SHELL 53.2°</span>
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mt-0.5">
            Autonomous Space Traffic Management & Edge Avoidance
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-space-800/80 border border-space-600 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyber-blue animate-pulse" />
            <span className="text-slate-400">ISL MESH:</span>
            <span className="text-cyber-green font-semibold">CONNECTED (12/12)</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-space-800/80 border border-space-600 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300">EPOCH: 2026.277 UTC</span>
          </div>
        </div>
      </div>

      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Nodes */}
        <div className="bg-space-800 border border-space-600 rounded-lg p-4 shadow-lg transition-all duration-300 hover:border-cyber-blue/60 hover:shadow-md flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Nodes
            </span>
            <div className="p-2 rounded-lg bg-space-700/80 text-cyber-blue border border-space-600 group-hover:border-cyber-blue/40 transition-colors">
              <Satellite className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span>{totalNodes}</span>
              <span className="text-xs font-mono font-normal text-cyber-green flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyber-green inline-block mr-1"></span>
                Active Shell
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>3 Planes × 4 Satellites</span>
              <span className="font-mono text-slate-400">550 km LEO</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Threats */}
        <div className="bg-space-800 border border-space-600 rounded-lg p-4 shadow-lg transition-all duration-300 hover:border-alert-red/60 hover:shadow-md flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Threats
            </span>
            <div className="p-2 rounded-lg bg-space-700/80 text-alert-red border border-space-600 group-hover:border-alert-red/40 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-alert-red flex items-baseline gap-2">
              <span>{activeThreatsCount}</span>
              <span className="text-xs font-mono font-normal text-alert-red/90 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-alert-red inline-block mr-1 animate-ping"></span>
                {criticalThreatsCount} Critical
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Conjunction Horizon &lt; 24h</span>
              <span className="font-mono text-alert-amber">1 Executing</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Response Time */}
        <div className="bg-space-800 border border-space-600 rounded-lg p-4 shadow-lg transition-all duration-300 hover:border-cyber-green/60 hover:shadow-md flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Avg Response Time
            </span>
            <div className="p-2 rounded-lg bg-space-700/80 text-cyber-green border border-space-600 group-hover:border-cyber-green/40 transition-colors">
              <Zap className="w-4 h-4 fill-cyber-green/20" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-cyber-green flex items-baseline gap-1">
              <span>16</span>
              <span className="text-base font-semibold">ms</span>
              <span className="ml-auto text-[11px] font-mono font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                1.5M× Faster
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Edge AI Closed-Loop</span>
              <span className="font-mono text-slate-400">vs 16h Ground</span>
            </div>
          </div>
        </div>

        {/* Card 4: Network Uptime */}
        <div className="bg-space-800 border border-space-600 rounded-lg p-4 shadow-lg transition-all duration-300 hover:border-cyber-blue/60 hover:shadow-md flex flex-col justify-between group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Network Uptime
            </span>
            <div className="p-2 rounded-lg bg-space-700/80 text-cyber-blue border border-space-600 group-hover:border-cyber-blue/40 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold font-mono tracking-tight text-white flex items-baseline gap-2">
              <span className="text-cyber-blue">99.97%</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                Mesh Cons.
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Zero Drop In-Orbit</span>
              <span className="font-mono text-cyber-green flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Nominal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2-column on large screens (Left wider, Right narrower), 1-column on small */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Wider: col-span-7 on lg, col-span-7 on xl) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Threat Assessment Matrix */}
          <ThreatMatrix />

          {/* Response Time Analysis & Latency Comparison */}
          <LatencyComparison />
        </div>

        {/* Right Column (Narrower: col-span-5 on lg, col-span-5 on xl) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Constellation Health Overview */}
          <SystemHealthPanel />

          {/* Autonomous Maneuver Log Timeline */}
          <ManeuverLog />
        </div>
      </div>

      {/* Massive Orbital Dataset Ingestion Selector */}
      <DataSelectorPanel />
    </div>
  );
};

export default DashboardView;
