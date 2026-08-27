import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  FastForward,
  Play
} from 'lucide-react';

export default function DemoScenarioBar() {
  const {
    demoSteps,
    currentDemoStep,
    runDemoStep,
    isAutoPlayingDemo,
    setIsAutoPlayingDemo
  } = usePlacement();

  const currentStepObj = demoSteps.find(s => s.step === currentDemoStep) || {
    step: 1,
    title: "Select Company Job Description",
    description: "TPO selects Google India SDE-1 JD to initialize placement drive."
  };

  const handlePrev = () => {
    if (currentDemoStep > 1) {
      runDemoStep(currentDemoStep - 1);
    }
  };

  const handleNext = () => {
    if (currentDemoStep < 20) {
      runDemoStep(currentDemoStep + 1);
    }
  };

  return (
    <div className="bg-[#0B1020] text-[#CBD5E1] border-b border-[#27324A] px-4 py-2.5 flex-shrink-0 shadow-soft">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Step Info */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white font-bold flex items-center justify-center text-xs shadow-purple flex-shrink-0">
            {currentDemoStep}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
              <span className="text-[#A78BFA] font-semibold">Live AI Scenario</span>
              <span>&middot;</span>
              <span>Step {currentDemoStep} of 20</span>
            </div>
            <div className="font-semibold text-[#F8FAFC] truncate max-w-sm">
              {currentStepObj.title}
            </div>
          </div>
        </div>

        {/* Center: Dropdown */}
        <div className="hidden lg:block">
          <select
            value={currentDemoStep}
            onChange={(e) => runDemoStep(Number(e.target.value))}
            className="bg-[#151C32] text-xs text-[#F8FAFC] rounded-lg px-3 py-1.5 border border-[#27324A] outline-none cursor-pointer hover:border-[#7C3AED] transition-colors"
          >
            {demoSteps.map(s => (
              <option key={s.step} value={s.step} className="bg-[#151C32] text-[#F8FAFC]">
                Step {s.step}: {s.title}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handlePrev}
            disabled={currentDemoStep <= 1}
            className="p-1.5 rounded-lg bg-[#151C32] hover:bg-[#1B2340] disabled:opacity-40 text-[#CBD5E1] transition-colors border border-[#27324A] cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => runDemoStep(currentDemoStep)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-purple cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Execute Step {currentDemoStep}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentDemoStep >= 20}
            className="p-1.5 rounded-lg bg-[#151C32] hover:bg-[#1B2340] disabled:opacity-40 text-[#CBD5E1] transition-colors border border-[#27324A] cursor-pointer"
            title="Next Step"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAutoPlayingDemo(!isAutoPlayingDemo)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isAutoPlayingDemo
                ? 'bg-amber-500 text-slate-950 font-bold animate-pulse'
                : 'bg-[#151C32] text-[#CBD5E1] hover:bg-[#1B2340] border border-[#27324A]'
            }`}
          >
            {isAutoPlayingDemo ? <Pause className="w-3.5 h-3.5" /> : <FastForward className="w-3.5 h-3.5 text-[#A78BFA]" />}
            <span>{isAutoPlayingDemo ? 'Pause' : 'Auto-Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
