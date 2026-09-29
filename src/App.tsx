import { useEffect } from 'react';
import type { FC } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DashboardView } from './components/views/DashboardView';
import { OrbitalView } from './components/views/OrbitalView';
import { ConjunctionView } from './components/views/ConjunctionView';
import { MeshView } from './components/views/MeshView';
import { ArchitectureView } from './components/views/ArchitectureView';
import { CLMLabView } from './components/views/CLMLabView';

export const App: FC = () => {
  const activeView = useSimulationStore((state) => state.activeView);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const timeScale = useSimulationStore((state) => state.timeScale);
  const advanceTime = useSimulationStore((state) => state.advanceTime);

  // Synchronous simulation clock loop
  useEffect(() => {
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      if (isPlaying) {
        advanceTime(dt * timeScale);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, timeScale, advanceTime]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'orbital':
        return <OrbitalView />;
      case 'conjunction':
        return <ConjunctionView />;
      case 'mesh':
        return <MeshView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'clm-lab':
        return <CLMLabView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-space-900 text-slate-200 antialiased font-sans">
      {/* Top Header Bar (h-14) */}
      <Header />

      {/* Main Workspace (Sidebar + Active View) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-space-950/70 relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Bottom Status Bar (h-8) */}
      <StatusBar />
    </div>
  );
};

export default App;
