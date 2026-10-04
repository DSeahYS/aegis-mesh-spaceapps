import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Radio, Layers, Flame } from 'lucide-react';

export interface EntitySearchProps {
  onSelectSatellite: (id: string) => void;
  onActivateCatalog: (catalogId: string) => void;
  className?: string;
}

export const AEGIS_SATELLITES = [
  { id: 'AEGIS-01', name: 'Alpha Node', status: 'nominal' },
  { id: 'AEGIS-02', name: 'Bravo Node', status: 'nominal' },
  { id: 'AEGIS-03', name: 'Charlie Node', status: 'nominal' },
  { id: 'AEGIS-04', name: 'Delta Node', status: 'alert' },
  { id: 'AEGIS-05', name: 'Echo Node', status: 'nominal' },
  { id: 'AEGIS-06', name: 'Foxtrot Node', status: 'nominal' },
  { id: 'AEGIS-07', name: 'Golf Node', status: 'maneuvering' },
  { id: 'AEGIS-08', name: 'Hotel Node', status: 'nominal' },
  { id: 'AEGIS-09', name: 'India Node', status: 'nominal' },
  { id: 'AEGIS-10', name: 'Juliet Node', status: 'nominal' },
  { id: 'AEGIS-11', name: 'Kilo Node', status: 'nominal' },
  { id: 'AEGIS-12', name: 'Lima Node', status: 'nominal' },
];

export const DEBRIS_CATALOGS = [
  { id: 'cosmos-1408', name: 'Cosmos-1408 ASAT Debris', count: 3, dangerLevel: 'HIGH', alt: '485 km / 82.6°' },
  { id: 'fengyun-1c', name: 'Fengyun-1C Breakup Ring', count: 1984, dangerLevel: 'CRITICAL', alt: '865 km / 98.6°' },
  { id: 'iridium-33', name: 'Iridium-33 Collision Remnants', count: 110, dangerLevel: 'HIGH', alt: '790 km / 86.4°' },
  { id: 'cosmos-2251', name: 'Cosmos-2251 Remnants', count: 586, dangerLevel: 'HIGH', alt: '790 km / 74.0°' },
  { id: 'sl-16', name: 'SL-16 Derelict Stages', count: 294, dangerLevel: 'ELEVATED', alt: '600-950 km / 71°' },
  { id: 'leo-general', name: 'USSPACECOM Cataloged Debris', count: 1998, dangerLevel: 'MODERATE', alt: '350-1400 km' },
];

export const MEGA_CONSTELLATIONS = [
  { id: 'starlink-1', name: 'Starlink Shell 1', count: 4420, alt: '550 km / 53.0°' },
  { id: 'starlink-2', name: 'Starlink Shell 2', count: 1870, alt: '540 km / 53.2°' },
  { id: 'oneweb', name: 'OneWeb Polar Shell', count: 1190, alt: '1,200 km / 87.9°' },
  { id: 'kuiper', name: 'Project Kuiper Shell', count: 1020, alt: '630 km / 51.9°' },
];

