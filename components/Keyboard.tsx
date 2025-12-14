import React from 'react';
import { ArrowLeft, Delete } from 'lucide-react';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter?: () => void;
}

const KEYS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onBackspace }) => {
  return (
    <div className="w-full bg-neutral-900/90 backdrop-blur-sm p-1 sm:p-2 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.5)] border-t border-neutral-800">
      <div className="max-w-3xl mx-auto flex flex-col gap-1 sm:gap-2">
        {KEYS.map((row, i) => (
          <div key={i} className="flex justify-center gap-1">
            {row.map(char => (
              <button
                key={char}
                onClick={() => onKeyPress(char)}
                className="w-7 h-10 sm:w-8 sm:h-12 md:w-10 md:h-14 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded text-neutral-100 font-bold text-sm sm:text-base shadow-md transition-transform active:scale-95"
              >
                {char}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center mt-1">
           <button
                onClick={onBackspace}
                className="px-6 h-10 sm:h-12 bg-neutral-800 hover:bg-red-900/50 rounded flex items-center justify-center text-neutral-100 shadow-md active:scale-95 border border-neutral-700"
           >
              <Delete className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};
