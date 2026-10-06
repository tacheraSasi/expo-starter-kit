import { useEffect, useState } from "react";

/**
 * Returns `value` after it has been stable for `delay` ms.
 * Use for search inputs that should only trigger server-side queries
 * once the user stops typing (replaces per-screen debounce effects).
 */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
