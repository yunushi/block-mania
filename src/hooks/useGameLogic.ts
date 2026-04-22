import { useState, useCallback } from 'react';
import { Grid, Block, Position } from '@/types/game';

const GRID_SIZE = 8;

const SKIN_ASSETS = {
  classic: ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'],
  neon: ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'],
  gold: ['color-1', 'color-2', 'color-3', 'color-4', 'color-5']
};

const AUDIO_URLS = {
  place: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  combo: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
  perfect: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  nice: 'https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3',
  great: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
  incredible: 'https://assets.mixkit.co/active_storage/sfx/2021/2021-preview.mp3',
  godlike: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
};

// Global audio cache for iOS Safari preloading
const audioCache: Record<string, HTMLAudioElement> = {};
if (typeof window !== 'undefined') {
  Object.entries(AUDIO_URLS).forEach(([k, v]) => {
    const audio = new Audio(v);
    audio.preload = 'auto'; // Force iOS to cache
    audioCache[k] = audio;
  });
}

const SHAPES_TIERS = {
  easy: [
    [[1]], // 1x1
    [[1, 1]], // 1x2
    [[1], [1]], // 2x1
    [[1, 1], [1, 1]], // 2x2
  ],
  medium: [
    [[1, 1, 1]], // 1x3
    [[1], [1], [1]], // 3x1
    [[1, 1, 1], [0, 1, 0]], // T-shape
    [[0, 1, 0], [1, 1, 1]], // T-shape up
    [[0, 1], [1, 1], [0, 1]], // T-shape left
    [[1, 0], [1, 1], [1, 0]], // T-shape right
    [[1, 1, 0], [0, 1, 1]], // Z-shape
    [[0, 1, 1], [1, 1, 0]], // S-shape
    [[1, 1], [1, 0]], // Small L 1
    [[1, 1], [0, 1]], // Small L 2
    [[1, 0], [1, 1]], // Small L 3
    [[0, 1], [1, 1]], // Small L 4
  ],
  hard: [
    [[1, 0], [1, 0], [1, 1]], // L-shape
    [[0, 1], [0, 1], [1, 1]], // J-shape
    [[1, 1], [1, 0], [1, 0]], // L-shape Inverse
    [[1, 1], [0, 1], [0, 1]], // J-shape Inverse
    [[1, 1, 1, 1]], // 1x4
    [[1, 1]], // Horizontal 2 (Utility)
    [[1], [1], [1], [1]], // 4x1
    [[1, 1, 1], [1, 0, 0]], // Horizontal L 1
    [[1, 1, 1], [0, 0, 1]], // Horizontal L 2
    [[1, 0, 0], [1, 1, 1]], // Horizontal L 1 Inverse
    [[0, 0, 1], [1, 1, 1]], // Horizontal L 2 Inverse
    [[1, 0], [0, 1]], // Diagonal 2
    [[0, 1], [1, 0]], // Diagonal 2 Inverse
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]], // Diagonal 3
    [[0, 0, 1], [0, 1, 0], [1, 0, 0]], // Diagonal 3 Inverse
    [[1, 0, 0], [1, 0, 0], [1, 1, 1]], // Mega L 1
    [[0, 0, 1], [0, 0, 1], [1, 1, 1]], // Mega L 2
    [[1, 1, 1], [1, 0, 0], [1, 0, 0]], // Mega L 3
    [[1, 1, 1], [0, 0, 1], [0, 0, 1]], // Mega L 4
    [[1, 1, 1], [1, 1, 1], [1, 1, 1]], // 3x3 Cube
    [[1, 1, 1], [1, 1, 1]], // 2x3 Horizontal
    [[1, 1], [1, 1], [1, 1]], // 3x2 Vertical
  ]
};

const ALL_SHAPES = [...SHAPES_TIERS.easy, ...SHAPES_TIERS.medium, ...SHAPES_TIERS.hard];
const DIAGONAL_INDICES = [27, 28, 29, 30]; 
const MEGA_L_INDICES = [31, 32, 33, 34];

