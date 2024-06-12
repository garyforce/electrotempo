/****
 * This is useEffect() with an added debounce delay, for use with fast-updating
 * state with side effects that need to be debounced. Useful for API calls.
 *
 * Code from https://stackoverflow.com/a/61127960/9378561
 */
import { useEffect } from "react";

export const useDebouncedEffect = (effect, deps, delay) => {
  useEffect(() => {
    const handler = setTimeout(() => effect(), delay);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...(deps || []), delay]);
};
