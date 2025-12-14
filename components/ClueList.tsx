import React from 'react';
import { WordPosition } from '../types';

interface ClueListProps {
  words: WordPosition[];
  activeWord: WordPosition | null;
  onClueClick: (word: WordPosition) => void;
}

export const ClueList: React.FC<ClueListProps> = ({ words, activeWord, onClueClick }) => {
  const across = words.filter(w => w.direction === 'across').sort((a,b) => a.number - b.number);
  const down = words.filter(w => w.direction === 'down').sort((a,b) => a.number - b.number);

  // Mobile: Just a list that flows naturally.
  // Desktop: Side-by-side columns with internal scrolling.
  return (
    <div className="flex flex-col md:flex-row md:h-full gap-4 w-full">
      {/* Across Clues */}
      <div className="flex-1 flex flex-col bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 md:overflow-hidden">
        <h3 className="text-yellow-500 font-display font-bold mb-2 uppercase tracking-wider text-sm md:text-base sticky top-0 bg-neutral-800/95 backdrop-blur py-1 z-10">Across</h3>
        <div className="flex-1 space-y-2 md:overflow-y-auto pr-0 md:pr-2">
          {across.map((w, i) => (
            <div 
              key={i} 
              onClick={() => onClueClick(w)}
              className={`p-2 rounded text-xs md:text-sm cursor-pointer transition-colors border border-transparent ${activeWord === w ? 'bg-yellow-500 text-black font-semibold shadow-md border-yellow-600' : 'text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'}`}
            >
              <span className="font-bold mr-1">{w.number}.</span> {w.clue}
            </div>
          ))}
        </div>
      </div>

      {/* Down Clues */}
      <div className="flex-1 flex flex-col bg-neutral-800/50 rounded-xl p-4 border border-neutral-700 md:overflow-hidden">
        <h3 className="text-yellow-500 font-display font-bold mb-2 uppercase tracking-wider text-sm md:text-base sticky top-0 bg-neutral-800/95 backdrop-blur py-1 z-10">Down</h3>
        <div className="flex-1 space-y-2 md:overflow-y-auto pr-0 md:pr-2">
          {down.map((w, i) => (
            <div 
              key={i} 
              onClick={() => onClueClick(w)}
              className={`p-2 rounded text-xs md:text-sm cursor-pointer transition-colors border border-transparent ${activeWord === w ? 'bg-yellow-500 text-black font-semibold shadow-md border-yellow-600' : 'text-neutral-300 hover:bg-neutral-700 hover:border-neutral-600'}`}
            >
              <span className="font-bold mr-1">{w.number}.</span> {w.clue}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};