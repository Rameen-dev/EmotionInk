import React from 'react';
import { BookOpenIcon } from './icons';

interface StorySummaryPanelProps {
  blueprintTitle: string;
  currentGoal: string;
  knownClues: string[];
  currentLocation: string;
  emotionalStatus: string;
  worldCondition: string;
  progress: number;
  onClose: () => void;
}

const StorySummaryPanel: React.FC<StorySummaryPanelProps> = ({
  blueprintTitle,
  currentGoal,
  knownClues,
  currentLocation,
  emotionalStatus,
  worldCondition,
  progress,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-500/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={e => e.stopPropagation()}>
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold font-display bg-clip-text text-transparent bg-gradient-cyan-teal text-glow-cyan flex items-center gap-3">
                  <BookOpenIcon className="w-8 h-8"/>
                  Story Codex
                </h2>
                <p className="text-slate-400 mt-1 font-serif">A record of your journey so far.</p>
              </div>
              <button onClick={onClose} className="text-slate-400 text-4xl leading-none hover:text-white transition-colors">&times;</button>
            </div>
            
            <div className="space-y-6">
              {/* Main Blueprint */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-display mb-2">Project Blueprint</h3>
                <p className="text-xl font-semibold text-slate-100 font-serif">{blueprintTitle}</p>
                <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3 relative">
                    <div className="bg-cyan-400 h-2.5 rounded-full progress-bar" style={{ width: `${progress}%`, boxShadow: '0 0 8px #22d3ee' }}></div>
                </div>
                <p className="text-xs text-right text-slate-400 mt-1">{progress}% Reconstructed</p>
              </div>

              {/* Current Goal */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-amber-500/30">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-300 font-display mb-2">Current Puzzle</h3>
                <p className="text-lg text-amber-200 italic font-serif">"{currentGoal}"</p>
              </div>

              {/* Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                 <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700">
                    <h4 className="text-xs uppercase text-slate-400 font-display">Emotion</h4>
                    <p className="font-semibold text-slate-100 capitalize">{emotionalStatus}</p>
                 </div>
                 <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700">
                    <h4 className="text-xs uppercase text-slate-400 font-display">World Vibe</h4>
                    <p className="font-semibold text-slate-100 capitalize">{worldCondition}</p>
                 </div>
                 <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700">
                    <h4 className="text-xs uppercase text-slate-400 font-display">Location</h4>
                    <p className="font-semibold text-slate-100 capitalize">{currentLocation}</p>
                 </div>
              </div>
              
              {/* Known Clues */}
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 font-display mb-3">Recovered Fragments</h3>
                {knownClues.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 pl-2">
                    {knownClues.map((clue, index) => (
                        <li key={index} className="text-slate-300 font-serif italic text-glow-amber marker:text-amber-400">{clue}</li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-slate-400 italic font-serif">No fragments recovered yet. Time to investigate!</p>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StorySummaryPanel;