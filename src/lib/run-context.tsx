import { createContext, useContext } from "react";
import { currentRun, type RunOccurrence } from "./run-occurrence";

export const RunContext = createContext<RunOccurrence | null>(null);
export function useRun() {
  return useContext(RunContext) ?? currentRun();
}
