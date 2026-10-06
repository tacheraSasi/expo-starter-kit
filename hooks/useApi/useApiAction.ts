import { useCallback, useRef, useState } from "react";

export interface UseApiActionOptions<R> {
  onSuccess?: (result: R) => void;
  onError?: (error: any) => void;
}

export interface UseApiActionResult<A extends any[], R> {
  /** Runs the action. Resolves with the result, or `undefined` on failure. */
  run: (...args: A) => Promise<R | undefined>;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * Mutation wrapper: tracks loading + error for a single async action
 * (create/update/delete/approve...). Errors are caught and surfaced via
 * the `error` state and the optional `onError` callback — `run` never
 * rejects, so callers don't need try/catch unless they want the result.
 */
export function useApiAction<A extends any[], R>(
  action: (...args: A) => Promise<R>,
  options?: UseApiActionOptions<R>,
): UseApiActionResult<A, R> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const result = await actionRef.current(...args);
      optionsRef.current?.onSuccess?.(result);
      return result;
    } catch (e: any) {
      const message = e?.message || "Something went wrong";
      setError(message);
      optionsRef.current?.onError?.(e);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, setError };
}
