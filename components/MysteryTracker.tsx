import React from 'react';
import type { BlueprintState } from '../types';
import EmotionMeter from './EmotionMeter';

interface BlueprintTrackerProps {
  blueprintState: BlueprintState;
}

const MysteryTracker: React.FC<BlueprintTrackerProps> = ({ blueprintState }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-4 backdrop-blur-sm">
      <h3 className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-amber-orange text-glow-amber">Blueprint Progress</h3>
      <EmotionMeter label="Progress" value={blueprintState.progress} color="#818CF8" />
      <EmotionMeter label="Understanding" value={blueprintState.understanding} color="#38BDF8" />
      <EmotionMeter label="Complexity" value={blueprintState.complexity} color="#F472B6" />
    </div>
  );
};

export default MysteryTracker;