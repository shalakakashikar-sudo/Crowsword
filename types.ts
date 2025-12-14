
export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface CellData {
  row: number;
  col: number;
  value: string; // The correct char
  input: string; // The user input
  isBlack: boolean;
  clueNumbers: number[]; // If this cell starts words, which clue numbers?
  active: boolean; // Is currently focused?
  isPartOfActiveWord: boolean;
  isHint?: boolean; // Was this revealed by a hint?
}

export interface Grid {
  rows: number;
  cols: number;
  cells: CellData[][];
}

export interface WordPosition {
  word: string;
  row: number;
  col: number;
  direction: 'across' | 'down';
  clue: string;
  number: number;
}

export interface GameState {
  grid: Grid;
  words: WordPosition[];
  difficulty: Difficulty;
  startTime: number;
  isComplete: boolean;
  hintsUsed: number;
}

export type MascotMood = 'IDLE' | 'HAPPY' | 'ANGRY' | 'MOCKING' | 'THINKING' | 'WAITING' | 'SLEEPING' | 'SURPRISED' | 'DANCING' | 'EXCITED' | 'HINT';

export interface DictionaryEntry {
  word: string;
  clue: string;
  difficulty?: Difficulty;
}