export const EntitySearch: React.FC<EntitySearchProps> = ({
  onSelectSatellite,
  onActivateCatalog,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: press / to focus search, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered lists
  const q = query.trim().toLowerCase();

  const filteredAegis = useMemo(() => {
    if (!q) return AEGIS_SATELLITES;
    return AEGIS_SATELLITES.filter(
      (sat) =>
        sat.id.toLowerCase().includes(q) ||
        sat.name.toLowerCase().includes(q) ||
        sat.status.toLowerCase().includes(q) ||
        (q.length >= 3 && 'aegis'.includes(q)) || q === 'aegis'
    );
  }, [q]);

  const filteredDebris = useMemo(() => {
    if (!q) return DEBRIS_CATALOGS;
    return DEBRIS_CATALOGS.filter(
      (cat) =>
        cat.id.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q) ||
        cat.dangerLevel.toLowerCase().includes(q) ||
        cat.alt.toLowerCase().includes(q) ||
        (q.length >= 3 && 'debris'.includes(q)) || q === 'debris'
    );
  }, [q]);

  const filteredMega = useMemo(() => {
    if (!q) return MEGA_CONSTELLATIONS;
    return MEGA_CONSTELLATIONS.filter(
      (con) =>
        con.id.toLowerCase().includes(q) ||
        con.name.toLowerCase().includes(q) ||
        con.alt.toLowerCase().includes(q) ||
        'constellation'.includes(q) ||
        'swarm'.includes(q) ||
        'starlink'.includes(q) ||
        'oneweb'.includes(q) ||
        'kuiper'.includes(q)
    );
  }, [q]);

  const totalResults = filteredAegis.length + filteredDebris.length + filteredMega.length;

  const handleSelectAegis = (id: string) => {
    onSelectSatellite(id);
    setIsOpen(false);
  };

  const handleSelectDebris = (id: string) => {
    onActivateCatalog(id);
    setIsOpen(false);
  };

  const handleSelectMega = (id: string) => {
    onActivateCatalog(id);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-20 w-72 font-mono select-none pointer-events-auto ${className}`}
    >
      {/* Search Input Bar (Dark Glassmorphic Aerospace Style) */}
      <div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl transition-all ${
          isOpen ? 'border-cyan-500/60 ring-1 ring-cyan-500/30' : 'border-slate-700 hover:border-slate-600'
        }`}
      >
        <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search entities..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
            title="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd
            className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800/90 border border-slate-700/80 rounded shadow-inner"
            title="Press / to focus"
          >
            /
          </kbd>
        )}
      </div>

      {/* Dropdown Results Menu */}
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-80 sm:w-96 max-w-[92vw] rounded-xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col z-30">
          {/* Top Header with Result Count & Keyboard Hint */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/70 border-b border-slate-800/90 text-[10px] text-slate-400">
            <span className="font-semibold text-cyan-400">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
              {q && <span className="text-slate-400 font-normal"> for "{q}"</span>}
            </span>
            <span className="text-slate-500 text-[9px]">ESC to close</span>
          </div>

          {/* Categorized Results Scroll Area */}
          <div className="max-h-80 overflow-y-auto p-1.5 space-y-2">
            {totalResults === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No orbital entities matching "{query}"
              </div>
            ) : (
              <>
                {/* Section 1: AEGIS Nodes */}
                {filteredAegis.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 rounded">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      <span>AEGIS Nodes ({filteredAegis.length})</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {filteredAegis.map((sat) => {
                        const isNominal = sat.status === 'nominal';
                        const isAlert = sat.status === 'alert';

                        const dotColor = isNominal
                          ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                          : isAlert
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse'
                          : 'bg-amber-400 shadow-sm shadow-amber-400/50 animate-pulse';

                        const badgeClass = isNominal
                          ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60'
                          : isAlert
                          ? 'text-rose-400 bg-rose-950/50 border-rose-800/60'
                          : 'text-amber-300 bg-amber-950/50 border-amber-800/60';

                        return (
                          <div
                            key={sat.id}
                            onClick={() => handleSelectAegis(sat.id)}
                            className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                              <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                                {sat.id}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate">
                                {sat.name}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${badgeClass}`}
                            >
                              {sat.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 2: Debris Catalogs */}
                {filteredDebris.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 rounded">
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Debris Catalogs ({filteredDebris.length})</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {filteredDebris.map((cat) => {
                        const isCritical = cat.dangerLevel === 'CRITICAL';
                        const isHigh = cat.dangerLevel === 'HIGH';
                        const isElevated = cat.dangerLevel === 'ELEVATED';

                        const dotColor = isCritical
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : isHigh
                          ? 'bg-orange-500 shadow-sm shadow-orange-500/50'
                          : isElevated
                          ? 'bg-fuchsia-400 shadow-sm shadow-fuchsia-400/50'
                          : 'bg-sky-400 shadow-sm shadow-sky-400/50';

                        const dangerBadgeClass = isCritical
                          ? 'text-rose-300 bg-rose-950/60 border-rose-800/70'
                          : isHigh
                          ? 'text-orange-300 bg-orange-950/60 border-orange-800/70'
                          : isElevated
                          ? 'text-fuchsia-300 bg-fuchsia-950/60 border-fuchsia-800/70'
                          : 'text-sky-300 bg-sky-950/60 border-sky-800/70';

                        return (
                          <div
                            key={cat.id}
                            onClick={() => handleSelectDebris(cat.id)}
                            className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-xs text-slate-100 group-hover:text-purple-300 transition-colors">
                                    {cat.id}
                                  </span>
                                  <span className="text-[11px] text-slate-400 truncate">
                                    {cat.name}
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-500 truncate">
                                  {cat.alt}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-wider font-semibold ${dangerBadgeClass}`}
                              >
                                {cat.dangerLevel}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded border bg-slate-950 text-slate-300 border-slate-800 font-semibold">
                                {cat.count.toLocaleString()} PCS
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section 3: Mega-Constellations */}
                {filteredMega.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 rounded">
                      <Layers className="w-3 h-3 text-cyan-400" />
                      <span>Mega-Constellations ({filteredMega.length})</span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {filteredMega.map((con) => (
                        <div
                          key={con.id}
                          onClick={() => handleSelectMega(con.id)}
                          className="group flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800/70 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-300 transition-colors">
                                  {con.id}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">
                                  {con.name}
                                </span>
                              </div>
                              <div className="text-[9px] text-slate-500 truncate">
                                {con.alt}
                              </div>
                            </div>
                          </div>

                          <span className="text-[9px] px-1.5 py-0.5 rounded border bg-cyan-950/60 text-cyan-300 border-cyan-800/60 font-semibold shrink-0">
                            {con.count.toLocaleString()} PCS
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EntitySearch;
