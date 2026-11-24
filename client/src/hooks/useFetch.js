import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../lib/api";

/** Run an async loader whenever `deps` change. Results from stale requests are ignored. */
export function useFetch(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: "", status: 0 });
  const loaderRef = useRef(loader);
  const run = useRef(0);

  useEffect(() => {
    loaderRef.current = loader;
  });

  const load = useCallback(async () => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: "", status: 0 }));
    try {
      const data = await loaderRef.current();
      if (id === run.current) setState({ data, loading: false, error: "", status: 0 });
    } catch (err) {
      if (id === run.current) {
        setState({ data: null, loading: false, error: getErrorMessage(err), status: err?.response?.status || 0 });
      }
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, deps);

  const setData = useCallback(
    (updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })),
    []
  );

  return { ...state, reload: load, setData };
}
