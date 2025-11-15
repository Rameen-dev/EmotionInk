import React from 'react';
import type { BlueprintInfo } from '../types';
import { HomeIcon, SparklesIcon } from '../components/icons';

interface SuccessScreenProps {
  blueprintInfo: BlueprintInfo;
  summary: string;
  cinematicImageUrl: string | null;
  onRestart: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ blueprintInfo, summary, cinematicImageUrl, onRestart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-transparent animate-fade-in">
      <div className="w-full max-w-3xl text-center bg-slate-900/80 p-6 md:p-10 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-lg">

        {cinematicImageUrl && (
          <div className="mb-6 border-2 border-amber-400/50 rounded-lg p-1">
            <img src={cinematicImageUrl} alt="A cinematic moment" className="w-full h-auto max-h-80 object-contain rounded-md" />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold font-display bg-clip-text text-transparent bg-gradient-fuchsia-indigo text-glow-fuchsia mb-2">Blueprint Complete</h1>
        <p className="text-xl md:text-2xl text-slate-300 font-serif italic mb-6">{blueprintInfo.title}</p>
        
        <div className="my-6 border-t border-dashed border-slate-700" />
        
        <div className="space-y-4 text-base md:text-lg text-slate-300 font-serif leading-relaxed">
            <p>
                EmotionInk turns your thoughts into blueprints, your confusion into clarity, and your emotions into signals — creating a new form of AI-assisted thinking.
            </p>
        </div>

        <div className="bg-slate-800/60 p-4 mt-8 rounded-lg border border-cyan-500/30 text-left">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-cyan-400 font-display mb-2">
            <SparklesIcon className="w-4 h-4" />
            Your Insight
          </h3>
          <p className="text-slate-200 font-serif italic">"{summary}"</p>
        </div>

        <button
          onClick={onRestart}
          className="w-full md:w-auto mt-10 text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 focus:ring-4 focus:outline-none focus:ring-fuchsia-800 font-medium rounded-lg text-sm px-8 py-3 text-center transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 mx-auto"
        >
          <HomeIcon className="w-5 h-5" />
          Start a New Journey
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
