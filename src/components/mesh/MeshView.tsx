import React from 'react';
import { TopologyGraph } from './TopologyGraph';
import { WorkloadMigration } from './WorkloadMigration';
import { QKDIndicator } from './QKDIndicator';
import { Network, Activity, Wifi, RefreshCw, Zap } from 'lucide-react';

export const MeshView: React.FC = () => {
  return (
    <div className="w-full space-y-6 text-slate-100">
      {/* Top Network Stats Bar */}
      <div className="bg-[#0b1120] border border-cyan-950/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <Network className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold tracking-tight text-white uppercase">
                DISTRIBUTED SATELLITE MESH NETWORK
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              INTER-SATELLITE LASER CROSSLINKS (ISL) • AUTONOMOUS RESILIENT CONSENSUS & TASK OFFLOADING
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 " />
              <span>CONSTELLATION HEALTH: 98.4%</span>
            </span>
          </div>
        </div>

        {/* Global Network Telemetry Tiles */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>NODES ONLINE</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-lg text-emerald-400 font-bold mt-1 block">12 / 12</span>
            <span className="text-[10px] text-slate-400">100% Ring Mesh Quorum</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>TOTAL ISL BANDWIDTH</span>
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="text-lg text-cyan-400 font-bold mt-1 block">120 Gbps</span>
            <span className="text-[10px] text-slate-400">Optical Laser Crosslinks</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>MIGRATIONS ACTIVE</span>
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            </div>
            <span className="text-lg text-amber-400 font-bold mt-1 block">1 ACTIVE</span>
            <span className="text-[10px] text-slate-400">AEGIS-04 → AEGIS-05</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/70">
            <div className="flex items-center justify-between text-slate-500 text-[10px]">
              <span>MEAN ISL LATENCY</span>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-lg text-purple-400 font-bold mt-1 block">2.4 ms</span>
            <span className="text-[10px] text-slate-400">Speed-of-Light In Vacuum</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Topology Graph (Left) & Workload Migration (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 flex flex-col justify-start">
          <TopologyGraph />
        </div>

        <div className="lg:col-span-6 flex flex-col justify-start">
          <WorkloadMigration />
        </div>
      </div>

      {/* Bottom: QKD Security Indicator */}
      <div>
        <QKDIndicator />
      </div>
    </div>
  );
};
