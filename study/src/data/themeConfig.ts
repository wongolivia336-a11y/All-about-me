import type { ThemeId } from "./library";

export interface ThemeDefinition {
  id: ThemeId;
  leafAngle: number;
  focusRotation: number;
  label: string;
  descriptor: string;
  shortLabel: string;
  description: string;
  verb: string;
  accent: string;
  ink: string;
  leafColor: string;
  texture: readonly string[];
}

export const themeOrder: readonly ThemeId[] = ["build", "question", "play", "keep"];

export const themeConfig: Record<ThemeId, ThemeDefinition> = {
  build: {
    id: "build",
    leafAngle: 0,
    // The committed leaf faces the right-hand content dock.
    focusRotation: 90,
    label: "BUILD",
    descriptor: "AI products",
    shortLabel: "Things I build",
    description: "AI products, interfaces and systems made useful in the real world.",
    verb: "make systems legible",
    accent: "#D8EDE1",
    ink: "#34594A",
    leafColor: "#C9E4D6",
    texture: ["SYSTEM", "SHIP", "CARE", "ITERATE", "INTERFACE"],
  },
  question: {
    id: "question",
    leafAngle: 90,
    focusRotation: 0,
    label: "QUESTION",
    descriptor: "Research / HCI",
    shortLabel: "Things I question",
    description: "Research, evidence and visual arguments for things that are still unclear.",
    verb: "stay with the question",
    accent: "#DAEBF5",
    ink: "#365B72",
    leafColor: "#C7DFEB",
    texture: ["WHY", "EVIDENCE", "MAP", "NOTICE", "METHOD"],
  },
  play: {
    id: "play",
    leafAngle: 180,
    focusRotation: -90,
    label: "PLAY",
    descriptor: "Creative code",
    shortLabel: "Things I play with",
    description: "Creative technology, prototypes and small experiments with a pulse.",
    verb: "follow the spark",
    accent: "#F5DED8",
    ink: "#724D4C",
    leafColor: "#E9CBC6",
    texture: ["TRY", "LISTEN", "LOOP", "MAKE", "AGAIN"],
  },
  keep: {
    id: "keep",
    leafAngle: 270,
    focusRotation: -180,
    label: "COLLECT",
    descriptor: "Cinema / objects",
    shortLabel: "Things I collect",
    description: "A quiet shelf for references, objects and memories worth returning to.",
    verb: "keep what matters",
    accent: "#F4E8C9",
    ink: "#6E6041",
    leafColor: "#EBE0BC",
    texture: ["READ", "WATCH", "HEAR", "COLLECT", "REMEMBER"],
  },
};
