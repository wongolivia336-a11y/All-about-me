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
    accent: "#B8CBB7",
    ink: "#38503c",
    leafColor: "#AEC4AF",
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
    accent: "#BBCDD1",
    ink: "#38525b",
    leafColor: "#AFC2C5",
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
    accent: "#D9BCB2",
    ink: "#60443e",
    leafColor: "#D4B3A6",
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
    accent: "#DCD0BE",
    ink: "#62533e",
    leafColor: "#D7C6A7",
    texture: ["READ", "WATCH", "HEAR", "COLLECT", "REMEMBER"],
  },
};
