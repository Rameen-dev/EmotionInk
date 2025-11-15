import React from 'react';
import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  moodLabel: string;
  characterImage: string | null;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, moodLabel, characterImage }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 backdrop-blur-sm">
      {characterImage && (
        <div id="guide-character-image" className="character-portrait-bg rounded-lg p-2 border border-slate-700 mb-4">
            <img src={characterImage} alt={character.name} className="relative z-10 w-full h-auto max-h-60 object-contain rounded animate-sketch-wobble" />
        </div>
      )}
      <h2 className="text-3xl font-bold font-display bg-clip-text text-transparent bg-gradient-fuchsia-indigo text-glow-fuchsia mb-1">{character.name}</h2>
      <p className="text-sm text-fuchsia-300 italic mb-3">{character.shortTitle}</p>
      
      <div className="grid grid-cols-2 gap-3 text-center mb-4">
        <div className="bg-slate-800/50 p-2 rounded">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider">Mood</h4>
            <p className="font-semibold text-cyan-300 capitalize">{moodLabel}</p>
        </div>
        <div className="bg-slate-800/50 p-2 rounded">
            <h4 className="text-xs text-slate-400 uppercase tracking-wider">Archetype</h4>
            <p className="font-semibold text-slate-200 capitalize">{character.archetype}</p>
        </div>
      </div>

      <p className="text-slate-300 text-sm mb-4 font-serif">{character.description}</p>
      
      <div>
        <h4 className="font-display font-semibold text-slate-200 mb-2 text-sm uppercase tracking-wider">Traits</h4>
        <div className="flex flex-wrap gap-2">
          {character.traits.map((trait, index) => (
            <span key={index} className="bg-slate-700 text-xs font-medium px-2.5 py-1 rounded-full text-slate-300 border border-slate-600">
              {trait}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;