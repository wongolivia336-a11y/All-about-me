/**
 * The poster wall.
 *
 * `poster` points at a file you drop into `public/posters/`. Until one exists
 * the wall draws a typeset placeholder from the title and credits, so the
 * layout can be judged before any artwork is sourced.
 *
 * Note on artwork: official posters are copyrighted. Showing them on a public
 * site is your call and your risk — nothing here fetches or bundles them.
 */
export interface Film {
  id: string;
  title: string;
  titleEn: string;
  director: string;
  year: string;
  /** e.g. "/posters/yi-yi.jpg" — leave undefined for the typeset placeholder */
  poster?: string;
  /** the accent the placeholder is drawn in */
  tone: string;
}

export const films: Film[] = [
  {
    id: "mulholland-drive",
    title: "穆赫兰道",
    titleEn: "Mulholland Drive",
    director: "David Lynch",
    year: "2001",
    tone: "#8d2f3f",
  },
  {
    id: "blue-velvet",
    title: "蓝丝绒",
    titleEn: "Blue Velvet",
    director: "David Lynch",
    year: "1986",
    tone: "#2b3f6b",
  },
  {
    id: "eraserhead",
    title: "橡皮头",
    titleEn: "Eraserhead",
    director: "David Lynch",
    year: "1977",
    tone: "#2e2e30",
  },
  {
    id: "yi-yi",
    title: "一一",
    titleEn: "Yi Yi",
    director: "杨德昌",
    year: "2000",
    tone: "#3f5f52",
  },
  {
    id: "a-brighter-summer-day",
    title: "牯岭街少年杀人事件",
    titleEn: "A Brighter Summer Day",
    director: "杨德昌",
    year: "1991",
    tone: "#6b4a2b",
  },
  {
    id: "terrorizers",
    title: "恐怖分子",
    titleEn: "The Terrorizers",
    director: "杨德昌",
    year: "1986",
    tone: "#4a4a52",
  },
  {
    id: "city-of-sadness",
    title: "悲情城市",
    titleEn: "A City of Sadness",
    director: "侯孝贤",
    year: "1989",
    tone: "#5a5f4a",
  },
  {
    id: "the-assassin",
    title: "刺客聂隐娘",
    titleEn: "The Assassin",
    director: "侯孝贤",
    year: "2015",
    tone: "#7a5a2f",
  },
  {
    id: "time-to-live",
    title: "童年往事",
    titleEn: "A Time to Live, a Time to Die",
    director: "侯孝贤",
    year: "1985",
    tone: "#8a6a4f",
  },
];
