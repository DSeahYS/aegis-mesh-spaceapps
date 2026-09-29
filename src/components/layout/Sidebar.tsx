import { useState } from 'react';
import type { FC } from 'react';
import {
  LayoutDashboard,
  Globe,
  AlertTriangle,
  Network,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Shield,
  BrainCircuit,
} from 'lucide-react';
import { useSimulationStore, type ActiveView } from '../../store/simulationStore';

interface NavItem {
  id: ActiveView;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Mission Dashboard',
    shortLabel: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'orbital',
    label: '3D Orbital View',
    shortLabel: 'Orbital',
    icon: Globe,
    badge: '3D',
  },
  {
    id: 'conjunction',
    label: 'Conjunction Assessment',
    shortLabel: 'Conjunction',
    icon: AlertTriangle,
  },
  {
    id: 'mesh',
    label: 'Mesh Network & ISL',
    shortLabel: 'Mesh ISL',
    icon: Network,
  },
  {
    id: 'architecture',
    label: 'System Architecture',
    shortLabel: 'Architecture',
    icon: Cpu,
  },
  {
    id: 'clm-lab',
    label: 'Stanford CLM Lab',
    shortLabel: 'CLM Lab',
    icon: BrainCircuit,
    badge: 'NEW',
  },
];

export const Sidebar: FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const activeView = useSimulationStore((state) => state.activeView);
  const setActiveView = useSimulationStore((state) => state.setActiveView);
  const activeAlerts = useSimulationStore((state) => state.activeAlerts);

  const conjunctionAlertCount = activeAlerts.filter(
    (a) => a.type === 'conjunction' && (a.severity === 'high' || a.severity === 'critical')
  ).length;

  return (
    <aside
      className={`relative flex flex-col justify-between bg-space-900 border-r border-space-700/60 transition-all duration-300 ease-in-out z-30 select-none ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Top Section: Logo & Brand */}
      <div>
        <div className="h-14 flex items-center px-3 border-b border-space-700/60">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Stylized AΞ Logo */}
            <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-space-800 border border-cyber-green/40 shadow-md group-hover:border-cyber-green">
              <span className="font-mono font-black text-lg tracking-wider text-cyber-green drop-shadow-md">
                AΞ
              </span>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            </div>

            {isExpanded && (
              <div className="flex flex-col whitespace-nowrap overflow-hidden transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-widest text-slate-100 font-mono">
                    AEGIS<span className="text-cyber-green">-</span>MESH
                  </span>
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                  LEO Defense Grid
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            const hasAlertBadge = item.id === 'conjunction' && conjunctionAlertCount > 0;

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/40 shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/80 border border-transparent'
                  }`}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative shrink-0 flex items-center justify-center">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${
                        isActive ? 'text-cyber-green scale-110 drop-shadow-md' : ''
                      }`}
                    />
                    {hasAlertBadge && !isExpanded && (
                      <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-alert-red animate-ping" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="flex-1 flex items-center justify-between whitespace-nowrap overflow-hidden">
                      <span className="truncate">{item.label}</span>
                      {hasAlertBadge ? (
                        <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-alert-red/20 text-alert-red border border-alert-red/40 animate-pulse">
                          {conjunctionAlertCount} ALERT
                        </span>
                      ) : item.badge ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-space-700/80 text-cyber-blue border border-space-600">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </button>

                {/* Collapsed Tooltip */}
                {!isExpanded && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-space-800 border border-space-600 rounded-md shadow-xl text-xs font-medium text-slate-200 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                    <div className="flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {hasAlertBadge && (
                        <span className="px-1 py-0.2 text-[9px] bg-alert-red/20 text-alert-red rounded font-mono">
                          {conjunctionAlertCount}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Shield Indicator & Collapse Toggle */}
      <div className="p-2 border-t border-space-700/60 space-y-2">
        {isExpanded ? (
          <div className="p-2.5 rounded-lg bg-space-800/60 border border-space-700 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-cyber-green" />
                CONSTELLATION
              </span>
              <span className="text-cyber-green">OPTIMAL</span>
            </div>
            <div className="w-full bg-space-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyber-green h-full w-full shadow-md" />
            </div>
            <div className="flex justify-between items-center mt-1 text-[9px] font-mono text-slate-400">
              <span>12/12 NODES</span>
              <span>100% COVERAGE</span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-colors"
          title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
          aria-label={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isExpanded ? (
            <div className="flex items-center gap-2 text-xs font-mono">
              <ChevronLeft className="w-4 h-4" />
              <span>COLLAPSE</span>
            </div>
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
