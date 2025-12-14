
import React, { useRef, useEffect } from 'react';
import { CellData } from '../types';

interface BoardProps {
  grid: CellData[][];
  onCellClick: (row: number, col: number) => void;
  selectedCell: { row: number, col: number } | null;
  direction: 'across' | 'down';
  activeWordCells: Set<string>; // Set of "row,col" strings
}

export const Board: React.FC<BoardProps> = ({ grid, onCellClick, selectedCell, direction, activeWordCells }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Center the view on selected cell if offscreen (for mobile mostly)
  useEffect(() => {
    if (selectedCell && scrollRef.current) {
       // A simple scroll into view logic could go here if the grid is larger than viewport
    }
  }, [selectedCell]);

  return (
    <div 
      ref={scrollRef}
      className="bg-neutral-900 p-1 md:p-4 rounded-xl shadow-2xl overflow-auto max-w-full max-h-[60vh] md:max-h-[80vh] border-4 border-neutral-800"
    >
      <div 
        className="grid gap-[1px] bg-neutral-800 border border-neutral-800 mx-auto"
        style={{ 
          gridTemplateColumns: `repeat(${grid.length > 0 ? grid[0].length : 1}, minmax(0, 1fr))`,
          width: 'fit-content'
        }}
      >
        {grid.map((row, rIndex) => (
          row.map((cell, cIndex) => {
            const isSelected = selectedCell?.row === rIndex && selectedCell?.col === cIndex;
            const isInActiveWord = activeWordCells.has(`${rIndex},${cIndex}`);
            const isCorrect = cell.input && cell.input === cell.value;
            
            if (cell.isBlack) {
              return (
                <div 
                  key={`${rIndex}-${cIndex}`} 
                  className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-neutral-950"
                />
              );
            }

            return (
              <div
                key={`${rIndex}-${cIndex}`}
                onClick={() => onCellClick(rIndex, cIndex)}
                className={`
                  relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center 
                  text-sm sm:text-base md:text-xl font-bold uppercase cursor-pointer select-none
                  transition-colors duration-100
                  ${isSelected ? 'bg-yellow-500 text-black' : 
                    isInActiveWord ? 'bg-yellow-200 text-black' : 'bg-white text-neutral-900'}
                  ${isCorrect && !isSelected && !isInActiveWord ? 'text-green-600 bg-green-50' : ''}
                  ${cell.isHint && !isSelected && !isInActiveWord ? 'text-blue-600' : ''}
                `}
              >
                {/* Clue Number */}
                {cell.clueNumbers.length > 0 && (
                  <span className="absolute top-0 left-[1px] text-[8px] sm:text-[9px] md:text-[10px] leading-none font-sans text-neutral-500 font-normal">
                    {cell.clueNumbers[0]}
                  </span>
                )}
                {cell.input}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};
