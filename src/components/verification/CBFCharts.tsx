import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';
import type { PipelineCBF } from '../../lib/apiClient';
import { formatProbability, formatNumberSmart } from './formatters';

interface CBFChartsProps {
  cbf: PipelineCBF;
}

interface CustomTooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
  label?: number;
  unit?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-space-900/95 border border-space-600 p-2.5 rounded-lg shadow-xl text-[11px] font-mono text-slate-200 backdrop-blur-md">
        <div className="text-slate-400 font-bold border-b border-space-700 pb-1 mb-1.5">
          Time t = {typeof label === 'number' ? label.toFixed(2) : label} s
        </div>
        <div className="space-y-1">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold text-white">
                {formatNumberSmart(item.value)} {unit ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const CBFCharts: React.FC<CBFChartsProps> = ({ cbf }) => {
  const chartData = cbf.t_s.map((t, idx) => ({
    t,
    h_filtered: cbf.h_filtered[idx] ?? 0,
    h_nominal: cbf.h_nominal[idx] ?? 0,
    miss_filtered: cbf.miss_filtered_m[idx] ?? 0,
    miss_nominal: cbf.miss_nominal_m[idx] ?? 0,
  }));

  return (
    <div className="space-y-4 font-mono">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        {/* Forward Invariance Badge */}
        <div
          className={`p-3 rounded-lg border flex flex-col justify-between ${
            cbf.forward_invariant
              ? 'bg-cyber-green/10 border-cyber-green/40 text-cyber-green'
              : 'bg-alert-red/10 border-alert-red/40 text-alert-red'
          }`}
        >
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
            <span>FORWARD INVARIANCE</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-sm font-black mt-1">
            {cbf.forward_invariant ? '✓ CERTIFIED INVARIANT' : '✗ SAFETY VIOLATED'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Min h after entry: {formatNumberSmart(cbf.min_h_after_entry)}
          </div>
        </div>

        {/* Interventions & Saturated Steps */}
        <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
            <span>CBF INTERVENTIONS</span>
            <span className="text-cyan-400 font-bold">{cbf.interventions} steps</span>
          </div>
          <div className="text-lg font-black text-white mt-1">
            {cbf.interventions} <span className="text-xs text-slate-400 font-normal">/ {cbf.t_s.length} steps</span>
          </div>
          <div className="text-[10px] text-slate-500">
            Saturated: {cbf.saturated_steps} &bull; Keepout k: {cbf.keepout_k.toFixed(2)}σ
          </div>
        </div>

        {/* Filtered Final Pc */}
        <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            FILTERED FINAL Pc
          </div>
          <div className="text-lg font-black text-cyber-green mt-1">
            {formatProbability(cbf.final_pc_filtered)}
          </div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyber-green" />
            Below safety threshold
          </div>
        </div>

        {/* Nominal Final Pc */}
        <div className="p-3 rounded-lg bg-space-900 border border-space-700 flex flex-col justify-between">
          <div className="text-[10px] text-slate-400 uppercase font-bold">
            NOMINAL UNFILTERED Pc
          </div>
          <div className="text-lg font-black text-alert-amber mt-1">
            {formatProbability(cbf.final_pc_nominal)}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <AlertOctagon className="w-3 h-3 text-alert-amber" />
            Without barrier filter
          </div>
        </div>
      </div>

      {/* Two LineCharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Barrier Function h(p) */}
        <div className="bg-space-900 border border-space-700 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-space-800 pb-2">
            <span>HIGH-ORDER BARRIER FUNCTION h(p) = pᵀMp − k²</span>
            <span className="text-[10px] text-slate-500 font-normal">Safe when h ≥ 0</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="t"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val: number) => `${val.toFixed(0)}s`}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val: number) => formatNumberSmart(val, 1)}
                />
                <Tooltip content={<CustomChartTooltip unit="" />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                  iconType="plainline"
                />
                <ReferenceLine
                  y={0}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: 'Barrier Safety Boundary (h=0)',
                    fill: '#ef4444',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="h_filtered"
                  name="CBF Filtered h(t)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="h_nominal"
                  name="Nominal Unfiltered h_nom(t)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Lateral Miss Distance */}
        <div className="bg-space-900 border border-space-700 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-space-800 pb-2">
            <span>LATERAL MISS DISTANCE TRAJECTORY ||p(t)||</span>
            <span className="text-[10px] text-slate-500 font-normal">Under worst-case disturbance</span>
          </div>

          <div className="w-full h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="t"
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val: number) => `${val.toFixed(0)}s`}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(val: number) => `${val.toFixed(0)}m`}
                />
                <Tooltip content={<CustomChartTooltip unit="m" />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                  iconType="plainline"
                />
                <Line
                  type="monotone"
                  dataKey="miss_filtered"
                  name="CBF Filtered Miss (m)"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="miss_nominal"
                  name="Nominal Miss (m)"
                  stroke="#a855f7"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
