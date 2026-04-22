/**
 * Centralized utility for game-wide logic and color mapping.
 */

/**
 * Maps image/color names to CSS class tokens.
 * Handles both legacy names and modern color-N tokens.
 */
export const getColorClass = (image: string | null): string => {
  if (!image) return '';
  
  // Map legacy names to generic color tokens if they appear
  const legacyMap: Record<string, string> = {
    'red': 'color-1',
    'blue': 'color-2',
    'green': 'color-3',
    'yellow': 'color-4',
    'purple': 'color-5'
  };
  
  const key = legacyMap[image] || image;
  return `cell-${key}`;
};
