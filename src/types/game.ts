export interface Cell {
  image: string | null;
  id: string | null; // For animation tracking
  isClearing?: boolean;
}

export type Grid = (Cell | null)[][];

export interface Block {
  id: string;
  shape: number[][]; // 2D array representing the shape, e.g., [[1, 1], [1, 1]]
  image: string;
  size: number; // Max dimension
}

export interface Position {
  row: number;
  col: number;
}
