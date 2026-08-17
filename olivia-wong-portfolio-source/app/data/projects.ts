export type DesignOrder =
  | "symbols"
  | "artifacts"
  | "actions-events"
  | "systems-environments";

export interface PortfolioProject {
  id: string;
  index: string;
  title: string;
  titleZh: string;
  year: string;
  order: DesignOrder;
  discipline: string;
  location: string;
  duration: string;
  role: string;
  summary: string;
  statement: string;
  cover: string;
  crop?: string;
  tone: "blue" | "red" | "black" | "acid";
  size: "wide" | "tall" | "square";
}

export const orderMeta: Record<
  DesignOrder,
  { number: string; label: string; short: string; premise: string }
> = {
  symbols: {
    number: "01",
    label: "Symbols",
    short: "Messages",
    premise: "The signs through which meaning becomes shareable.",
  },
  artifacts: {
    number: "02",
    label: "Artifacts",
    short: "Things",
    premise: "The objects through which intention takes material form.",
  },
  "actions-events": {
    number: "03",
    label: "Actions & Events",
    short: "Interactions",
    premise: "The sequences through which people meet, act and change.",
  },
  "systems-environments": {
    number: "04",
    label: "Systems & Environments",
    short: "Contexts",
    premise: "The conditions through which many possible futures coexist.",
  },
};

/**
 * Gallery content interface.
 * Add a PortfolioProject here and it automatically joins filters, the index,
 * list view and the project dossier. Assets live in /public/work/.
 */
export const projects: PortfolioProject[] = [
  {
    id: "resonance-glyphs",
    index: "001",
    title: "Resonance Glyphs",
    titleZh: "共振字形",
    year: "2026",
    order: "symbols",
    discipline: "Identity / Type / Sound",
    location: "Shanghai",
    duration: "14 weeks",
    role: "Research, art direction, type design",
    summary: "A living identity that gives public sound a visible grammar.",
    statement:
      "Resonance Glyphs translates the pressure, duration and direction of urban sound into a modular alphabet. Each mark is less a logo than a temporary agreement between a place and the people passing through it.",
    cover: "/work/project-symbols.png",
    crop: "50% 45%",
    tone: "blue",
    size: "tall",
  },
  {
    id: "counterfeit-memory",
    index: "002",
    title: "Counterfeit Memory",
    titleZh: "伪造记忆",
    year: "2024",
    order: "symbols",
    discipline: "Editorial / Moving Image",
    location: "Tokyo",
    duration: "8 weeks",
    role: "Concept, editorial system, motion",
    summary: "An unstable publication about images that remember for us.",
    statement:
      "A publication and film essay assembled from misregistered archives, synthetic captions and unreliable timestamps. The system asks when documentation stops recording the past and starts manufacturing it.",
    cover: "/work/project-symbols.png",
    crop: "18% 68%",
    tone: "red",
    size: "wide",
  },
  {
    id: "soft-machine-03",
    index: "003",
    title: "Soft Machine No. 03",
    titleZh: "柔软机器 03",
    year: "2025",
    order: "artifacts",
    discipline: "Object / Experimental Furniture",
    location: "Hangzhou",
    duration: "22 weeks",
    role: "Industrial design, prototyping",
    summary: "A tool that changes function when a body leans into it.",
    statement:
      "Neither chair nor instrument, Soft Machine No. 03 responds to weight with a delayed change in tension. Its usefulness stays unsettled until a body teaches the object what it is for.",
    cover: "/work/project-artifacts.png",
    crop: "51% 50%",
    tone: "red",
    size: "wide",
  },
  {
    id: "borrowed-shade",
    index: "004",
    title: "Borrowed Shade",
    titleZh: "借来的阴影",
    year: "2023",
    order: "artifacts",
    discipline: "Material / Civic Object",
    location: "Shenzhen",
    duration: "11 weeks",
    role: "Design research, object system",
    summary: "A family of street objects that lend shelter without ownership.",
    statement:
      "Folded aluminum, tension cloth and public etiquette become a portable commons. Each unit can be carried alone but only reaches its stable form when connected to another.",
    cover: "/work/project-artifacts.png",
    crop: "84% 42%",
    tone: "black",
    size: "square",
  },
  {
    id: "weather-for-strangers",
    index: "005",
    title: "Weather for Strangers",
    titleZh: "陌生人的天气",
    year: "2025",
    order: "actions-events",
    discipline: "Performance / Public Program",
    location: "Tokyo",
    duration: "3 days",
    role: "Experience design, direction",
    summary: "A public ritual for exchanging small forecasts and large fears.",
    statement:
      "Visitors trade a personal forecast for one written by a stranger. Light, sound and temperature shift with every exchange until the room produces a collective climate no individual authored.",
    cover: "/work/project-actions.png",
    crop: "50% 50%",
    tone: "blue",
    size: "square",
  },
  {
    id: "after-the-applause",
    index: "006",
    title: "After the Applause",
    titleZh: "掌声之后",
    year: "2022",
    order: "actions-events",
    discipline: "Choreography / Interface",
    location: "Seoul",
    duration: "18 minutes",
    role: "Interaction score, spatial graphics",
    summary: "A performance whose interface begins when the event appears over.",
    statement:
      "The audience receives no instruction until the curtain call. Their exits, pauses and accidental gatherings become the actual choreography—an ending redistributed across many bodies.",
    cover: "/work/project-actions.png",
    crop: "30% 64%",
    tone: "acid",
    size: "tall",
  },
  {
    id: "tidal-commons",
    index: "007",
    title: "Tidal Commons",
    titleZh: "潮汐公地",
    year: "2026",
    order: "systems-environments",
    discipline: "Service / Civic Ecology",
    location: "Ningbo",
    duration: "9 months",
    role: "System design, field research",
    summary: "A civic protocol that lets a waterfront negotiate with its tide.",
    statement:
      "Sensors, seasonal rituals and neighborhood stewardship replace the fixed seawall with a negotiated edge. The proposal designs relations among sediment, maintenance budgets, fishing knowledge and daily leisure.",
    cover: "/work/project-systems.png",
    crop: "50% 50%",
    tone: "blue",
    size: "wide",
  },
  {
    id: "school-without-rooms",
    index: "008",
    title: "School Without Rooms",
    titleZh: "没有房间的学校",
    year: "2021—",
    order: "systems-environments",
    discipline: "Learning System / Strategy",
    location: "Distributed",
    duration: "Ongoing",
    role: "Co-design, platform strategy",
    summary: "A learning environment mapped by promises instead of walls.",
    statement:
      "A distributed school where a bakery can host chemistry, a bus route can host civic history and a vacant shop can host rehearsal. Curriculum emerges from the promises a neighborhood is willing to keep.",
    cover: "/work/project-systems.png",
    crop: "70% 40%",
    tone: "red",
    size: "square",
  },
];
