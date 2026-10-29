import { createContext, useContext } from "react";

export type LoadingTaskController = {
  done: () => void;
  fail: (message: string, retry?: () => void) => void;
  report: (progress: number) => void;
};

export type LoadingContextValue = {
  active: boolean;
  begin: (label: string, options?: { blocking?: boolean }) => LoadingTaskController;
};

export const LoadingContext = createContext<LoadingContextValue | null>(null);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used inside GlobalLoadingProvider");
  return context;
}
