import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { SpeechCodeLoader } from "../SpeechCodeLoader";
import { LoadingContext, type LoadingContextValue, type LoadingTaskController } from "./LoadingContext";

type Retry = () => void;

type LoadingTask = {
  id: string;
  label: string;
  blocking: boolean;
  progress: number | null;
  error: string | null;
  retry: Retry | null;
};

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * A small, app-wide loading coordinator. Callers can track real work or a
 * two-frame visual handoff for a local view switch. The ASCII field holds
 * either one for a short minimum exposure and never shows fake progress.
 */
export function GlobalLoadingProvider({
  children,
  onReturnToIndex,
}: PropsWithChildren<{ onReturnToIndex?: () => void }>) {
  const tasks = useRef(
    new Map<string, LoadingTask>([
      ["app-shell", { id: "app-shell", label: "App shell", blocking: true, progress: null, error: null, retry: null }],
    ]),
  );
  const taskId = useRef(0);
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  const complete = useCallback(
    (id: string) => {
      if (tasks.current.delete(id)) refresh();
    },
    [refresh],
  );

  const begin = useCallback(
    (label: string, options: { blocking?: boolean } = {}): LoadingTaskController => {
      const id = `task-${taskId.current += 1}`;
      let closed = false;
      tasks.current.set(id, {
        id,
        label,
        blocking: options.blocking ?? true,
        progress: null,
        error: null,
        retry: null,
      });
      refresh();

      return {
        done: () => {
          if (closed) return;
          closed = true;
          complete(id);
        },
        report: (progress) => {
          const task = tasks.current.get(id);
          if (!task || closed) return;
          task.progress = clamp(progress);
          refresh();
        },
        fail: (message, retry) => {
          const task = tasks.current.get(id);
          if (!task || closed) return;
          task.error = message;
          task.retry = retry ?? null;
          refresh();
        },
      };
    },
    [complete, refresh],
  );

  // This is a real paint boundary, not simulated resource progress. The loader
  // itself keeps a short visual handoff so a fast initial render never flashes.
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => complete("app-shell"));
    return () => window.cancelAnimationFrame(frame);
  }, [complete]);

  const snapshot = useMemo(() => {
    void revision;
    return Array.from(tasks.current.values());
  }, [revision]);
  const failed = snapshot.find((task) => task.error);
  const active = snapshot.some((task) => task.blocking);

  const value = useMemo<LoadingContextValue>(() => ({ active, begin }), [active, begin]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <SpeechCodeLoader
        active={active}
        error={failed?.error ?? null}
        onReturnToIndex={onReturnToIndex}
        onRetry={
          failed?.retry
            ? () => {
                const retry = failed.retry;
                complete(failed.id);
                retry?.();
              }
            : undefined
        }
      />
    </LoadingContext.Provider>
  );
}
