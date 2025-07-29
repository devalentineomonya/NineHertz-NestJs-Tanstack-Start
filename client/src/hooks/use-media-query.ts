import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);

      // Update state with current match
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      // Create listener
      const listener = () => setMatches(media.matches);

      // Modern addEventListener
      if (media.addEventListener) {
        media.addEventListener("change", listener);
      } else {
        // Fallback for older browsers
        media.addListener(listener);
      }

      // Clean up
      return () => {
        if (media.removeEventListener) {
          media.removeEventListener("change", listener);
        } else {
          media.removeListener(listener);
        }
      };
    }
  }, [query, matches]);

  return matches;
}
