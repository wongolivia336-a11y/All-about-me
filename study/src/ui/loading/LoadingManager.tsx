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

  // Wait for fonts and two real paint opportunities. This is a readiness
  // boundary for the static index, not simulated resource progress.
  useEffect(() => {
    let cancelled = false;
    const settle = () => {
      if (cancelled) return;
      const frame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        complete("app-shell");
      });
      return () => window.cancelAnimationFrame(frame);
    };
    let cancelFrame: (() => void) | undefined;
    const fontsReady = "fonts" in document ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      cancelFrame = settle();
    });
    return () => {
      cancelled = true;
      cancelFrame?.();
    };
  }, [complete]);

  const snapshot = useMemo(() => {
    void revision;
    return Array.from(tasks.current.values());
  }, [revision]);
  const failed = snapshot.find((task) => task.error);
  const active = snapshot.some((task) => task.blocking);
  const blockingTasks = snapshot.filter((task) => task.blocking);
  const progress = blockingTasks.length > 0 && blockingTasks.every((task) => task.progress !== null)
    ? blockingTasks.reduce((total, task) => total + (task.progress ?? 0), 0) / blockingTasks.length
    : null;

  const value = useMemo<LoadingContextValue>(() => ({ active, begin }), [active, begin]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <SpeechCodeLoader
        active={active}
        progress={progress}
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
