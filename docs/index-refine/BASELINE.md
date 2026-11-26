# Index Refactor Baseline

## Source and version boundary

- Canonical repository: `D:\.cache\codex\visualizations\2026\11\15\01a1de7a-cd03-7771-9a35-32793264b00b\all-about-me-room-latest`
- Baseline commit: `381c5b802b46c860902f9cb324d90dc5c737fa91` (`feat: refine Chisel Room and portfolio interactions`)
- Backup ref: `backup/index-before-editorial-2026-11-26`
- Feature branch: `feat/index-quiet-editorial-refine`
- Feature worktree: `D:\.cache\codex\visualizations\2026\11\16\01a1e1ec-cf3c-7f03-b63e-4fb4f81a4344\index-quiet-editorial-refine`
- This worktree starts at the canonical HEAD. The original worktree's pre-existing uncommitted Room edits remain untouched there.

## Existing uncommitted work preserved in the original worktree

Tracked Room edits present before this task:

- `study/src/scene/LaptopDesktop.css`
- `study/src/scene/LaptopDesktop.tsx`
- `study/src/scene/Objects.tsx`
- `study/src/scene/layout.ts`
- `study/src/scene/theme.ts`

Untracked files present before this task:

- `AGENTS.md`
- `docs/design-workshop-prompts.md`
- `docs/superpowers/specs/2026-11-16-four-hearts-clover-journal-refresh-design.md`
- `docs/superpowers/specs/2026-11-16-phone-social-cards-index-responsive.md`
- `docs/superpowers/specs/2026-11-22-four-hearts-room-desk-layout-design.md`

The untracked files remain excluded from the feature branch. The five tracked Room diffs above were later copied into the combined release branch as a separate follow-up; the original canonical worktree still retains its own uncommitted copies.

## Current Index structure

`study/src/ui/Archive.tsx` owns the page shell and current content order:

1. Header/navigation
2. Hero and four-world Heartwheel
3. Quick Read metal card section
4. Three featured project cards
5. Twelve-project index, displayed directly below the featured work
6. Journal index
7. About statement
8. A separate Contact block and footer

The header currently has Worlds, Work, Journal, About and Contact actions. The page repeats contact actions in the hero and in the Contact block.

## Content and routing

- All portfolio content comes from `study/src/data/library.ts`; three entries are marked featured and the complete portfolio index is derived from `portfolioOrder`.
- Project covers are existing `entry.cover` assets in the library. No replacement imagery is needed.
- Quick Read's badge, research folder and Selected Work posters live in `QuickReadPage.tsx` and its existing assets under `study/public/visuals/quick-read/`.
- Journal content and localized article data come from `study/src/data/journal.ts`; the existing `JournalSection` and `JournalReader` own the index and reading experience.
- Hash routing is owned by `study/src/App.tsx`: `#index`, `#index/<world>`, `#index/<world>/<project>`, `#index/quick/<experience|education|work>`, `#index/journal/<article>`, and `#room`.
- `Archive.tsx` preserves scroll and focus when returning from project and Journal detail. Quick Read and Journal route handlers use browser history for their existing return behavior.

## Existing interaction map

| Area | Current implementation | Baseline behavior to retain |
|---|---|---|
| Four worlds | `LeafWorld.tsx`, `Heartwheel.tsx` | Four leaves; hover, drag/snap, focus, zoom, color spread and world content |
| Room entry | `PaperCorner.tsx`, `App.tsx` | Folded paper affordance, preload, `#room`, room reveal and return/focus behavior |
| Quick Read | `QuickReadPage.tsx`, `ExperienceBadgeScene.tsx`, `QuickReadPage.css` | Badge swing and flip, Education folder open/close and folio actions, poster browsing and project detail |
| Project cards | `Archive.tsx`, `ProjectDetail` | Cover grayscale-to-color hover, origin-based detail transition, available project links, return scroll/focus and Escape |
| Journal | `journal/JournalSection.tsx`, `JournalReader.tsx` | Paper interactions, article index, HTML reading view, hash navigation and return position |
| Localization | `i18n.tsx`, `LanguageSwitch.tsx` | English/Chinese content and language switch |

## Baseline visual review

The Index currently gives the Quick Read card trio and all twelve portfolio entries the same always-visible homepage weight. Journal and About follow afterward, with a separate Contact block; the page therefore feels longer and more repetitive than the desired editorial sequence. The existing project card hover and paper interactions are meaningful and remain part of the design.

The requested Edge headless screenshot capture was attempted at 1440×900 and 390×844 against `http://127.0.0.1:5177/#index`. Edge only captured the startup loader, then repeatedly terminated its GPU process during subsequent captures, including an elevated attempt. Loader-only images were discarded and are not presented as a review of the site. The branch and baseline commit provide a reproducible code comparison; valid visual screenshot evidence remains an environment limitation pending a browser capture that can render this machine's WebGL/Canvas page.

## Baseline checks

Run from `study/` with the branch-local dependency directory:

- `npm run lint` — passed.
- `npm run build` — passed; Vite reports the existing Room / Three.js chunks above 500 kB.
- `npm run test:room-reveal` — passed.
- `npm run test:heartwheel` — failed before Index changes. The test expects a `.paper-corner` rule in `PageTurn.css`; the current implementation is `PaperCorner`/B4 and that selector is absent. This is a pre-existing stale assertion outside the Index scope.

