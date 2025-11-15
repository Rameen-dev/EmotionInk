import React from 'react';
import type { WorldContext, AmbientSound, AmbientAnimation } from '../types';

interface WorldDisplayProps {
  worldContext: WorldContext;
  worldMood: string;
  ambientSound: AmbientSound | null;
  ambientAnimation: AmbientAnimation | null;
}

const WorldDisplay: React.FC<WorldDisplayProps> = ({ worldContext, worldMood, ambientSound, ambientAnimation }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-sm backdrop-blur-sm">
      <p className="text-xs text-cyan-400 uppercase tracking-widest font-display">Location</p>
      <h3 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-cyan-teal text-glow-cyan mb-2">{worldContext.currentLocationName}</h3>
      <p className="text-slate-400 text-xs italic mb-3">World: {worldContext.worldName}</p>
      
      <p className="text-slate-300 mb-4 font-serif leading-relaxed">{worldContext.currentLocationDescription}</p>

      <div className="border-t border-slate-700 pt-3 space-y-2 text-xs">
        <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-400 uppercase">Vibe:</span>
            <span className="text-slate-200 font-medium capitalize">{worldMood}</span>
        </div>
         {ambientSound && (
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400 uppercase">Sound:</span>
                <span className="text-slate-200 font-medium">{ambientSound.description}</span>
            </div>
         )}
        {ambientAnimation && (
            <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-400 uppercase">Sights:</span>
                <span className="text-slate-200 font-medium">{ambientAnimation.description}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default WorldDisplay;