import { useState, useEffect } from 'react';

/**
 * Returns a responsive items-per-page count based on viewport height.
 * @param breakpoints - sorted array of [minHeight, itemCount] pairs (smallest first)
 * @param fallback - default count if no breakpoint matches
 */
export function useItemsPerPage(
  breakpoints: [number, number][],
  fallback: number,
): number {
  const [count, setCount] = useState(fallback);

  useEffect(() => {
    function update() {
      const h = window.innerHeight;
      let result = fallback;
      for (const [minH, items] of breakpoints) {
        if (h >= minH) result = items;
      }
      setCount(result);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [breakpoints, fallback]);

  return count;
}
