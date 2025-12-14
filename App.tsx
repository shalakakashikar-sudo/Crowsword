
import React, { useState, useEffect, useCallback } from 'react';
import { Board } from './components/Board';
import { ClueList } from './components/ClueList';
import { Mascot } from './components/Mascot';
import { Keyboard } from './components/Keyboard';
import { generateCrossword } from './lib/generator';
import { Difficulty, GameState, CellData, WordPosition, MascotMood } from './types';
import { RefreshCw, Play, Trophy, Home, Lightbulb } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [activeWord, setActiveWord] = useState<WordPosition | null>(null);
  const [mascotMood, setMascotMood] = useState<MascotMood>('IDLE');
  const [activeWordCells, setActiveWordCells] = useState<Set<string>>(new Set());
  const [showIntro, setShowIntro] = useState(true);
  const [level, setLevel] = useState(1);

  // Initialize Game
  const startNewGame = (diff: Difficulty, nextLevel: boolean = false) => {
    if (nextLevel) {
        setLevel(l => l + 1);
    } else if (showIntro) {
        // Only reset level if explicitly starting from main menu selection? 
        // Or keep it simple: restart level 1 if going back home.
        // Let's keep level persistent until page reload for now, unless explicitly reset.
        if (gameState === null) setLevel(1); 
    }

    const { grid, words } = generateCrossword(diff);
    setGameState({
      grid,
      words,
      difficulty: diff,
      startTime: Date.now(),
      isComplete: false,
      hintsUsed: 0
    });
    setSelectedCell(null);
    setActiveWord(null);
    setActiveWordCells(new Set());
    setMascotMood('IDLE');
    setShowIntro(false);
  };

  const handleHome = () => {
    setGameState(null);
    setShowIntro(true);
    setMascotMood('IDLE');
    setLevel(1);
  };

  const handleGameMascotClick = () => {
    // Cycle random funny moods for game view
    const moods: MascotMood[] = ['MOCKING', 'HAPPY', 'SURPRISED', 'DANCING'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setMascotMood(randomMood);
    
    // Reset to idle after a bit
    setTimeout(() => {
        setMascotMood('IDLE');
    }, 2000);
  };

  const handleLandingMascotClick = () => {
    // Persuasive mood for landing page
    setMascotMood('EXCITED');
    // Reset to idle after a bit
    setTimeout(() => {
        setMascotMood('IDLE');
    }, 4000);
  };

  const handleHint = () => {
    if (!gameState || !selectedCell || gameState.isComplete) return;
    const { row, col } = selectedCell;
    const cell = gameState.grid.cells[row][col];
    
    // If already correct, don't waste hint
    if (cell.input === cell.value) {
        return; 
    }
    
    // Apply hint
    const newGrid = gameState.grid.cells.map(r => r.map(c => ({...c})));
    newGrid[row][col] = {
        ...newGrid[row][col],
        input: cell.value,
        isHint: true 
    };
    
    setGameState(prev => prev ? ({
        ...prev,
        grid: { ...prev.grid, cells: newGrid },
        hintsUsed: prev.hintsUsed + 1
    }) : null);
    
    setMascotMood('HINT');
    setTimeout(() => setMascotMood('IDLE'), 2500);
    
    // Check completion
    checkCompletion(newGrid, gameState.words);
  };

  // Determine Active Word based on Selection
  useEffect(() => {
    if (!gameState || !selectedCell) {
      setActiveWord(null);
      setActiveWordCells(new Set());
      return;
    }

    const { row, col } = selectedCell;
    const possibleWords = gameState.words.filter(w => {
        if (w.direction === 'across') {
            return w.row === row && col >= w.col && col < w.col + w.word.length;
        } else {
            return w.col === col && row >= w.row && row < w.row + w.word.length;
        }
    });

    let match = possibleWords.find(w => w.direction === direction);
    if (!match && possibleWords.length > 0) {
        // If current direction has no word, switch direction if possible
        match = possibleWords[0];
        setDirection(match.direction);
    }

    setActiveWord(match || null);

    if (match) {
        const set = new Set<string>();
        for(let i=0; i<match.word.length; i++) {
            if (match.direction === 'across') set.add(`${match.row},${match.col + i}`);
            else set.add(`${match.row + i},${match.col}`);
        }
        setActiveWordCells(set);
    } else {
        setActiveWordCells(new Set());
    }

  }, [selectedCell, direction, gameState?.words]);

  // Input Handling
  const handleInput = useCallback((char: string) => {
    if (!gameState || !selectedCell || gameState.isComplete) return;
    
    // Update Grid
    const newGrid = gameState.grid.cells.map(r => r.map(c => ({...c})));
    const { row, col } = selectedCell;
    
    // Visual feedback logic
    newGrid[row][col].input = char;
    
    setGameState(prev => prev ? ({ ...prev, grid: { ...prev.grid, cells: newGrid } }) : null);

    // Auto-advance
    if (activeWord) {
        let nextRow = row;
        let nextCol = col;
        if (direction === 'across') nextCol++;
        else nextRow++;
        
        // Ensure we stay within active word bounds
        const wordEndRow = activeWord.direction === 'down' ? activeWord.row + activeWord.word.length : activeWord.row;
        const wordEndCol = activeWord.direction === 'across' ? activeWord.col + activeWord.word.length : activeWord.col;

        if (activeWord.direction === 'across') {
             if (nextCol < wordEndCol) setSelectedCell({row: nextRow, col: nextCol});
        } else {
             if (nextRow < wordEndRow) setSelectedCell({row: nextRow, col: nextCol});
        }
    }

    // Check Puzzle Completion
    checkCompletion(newGrid, gameState.words);

  }, [gameState, selectedCell, direction, activeWord]);

  const checkCompletion = (cells: CellData[][], words: WordPosition[]) => {
      let isAllCorrect = true;
      for (const w of words) {
          for (let i=0; i<w.word.length; i++) {
              const r = w.direction === 'across' ? w.row : w.row + i;
              const c = w.direction === 'across' ? w.col + i : w.col;
              if (cells[r][c].input !== w.word[i]) {
                  isAllCorrect = false;
                  break;
              }
          }
      }

      if (isAllCorrect) {
          setGameState(prev => prev ? ({ ...prev, isComplete: true }) : null);
          setMascotMood('DANCING'); // Make mascot dance on victory
      }
  };

  const handleBackspace = useCallback(() => {
    if (!gameState || !selectedCell || gameState.isComplete) return;
    const newGrid = gameState.grid.cells.map(r => r.map(c => ({...c})));
    const { row, col } = selectedCell;
    
    // If current empty, move back then delete
    if (newGrid[row][col].input === '') {
         if (activeWord) {
             let prevRow = row;
             let prevCol = col;
             if (direction === 'across') prevCol--;
             else prevRow--;

             // Check bounds
             if (activeWord.direction === 'across' && prevCol >= activeWord.col) {
                 setSelectedCell({row: prevRow, col: prevCol});
             } else if (activeWord.direction === 'down' && prevRow >= activeWord.row) {
                 setSelectedCell({row: prevRow, col: prevCol});
             }
         }
    } else {
        newGrid[row][col].input = '';
        setGameState(prev => prev ? ({ ...prev, grid: { ...prev.grid, cells: newGrid } }) : null);
    }
  }, [gameState, selectedCell, direction, activeWord]);

  // Physical Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!gameState) return;
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= 'A' && key <= 'Z') {
            handleInput(key);
        } else if (e.key === 'Backspace') {
            handleBackspace();
        } else if (e.key === 'ArrowRight') {
            setSelectedCell(prev => prev ? { ...prev, col: Math.min(gameState.grid.cols-1, prev.col + 1) } : null);
        } else if (e.key === 'ArrowLeft') {
            setSelectedCell(prev => prev ? { ...prev, col: Math.max(0, prev.col - 1) } : null);
        } else if (e.key === 'ArrowDown') {
            setSelectedCell(prev => prev ? { ...prev, row: Math.min(gameState.grid.rows-1, prev.row + 1) } : null);
        } else if (e.key === 'ArrowUp') {
            setSelectedCell(prev => prev ? { ...prev, row: Math.max(0, prev.row - 1) } : null);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleInput, handleBackspace]);

  const handleCellClick = (r: number, c: number) => {
      if (selectedCell?.row === r && selectedCell?.col === c) {
          // Toggle direction
          setDirection(prev => prev === 'across' ? 'down' : 'across');
      } else {
          setSelectedCell({ row: r, col: c });
      }
  };

  const handleClueClick = (w: WordPosition) => {
      setSelectedCell({ row: w.row, col: w.col });
      setDirection(w.direction);
  };

  // Intro Screen (Scrollable)
  if (showIntro) {
      return (
          <div className="h-full w-full bg-neutral-900 text-white flex flex-col items-center justify-start p-4 relative overflow-y-auto">
              <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-950 -z-10"></div>
              
              <div className="flex flex-col items-center py-10 w-full max-w-lg mx-auto">
                <div className="mb-36 mt-12 scale-150 cursor-pointer relative z-20" onClick={handleLandingMascotClick}>
                    <Mascot mood={mascotMood === 'IDLE' ? 'HAPPY' : mascotMood} alignment="landing" onClick={handleLandingMascotClick} />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-display font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-400 to-yellow-600 mb-6 drop-shadow-lg text-center z-10 relative">
                    CROWSWORD
                </h1>
                <p className="text-neutral-400 mb-12 text-center max-w-md z-10 leading-relaxed px-4">
                    A crossword game where you get roasted by a bird. Solve puzzles, earn shiny things, and try not to cry when you forget how to spell "banana".
                </p>

                <div className="flex flex-col gap-4 w-full max-w-xs z-10">
                    <button onClick={() => startNewGame(Difficulty.EASY)} className="group relative px-8 py-4 bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 hover:border-yellow-500 transition-all">
                        <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative font-bold text-lg flex items-center justify-between">
                            Fresh Egg (Easy) <Play className="w-5 h-5 text-yellow-500" />
                        </span>
                    </button>
                    <button onClick={() => startNewGame(Difficulty.MEDIUM)} className="group relative px-8 py-4 bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 hover:border-yellow-500 transition-all">
                        <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative font-bold text-lg flex items-center justify-between">
                            Fledgling (Medium) <Play className="w-5 h-5 text-yellow-500" />
                        </span>
                    </button>
                    <button onClick={() => startNewGame(Difficulty.HARD)} className="group relative px-8 py-4 bg-neutral-800 rounded-xl overflow-hidden shadow-lg border border-neutral-700 hover:border-yellow-500 transition-all">
                        <div className="absolute inset-0 bg-yellow-500/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                        <span className="relative font-bold text-lg flex items-center justify-between">
                            Old Crow (Hard) <Play className="w-5 h-5 text-yellow-500" />
                        </span>
                    </button>
                </div>
                
                <div className="mt-12 text-neutral-600 text-xs text-center font-mono">
                    Created by Shalaka Kashikar
                </div>
              </div>
          </div>
      );
  }

  // Game Screen
  return (
    <div className="h-[100dvh] bg-neutral-950 text-neutral-100 flex flex-col md:flex-row overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10">
        
        {/* Header (Mobile) */}
        <header className="px-4 py-2 flex items-center justify-between md:hidden border-b border-neutral-800 bg-neutral-900/50 backdrop-blur z-30 sticky top-0 h-16 flex-none shadow-sm">
             <div className="flex items-center gap-2">
                 <button onClick={handleHome} className="p-2 bg-neutral-800/80 rounded-full text-neutral-400 hover:text-white transition"><Home className="w-4 h-4" /></button>
                 <span className="font-display font-bold text-yellow-500 text-xl tracking-wide">Lvl {level}</span>
             </div>
             <div className="flex items-center gap-3">
                 {/* Mascot in header for mobile */}
                 <div className="scale-75 origin-right">
                    <Mascot mood={mascotMood} onClick={handleGameMascotClick} alignment="header" />
                 </div>
                 <button onClick={() => setShowIntro(true)} className="p-2 bg-neutral-800 rounded-full text-white"><RefreshCw className="w-4 h-4" /></button>
             </div>
        </header>

        {/* Game Scroll Container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 flex flex-col items-center p-2 md:p-6 pb-64 md:pb-6 gap-6 w-full scroll-smooth">
            
            {/* Top Bar Desktop */}
            <div className="hidden md:flex w-full justify-between items-center max-w-6xl mb-4 bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/50 backdrop-blur-md sticky top-0 z-20 flex-none shadow-xl">
                <div className="flex items-center gap-4">
                     <button onClick={handleHome} className="p-2.5 bg-neutral-800 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition" title="Home">
                        <Home className="w-5 h-5" />
                     </button>
                    <h2 className="text-3xl font-display font-bold text-neutral-200 tracking-tight">
                        LEVEL <span className="text-yellow-500">{level}</span> <span className="text-neutral-600 text-xl ml-2">({gameState?.difficulty})</span>
                    </h2>
                </div>
                <div className="flex items-center gap-6">
                    {/* Mascot in header for desktop */}
                    <div className="relative transform hover:scale-105 transition-transform duration-200">
                        <Mascot mood={mascotMood} onClick={handleGameMascotClick} alignment="header" />
                    </div>
                    
                    <button 
                        onClick={() => startNewGame(gameState!.difficulty)} 
                        className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition shadow-lg border border-neutral-700"
                    >
                        <RefreshCw className="w-4 h-4" /> Reset
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 md:gap-12 items-start justify-center">
                
                {/* Left Col: Board */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    {gameState && (
                        <div className="relative">
                            <div className="shadow-2xl shadow-black/50 rounded-xl relative z-10">
                                <Board 
                                    grid={gameState.grid.cells} 
                                    onCellClick={handleCellClick}
                                    selectedCell={selectedCell}
                                    direction={direction}
                                    activeWordCells={activeWordCells}
                                />
                            </div>
                            
                            {/* Hint Button (Desktop placement concept, actually mobile/desktop unify below) */}
                            <button 
                                onClick={handleHint}
                                className="absolute -right-12 top-0 p-3 bg-blue-900/20 hover:bg-blue-800/40 border border-blue-500/30 rounded-full text-blue-400 hover:text-blue-200 transition-all md:flex hidden flex-col items-center gap-1 group"
                                title="Use Hint"
                            >
                                <Lightbulb className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}
                    
                    {/* Active Clue Bar & Mobile Tools */}
                    <div className="w-full max-w-md md:max-w-lg flex gap-2">
                        <div className="flex-1 bg-gradient-to-r from-neutral-800 to-neutral-800/80 p-4 rounded-xl border-l-4 border-yellow-500 shadow-lg min-h-[4rem] flex items-center backdrop-blur-sm">
                            <span className="text-yellow-500 font-display font-black mr-3 text-2xl">
                                {activeWord ? activeWord.number : ''}
                            </span>
                            <span className="text-neutral-100 text-sm md:text-lg font-medium leading-tight">
                                {activeWord ? activeWord.clue : 'Select a cell to start...'}
                            </span>
                        </div>
                        
                        {/* Mobile Hint Button */}
                        <button 
                            onClick={handleHint}
                            className="md:hidden w-16 bg-blue-900/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 active:bg-blue-800/40 active:scale-95 transition"
                        >
                            <Lightbulb className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Right Col: Clues */}
                <div className="flex-1 w-full flex flex-col gap-6 md:h-[600px] relative">
                     {gameState && (
                         <ClueList 
                            words={gameState.words} 
                            activeWord={activeWord}
                            onClueClick={handleClueClick}
                         />
                     )}
                </div>
            </div>

        </div>

        {/* Virtual Keyboard (Mobile Only) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full z-40 flex-none pb-safe">
            <Keyboard onKeyPress={handleInput} onBackspace={handleBackspace} />
        </div>

      </main>

      {/* Victory Modal */}
      {gameState?.isComplete && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-neutral-900 border border-yellow-500/30 p-8 rounded-3xl shadow-2xl max-w-sm text-center transform scale-100 flex flex-col items-center">
                  <div className="mb-8 scale-150">
                     <Mascot mood="HAPPY" alignment="landing" />
                  </div>
                  <h2 className="text-4xl font-display font-black text-white mb-2 tracking-tight">SHINY!</h2>
                  <p className="text-neutral-400 mb-8 text-lg">
                      You finished Level {level}!<br/>
                      <span className="text-sm text-neutral-500">Hints used: {gameState.hintsUsed}</span>
                  </p>
                  <div className="flex gap-3 w-full">
                      <button onClick={handleHome} className="flex-1 py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl transition">
                          Home
                      </button>
                      <button onClick={() => startNewGame(gameState.difficulty, true)} className="flex-1 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition shadow-lg shadow-yellow-900/20">
                          Next Level
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

