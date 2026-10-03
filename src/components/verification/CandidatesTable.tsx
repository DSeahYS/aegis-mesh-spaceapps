import React, { useState } from 'react';
import { CheckCircle2, XCircle, Award } from 'lucide-react';
import type { PipelineCandidate, PipelineRuleResult } from '../../lib/apiClient';
import { formatNumberSmart } from './formatters';

interface CandidatesTableProps {
  candidates: PipelineCandidate[];
  selectedIndex: number | null;
  selectedCandidate: PipelineCandidate | null;
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({
  candidates,
  selectedIndex,
  selectedCandidate,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<{
    candidateId: number;
    ruleId: string;
    rule: PipelineRuleResult;
    x: number;
    y: number;
  } | null>(null);

  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-6 text-center border border-dashed border-space-700 rounded-lg text-slate-400 font-mono text-xs">
        No CLM candidates evaluated yet.
      </div>
    );
  }

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLButtonElement>,
    candId: number,
    rule: PipelineRuleResult
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveTooltip({
      candidateId: candId,
      ruleId: rule.id,
      rule,
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">CLM CANDIDATE MANEUVER EVALUATION</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-space-700 text-slate-300">
            {candidates.length} MANEUVERS EVALUATED
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Hover rule chips (R1–R5) for threshold &amp; constraint details
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-space-700 bg-space-950">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr className="border-b border-space-700 bg-space-900/90 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3 w-12 text-center">Rank</th>
              <th className="py-2.5 px-3">Candidate Label &amp; Category</th>
              <th className="py-2.5 px-3 text-right">Δv (m/s)</th>
              <th className="py-2.5 px-3 text-center">Direction [R, T, N]</th>
              <th className="py-2.5 px-3 text-right">Confidence</th>
              <th className="py-2.5 px-3 text-right">Score</th>
              <th className="py-2.5 px-4 text-center">OpenSPG/KGDSL Rules (R1–R5)</th>
              <th className="py-2.5 px-3 text-center w-24">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800 text-[11px]">
            {candidates.map((cand, idx) => {
              const isSelected =
                selectedIndex === idx ||
                (selectedCandidate && selectedCandidate.id === cand.id) ||
                (cand.accepted && selectedIndex === null && idx === 0);

              const isRejected = !cand.accepted;

              return (
                <tr
                  key={`${cand.id}-${idx}`}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-cyber-green/15 border-l-4 border-l-cyber-green font-semibold'
                      : isRejected
                      ? 'bg-space-950/40 text-slate-500 hover:bg-space-900/40'
                      : 'bg-space-900/40 text-slate-200 hover:bg-space-900/70'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-2 px-3 text-center">
                    <span className={isSelected ? 'text-cyber-green font-bold' : 'text-slate-500'}>
                      #{cand.rank ?? idx + 1}
                    </span>
                  </td>

                  {/* Label & Category */}
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${isSelected ? 'text-white' : isRejected ? 'text-slate-400' : 'text-slate-200'}`}>
                        {cand.label}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-space-800 text-slate-400 border border-space-700 uppercase">
                        {cand.category}
                      </span>
                    </div>
                  </td>

                  {/* Delta-V */}
                  <td className="py-2 px-3 text-right">
                    <span className={isSelected ? 'text-cyan-300 font-bold' : isRejected ? 'text-slate-500' : 'text-slate-300'}>
                      {cand.delta_v_mps.toFixed(2)}
                    </span>
                  </td>

                  {/* RTN Direction */}
                  <td className="py-2 px-3 text-center text-[10px] text-slate-400">
                    [{cand.direction_rtn.map((v) => v.toFixed(2)).join(', ')}]
                  </td>

                  {/* Confidence */}
                  <td className="py-2 px-3 text-right text-slate-400">
                    {(cand.confidence * 100).toFixed(1)}%
                  </td>

                  {/* Score */}
                  <td className="py-2 px-3 text-right text-slate-400">
                    {cand.score.toFixed(3)}
                  </td>

                  {/* Rule Chips R1..R5 */}
                  <td className="py-2 px-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {cand.rules.map((rule) => {
                        const passed = rule.passed;
                        return (
                          <button
                            key={rule.id}
                            type="button"
                            onMouseEnter={(e) => handleMouseEnter(e, cand.id, rule)}
                            onMouseLeave={handleMouseLeave}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              passed
                                ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/40 hover:bg-cyber-green/20'
                                : 'bg-alert-red/10 text-alert-red border-alert-red/40 hover:bg-alert-red/20'
                            }`}
                            title={`${rule.id} (${rule.name}): ${passed ? 'PASSED' : 'FAILED'} — Val: ${formatNumberSmart(rule.value)} / Lim: ${formatNumberSmart(rule.limit)} ${rule.unit ?? ''}\n${rule.detail}`}
                          >
                            <span>{rule.id}</span>
                            {passed ? (
                              <CheckCircle2 className="w-2.5 h-2.5" />
                            ) : (
                              <XCircle className="w-2.5 h-2.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Outcome Badge */}
                  <td className="py-2 px-3 text-center">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyber-green text-space-950 shadow-sm shadow-cyber-green/50">
                        <Award className="w-3 h-3" />
                        SELECTED
                      </span>
                    ) : cand.accepted ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        ACCEPTED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-space-900 text-slate-500 border border-space-800">
                        REJECTED
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Floating Rule Tooltip */}
      {activeTooltip && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full bg-space-900 border border-space-600 rounded-lg p-2.5 shadow-2xl text-[11px] font-mono text-slate-200 max-w-sm backdrop-blur-md"
          style={{ left: activeTooltip.x, top: activeTooltip.y }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-space-700 pb-1 mb-1.5">
            <span className="font-bold text-white flex items-center gap-1.5">
              <span className="text-cyan-300">{activeTooltip.rule.id}</span>
              <span>{activeTooltip.rule.name}</span>
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                activeTooltip.rule.passed
                  ? 'bg-cyber-green/15 text-cyber-green border-cyber-green/40'
                  : 'bg-alert-red/15 text-alert-red border-alert-red/40'
              }`}
            >
              {activeTooltip.rule.passed ? 'PASSED' : 'REJECTED'}
            </span>
          </div>
          <div className="space-y-0.5 text-[10px]">
            <div className="text-slate-400">
              Evaluated Value:{' '}
              <span className="text-slate-200 font-bold">
                {formatNumberSmart(activeTooltip.rule.value)} {activeTooltip.rule.unit}
              </span>
            </div>
            <div className="text-slate-400">
              Threshold Limit:{' '}
              <span className="text-slate-200 font-bold">
                {formatNumberSmart(activeTooltip.rule.limit)} {activeTooltip.rule.unit}
              </span>
            </div>
            <div className="text-slate-300 font-sans mt-1 text-[10px] border-t border-space-800 pt-1 leading-tight">
              {activeTooltip.rule.detail}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
