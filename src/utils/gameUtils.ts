/**
 * Centralized utility for game-wide logic and color mapping.
 */

/**
 * Maps image/color names to CSS class tokens.
 * In this version, we map them to the new Pastel 3D Palette:
 * Pink, Blue, Soft White/Grey.
 */
export const getColorClass = (image: string | null): string => {
  if (!image) return '';
  
  const mapping: Record<string, string> = {
    'color-1': 'color-1',
    'color-2': 'color-2',
    'color-3': 'color-3',
    'color-4': 'color-4',
    'color-5': 'color-5',
  };
  
  const key = mapping[image] || 'color-3';
  return `cell-${key}`;
};
