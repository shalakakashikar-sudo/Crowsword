
import { DictionaryEntry, WordPosition, Grid, CellData, Difficulty } from '../types';
import { DICTIONARY } from './dictionary';

const GRID_SIZES = {
  [Difficulty.EASY]: 10,
  [Difficulty.MEDIUM]: 13,
  [Difficulty.HARD]: 15
};

const MIN_WORDS = {
  [Difficulty.EASY]: 6,
  [Difficulty.MEDIUM]: 10,
  [Difficulty.HARD]: 15
};

// Helper to create an empty grid
function createEmptyGrid(size: number): string[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// Check if a word can be placed at a specific position
function canPlaceWord(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
): boolean {
  const size = grid.length;
  
  // Basic boundary checks for negative indices which might come from intersection calculations
  if (row < 0 || col < 0) return false;

  if (direction === 'across') {
    if (col + word.length > size) return false; // Out of bounds
    // Check left/right boundaries of the word
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (col + word.length < size && grid[row][col + word.length] !== null) return false;

    for (let i = 0; i < word.length; i++) {
      const cell = grid[row][col + i];
      if (cell !== null && cell !== word[i]) return false; // Conflict
      
      // If the cell is empty, we must check perpendicular neighbors to ensure we aren't creating accidental 2-letter words adjacent to us
      if (cell === null) {
        if (row > 0 && grid[row - 1][col + i] !== null) return false;
        if (row < size - 1 && grid[row + 1][col + i] !== null) return false;
      }
    }
  } else {
    if (row + word.length > size) return false;
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (row + word.length < size && grid[row + word.length][col] !== null) return false;

    for (let i = 0; i < word.length; i++) {
      const cell = grid[row + i][col];
      if (cell !== null && cell !== word[i]) return false;
      
      if (cell === null) {
        if (col > 0 && grid[row + i][col - 1] !== null) return false;
        if (col < size - 1 && grid[row + i][col + 1] !== null) return false;
      }
    }
  }
  return true;
}

// Place the word on the grid
function placeWordOnGrid(
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: 'across' | 'down'
) {
  if (direction === 'across') {
    for (let i = 0; i < word.length; i++) {
      grid[row][col + i] = word[i];
    }
  } else {
    for (let i = 0; i < word.length; i++) {
      grid[row + i][col] = word[i];
    }
  }
}

// Main generation function
export function generateCrossword(difficulty: Difficulty): { grid: Grid; words: WordPosition[] } {
  const size = GRID_SIZES[difficulty];
  const targetWordCount = MIN_WORDS[difficulty];
  
  // Shuffle dictionary
  const shuffledDict = [...DICTIONARY].sort(() => 0.5 - Math.random());
  
  let bestGrid: string[][] = createEmptyGrid(size);
  let bestWords: WordPosition[] = [];

  // Try multiple times to get a good distribution
  const attempts = 20; 
  
  for (let a = 0; a < attempts; a++) {
    const tempGrid = createEmptyGrid(size);
    const tempWords: WordPosition[] = [];
    const placedWords = new Set<string>();

    // Place first word in the middle
    const firstWordEntry = shuffledDict[Math.floor(Math.random() * shuffledDict.length)];
    const center = Math.floor(size / 2);
    const startCol = center - Math.floor(firstWordEntry.word.length / 2);
    
    // Safety check for start col
    const safeStartCol = Math.max(0, Math.min(size - firstWordEntry.word.length, startCol));

    placeWordOnGrid(tempGrid, firstWordEntry.word, center, safeStartCol, 'across');
    tempWords.push({
      word: firstWordEntry.word,
      row: center,
      col: safeStartCol,
      direction: 'across',
      clue: firstWordEntry.clue,
      number: 1
    });
    placedWords.add(firstWordEntry.word);

    // Try to fit other words
    for (const entry of shuffledDict) {
      if (placedWords.has(entry.word)) continue;
      if (tempWords.length >= targetWordCount + 5) break; // Allow a bit more than min

      let placed = false;
      
      const potentialIntersections: {r: number, c: number, letter: string}[] = [];
      for(let r=0; r<size; r++) {
        for(let c=0; c<size; c++) {
          if (tempGrid[r][c] !== null) {
            potentialIntersections.push({r, c, letter: tempGrid[r][c]!});
          }
        }
      }

      // Shuffle potential intersections to vary layout
      potentialIntersections.sort(() => 0.5 - Math.random());

      for (const p of potentialIntersections) {
        // Does this word have this letter?
        const letterIndices = [];
        for(let i=0; i<entry.word.length; i++) if(entry.word[i] === p.letter) letterIndices.push(i);

        for (const charIndex of letterIndices) {
            // Try Across
            const rowA = p.r;
            const colA = p.c - charIndex;
            if (canPlaceWord(tempGrid, entry.word, rowA, colA, 'across')) {
                placeWordOnGrid(tempGrid, entry.word, rowA, colA, 'across');
                tempWords.push({
                    word: entry.word,
                    row: rowA,
                    col: colA,
                    direction: 'across',
                    clue: entry.clue,
                    number: 0 // Assign later
                });
                placedWords.add(entry.word);
                placed = true;
                break;
            }

            // Try Down
            const rowD = p.r - charIndex;
            const colD = p.c;
            if (canPlaceWord(tempGrid, entry.word, rowD, colD, 'down')) {
                placeWordOnGrid(tempGrid, entry.word, rowD, colD, 'down');
                tempWords.push({
                    word: entry.word,
                    row: rowD,
                    col: colD,
                    direction: 'down',
                    clue: entry.clue,
                    number: 0 // Assign later
                });
                placedWords.add(entry.word);
                placed = true;
                break;
            }
        }
        if(placed) break;
      }
    }

    if (tempWords.length > bestWords.length) {
        bestWords = tempWords;
        bestGrid = tempGrid;
    }
  }

  // --- TRIM GRID to remove blank lines ---
  let minR = size, maxR = -1, minC = size, maxC = -1;
  for(let r=0; r<size; r++) {
      for(let c=0; c<size; c++) {
          if (bestGrid[r][c] !== null) {
              if(r < minR) minR = r;
              if(r > maxR) maxR = r;
              if(c < minC) minC = c;
              if(c > maxC) maxC = c;
          }
      }
  }

  // Define new size based on bounding box
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  
  // Adjust words positions
  const adjustedWords = bestWords.map(w => ({
      ...w,
      row: w.row - minR,
      col: w.col - minC
  }));

  // Sort words by position to assign clue numbers correctly (Row then Col)
  adjustedWords.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
  });

  // Assign numbers
  let currentNumber = 1;
  const wordByPos: Record<string, number> = {}; 

  for (let i = 0; i < adjustedWords.length; i++) {
      const key = `${adjustedWords[i].row},${adjustedWords[i].col}`;
      if (!wordByPos[key]) {
          wordByPos[key] = currentNumber++;
      }
      adjustedWords[i].number = wordByPos[key];
  }

  // Construct valid trimmed Grid object
  const cellDataGrid: CellData[][] = Array(rows).fill(null).map((_, r) => 
      Array(cols).fill(null).map((_, c) => ({
          row: r,
          col: c,
          value: '',
          input: '',
          isBlack: true,
          clueNumbers: [],
          active: false,
          isPartOfActiveWord: false
      }))
  );

  for(let r=0; r<rows; r++) {
      for(let c=0; c<cols; c++) {
          const originalR = minR + r;
          const originalC = minC + c;
          if (bestGrid[originalR][originalC] !== null) {
              cellDataGrid[r][c].value = bestGrid[originalR][originalC]!;
              cellDataGrid[r][c].isBlack = false;
          }
      }
  }

  // Add clue numbers to cells
  adjustedWords.forEach(w => {
      if (cellDataGrid[w.row][w.col]) {
          if(!cellDataGrid[w.row][w.col].clueNumbers.includes(w.number)) {
              cellDataGrid[w.row][w.col].clueNumbers.push(w.number);
          }
      }
  });

  return {
      grid: { rows, cols, cells: cellDataGrid },
      words: adjustedWords
  };
}