export const useGameLogic = () => {
  const [grid, setGrid] = useState<Grid>(
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null))
  );
  const [score, setScore] = useState(0);
  const [inventory, setInventory] = useState<(Block | null)[]>([null, null, null]);
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [gameOver, setGameOver] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboGrace, setComboGrace] = useState(3);
  const [showCombo, setShowCombo] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [comboShoutout, setComboShoutout] = useState<{ text: string, type: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSkin, setCurrentSkin] = useState<'classic' | 'neon' | 'gold'>('classic');
  const cycleSkin = useCallback(() => {}, []);

  const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);
  const changeSkin = useCallback((skin: 'classic' | 'neon' | 'gold') => setCurrentSkin(skin), []);

  const playSound = useCallback((type: keyof typeof AUDIO_URLS) => {
    if (isMuted) return;
    const audio = audioCache[type];
    if (audio) {
      // Re-use cached audio to avoid iOS network delay drops
      audio.currentTime = 0;
      audio.volume = type === 'place' ? 1.0 : 0.8;
      audio.play().catch(() => {
        // Fallback for overlapping sounds
        const fallback = new Audio(AUDIO_URLS[type]);
        fallback.volume = type === 'place' ? 1.0 : 0.8;
        fallback.play().catch(() => {});
      });
    } else {
        const fallback = new Audio(AUDIO_URLS[type]);
        fallback.volume = type === 'place' ? 1.0 : 0.8;
        fallback.play().catch(() => {});
    }
  }, [isMuted]);

  const canPlaceBlock = useCallback((targetGrid: Grid, block: Block, pos: Position) => {
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          const gridR = pos.row + r;
          const gridC = pos.col + c;
          if (
            gridR < 0 || gridR >= GRID_SIZE ||
            gridC < 0 || gridC >= GRID_SIZE ||
            targetGrid[gridR][gridC] !== null
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const getHelpfulShapes = useCallback((currentGrid: Grid) => {
    const lineCompletingIndices: number[] = [];
    
    ALL_SHAPES.forEach((shape, index) => {
      let completesLine = false;

      for (let r = 0; r <= GRID_SIZE - shape.length; r++) {
        for (let c = 0; c <= GRID_SIZE - shape[0].length; c++) {
          const mockBlock = { shape } as Block;
          if (canPlaceBlock(currentGrid, mockBlock, { row: r, col: c })) {
            const tempGrid = currentGrid.map(row => [...row]);
            for (let sr = 0; sr < shape.length; sr++) {
              for (let sc = 0; sc < shape[sr].length; sc++) {
                if (shape[sr][sc] === 1) tempGrid[r+sr][c+sc] = { image: 'test', id: 'test' };
              }
            }
            const rowFull = tempGrid.some(row => row.every(cell => cell !== null));
            let colFull = false;
            for (let tc = 0; tc < GRID_SIZE; tc++) {
              let f = true;
              for (let tr = 0; tr < GRID_SIZE; tr++) if (tempGrid[tr][tc] === null) { f = false; break; }
              if (f) { colFull = true; break; }
            }
            if (rowFull || colFull) completesLine = true;
          }
          if (completesLine) break;
        }
        if (completesLine) break;
      }
      
      if (completesLine) lineCompletingIndices.push(index);
    });
    
    return { lineCompletingIndices };
  }, [canPlaceBlock]);

  const generateInventory = useCallback((specificIndex?: number) => {
    const newInventory = [...inventory];
    const { lineCompletingIndices } = getHelpfulShapes(grid);
    const availableColors = SKIN_ASSETS[currentSkin];
    
    const indicesToFill = specificIndex !== undefined ? [specificIndex] : [0, 1, 2];
    
    // Track shapes spawned IN THIS CALL to prevent immediate duplicates
    const spawnedShapesInBatch = new Map<string, number>();
    let spawned3x3InBatch = false;

    for (const idx of indicesToFill) {
        if (newInventory[idx] !== null && specificIndex === undefined) continue;

        let shape: number[][] | null = null;
        let spawnedHelpfulCount = 0;
        
        let activeShapePool: number[][][];
        if (score < 8000) activeShapePool = SHAPES_TIERS.easy;
        else if (score < 16000) activeShapePool = [...SHAPES_TIERS.easy, ...SHAPES_TIERS.medium];
        else activeShapePool = ALL_SHAPES;

        let helpProbability = 0;
        if (score < 5000) helpProbability = 1.0;
        else if (score < 15000) helpProbability = 0.5;
        else if (score < 30000) helpProbability = 0.2;
        
        if (lineCompletingIndices.length > 0 && Math.random() < helpProbability && spawnedHelpfulCount < 1) { 
          const filteredLineCompleters = lineCompletingIndices.filter(lIdx => {
            if (DIAGONAL_INDICES.includes(lIdx)) return false;
            if (lIdx === 35 && spawned3x3InBatch) return false;
            const strShape = JSON.stringify(ALL_SHAPES[lIdx]);
            if ((spawnedShapesInBatch.get(strShape) || 0) >= 2) return false;
            return true;
          });
          
          const targetIndices = (filteredLineCompleters.length > 0) ? filteredLineCompleters : lineCompletingIndices;
          shape = ALL_SHAPES[targetIndices[Math.floor(Math.random() * targetIndices.length)]];
          spawnedHelpfulCount++;
        } else {
          const pool = activeShapePool.filter((s) => {
            const poolIdx = ALL_SHAPES.indexOf(s);
            if (poolIdx === 35 && spawned3x3InBatch) return false;
            const strShape = JSON.stringify(s);
            if ((spawnedShapesInBatch.get(strShape) || 0) >= 2) return false;
            return true;
          });
          shape = pool[Math.floor(Math.random() * pool.length)];
        }
        
        if (shape) {
           const strShape = JSON.stringify(shape);
           spawnedShapesInBatch.set(strShape, (spawnedShapesInBatch.get(strShape) || 0) + 1);
           if (ALL_SHAPES.indexOf(shape) === 35) spawned3x3InBatch = true;
           
           const color = availableColors[Math.floor(Math.random() * availableColors.length)];
           newInventory[idx] = {
             id: Math.random().toString(36).substr(2, 9),
             shape,
             image: color,
             size: Math.max(shape.length, shape[0].length),
           };
        }
    }
    setInventory(newInventory);
  }, [grid, score, getHelpfulShapes, currentSkin, inventory]);

  const resetGame = useCallback(() => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null)));
    setScore(0);
    setGameOver(false);
    setGameStatus('playing');
    setComboCount(0);
    setComboGrace(3);
    setShowCombo(false);
    setShowPerfect(false);
    
    // Initial Spawn
    const availableColors = SKIN_ASSETS[currentSkin];
    const initialPool = SHAPES_TIERS.easy;
    const initialInv: (Block | null)[] = [null, null, null];
    for (let i = 0; i < 3; i++) {
      const shape = initialPool[Math.floor(Math.random() * initialPool.length)];
      initialInv[i] = {
        id: Math.random().toString(36).substr(2, 9),
        shape,
        image: availableColors[Math.floor(Math.random() * availableColors.length)],
        size: Math.max(shape.length, shape[0].length),
      };
    }
    setInventory(initialInv);
  }, [currentSkin]);

  const startGame = useCallback(() => {
    if (gameOver) {
      resetGame();
    } else {
      const isGridEmpty = grid.every(row => row.every(cell => cell === null));
      const isInvEmpty = inventory.every(b => b === null);
      if (isGridEmpty && isInvEmpty) resetGame();
    }
    setGameStatus('playing');
  }, [grid, inventory, resetGame, gameOver]);



  const checkGameOver = useCallback((currentGrid: Grid, currentInv: (Block | null)[]) => {
    const activeBlocks = currentInv.filter((b): b is Block => b !== null);
    if (activeBlocks.length === 0) return false;
    for (const b of activeBlocks) {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) if (canPlaceBlock(currentGrid, b, { row: r, col: c })) return false;
      }
    }
    return true;
  }, [canPlaceBlock]);

  const placeBlock = useCallback((blockId: string, row: number, col: number) => {
    const blockIndex = inventory.findIndex(b => b?.id === blockId);
    if (blockIndex === -1) return false;
    const block = inventory[blockIndex]!;
    if (!canPlaceBlock(grid, block, { row, col })) return false;
    playSound('place');
    const newGrid = grid.map(r => [...r]);
    let cellsPlaced = 0;
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          newGrid[row+r][col+c] = { image: block.image, id: `${blockId}-${r}-${c}` };
          cellsPlaced++;
        }
      }
    }
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];
    for (let r = 0; r < GRID_SIZE; r++) if (newGrid[r].every(cell => cell !== null)) rowsToClear.push(r);
    for (let c = 0; c < GRID_SIZE; c++) {
      let f = true;
      for (let r = 0; r < GRID_SIZE; r++) if (newGrid[r][c] === null) { f = false; break; }
      if (f) colsToClear.push(c);
    }
    const clearedLines = rowsToClear.length + colsToClear.length;
    const placementScore = cellsPlaced * 20; // Massively increased base score
    if (clearedLines > 0) {
      const newCombo = comboCount + clearedLines;
      // Only play generic combo sound if NO shoutout will be triggered
      if (newCombo < 2) {
        playSound('combo');
      }
      const clearingGrid = newGrid.map((gr, r) => gr.map((cell, c) => (rowsToClear.includes(r) || colsToClear.includes(c)) ? (cell ? {...cell, isClearing: true} : cell) : cell));
      setGrid(clearingGrid);
      const updatedInv = [...inventory];
      updatedInv[blockIndex] = null;
      setInventory(updatedInv);
      setComboCount(newCombo);
      setComboGrace(3);
      setShowCombo(true);
      
      // Trigger Shoutout
      if (newCombo >= 2) {
        let sText = 'NICE';
        let sType = 'nice';
        if (newCombo >= 4) { sText = 'GREAT'; sType = 'great'; }
        if (newCombo >= 6) { sText = 'INCREDIBLE'; sType = 'incredible'; }
        if (newCombo >= 8) { sText = 'GODLIKE'; sType = 'godlike'; }
        
        setComboShoutout({ text: sText, type: sType });
        playSound(sType as keyof typeof AUDIO_URLS);
        setTimeout(() => setComboShoutout(null), 2000);
      }

      setTimeout(() => setShowCombo(false), 1500);
      setTimeout(() => {
        const finalGrid = clearingGrid.map((gr, r) => gr.map((cell, c) => (rowsToClear.includes(r) || colsToClear.includes(c)) ? null : cell));
        if (finalGrid.every(row => row.every(cell => cell === null))) {
          playSound('perfect');
          setComboCount(prev => prev + 10);
          setShowPerfect(true);
          setTimeout(() => setShowPerfect(false), 3000);
        }
        setGrid(finalGrid);
        setScore(prev => prev + placementScore + Math.floor((clearedLines * 400) * (1 + (newCombo * 0.5))));
        
        const isAllEmpty = updatedInv.every(b => b === null);
        if (isAllEmpty) {
          generateInventory();
        }

        // Check game over
        setTimeout(() => {
          setInventory(prev => {
            if (checkGameOver(finalGrid, prev)) { setGameOver(true); setGameStatus('gameOver'); }
            return prev;
          });
        }, 100);
      }, 400);
    } else {
      const newGrace = comboGrace - 1;
      setComboGrace(newGrace);
      if (newGrace <= 0) { setComboCount(0); setComboGrace(3); }
      setShowCombo(false);
      const updatedInv = [...inventory];
      updatedInv[blockIndex] = null;
      setInventory(updatedInv);
      setGrid(newGrid);
      setScore(prev => prev + placementScore);

      const isAllEmpty = updatedInv.every(b => b === null);
      if (isAllEmpty) {
        generateInventory();
      }

      setTimeout(() => {
        setInventory(prev => {
          if (checkGameOver(newGrid, prev)) { setGameOver(true); setGameStatus('gameOver'); }
          return prev;
        });
      }, 100);
    }
    return true;
  }, [grid, inventory, comboCount, comboGrace, canPlaceBlock, generateInventory, checkGameOver, playSound]);

  const goToMenu = useCallback(() => setGameStatus('menu'), []);

  return {
    grid, score, inventory, gameOver, gameStatus, setGameStatus,
    comboCount, showCombo, showPerfect, comboShoutout, isMuted, toggleMute,
    currentSkin, changeSkin, placeBlock, 
    resetGame, startGame, goToMenu, cycleSkin
  };
};
