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
    accent: "#BDD9CB",
    ink: "#35584A",
    leafColor: "#96BFA9",
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
    accent: "#BFDBEC",
    ink: "#365F77",
    leafColor: "#98BDD4",
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
    accent: "#E9C3BC",
    ink: "#714A45",
    leafColor: "#D5A59C",
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
    accent: "#E8D9AC",
    ink: "#685B3D",
    leafColor: "#D5C18C",
    texture: ["READ", "WATCH", "HEAR", "COLLECT", "REMEMBER"],
  },
};
