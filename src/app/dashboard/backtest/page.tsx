'use client';

import { useEffect } from 'react';
import { useUIStore } from '../supermotor/state/ui';
import Topbar from '../supermotor/components/Topbar';
import LeftTools from '../supermotor/components/LeftTools';
import ChartGrid from '../supermotor/components/ChartGrid';
import BottomDock from '../supermotor/components/BottomDock';
import RightDock from '../supermotor/components/RightDock';

export default function BacktestPage() {
  const { layout, currentSymbol, currentTimeframe, panels, addPanel } = useUIStore();

  // Initialize panels based on layout
  useEffect(() => {
    const requiredPanels = layout === '1x1' ? 1 : layout === '2x1' ? 2 : 4;

    if (panels.length < requiredPanels) {
      const panelsToAdd = requiredPanels - panels.length;
      for (let i = 0; i < panelsToAdd; i++) {
        addPanel({
          id: `panel-${panels.length + i + 1}`,
          symbol: currentSymbol,
          timeframe: currentTimeframe,
          indicators: [],
          visible: true,
        });
      }
    }
  }, [layout, currentSymbol, currentTimeframe, panels.length, addPanel, panels]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const { setActiveTool, startBacktest } = useUIStore.getState();

      switch (e.key.toLowerCase()) {
        case 'c':
          setActiveTool('cursor');
          break;
        case 'x':
          setActiveTool('crosshair');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'f':
          setActiveTool('fibo');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 'e':
          setActiveTool('eraser');
          break;
        case 'b':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const runId = `run-${Date.now()}`;
            startBacktest(runId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#131722] overflow-hidden">
      {/* Topbar */}
      <Topbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Tools */}
        <LeftTools />

        {/* Chart Grid */}
        <div className="flex-1 relative overflow-hidden">
          <ChartGrid />
        </div>

        {/* Right Dock */}
        <RightDock />
      </div>

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
}
