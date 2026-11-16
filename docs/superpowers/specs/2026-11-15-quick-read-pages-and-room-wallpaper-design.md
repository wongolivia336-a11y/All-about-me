# Quick Read subpages and Room wallpaper

**Status:** Approved by user on 2026-11-15
**Baseline:** local `codex/latest-preview-disk` worktree at `0c5867d`
**Scope:** local preview only; no deployment or push

## Intent

Turn the three Quick Read cards into distinct entry points with three items each, while giving each subject its own material language. Use the user-provided Steve Jobs and Macintosh image consistently on the idle 3D laptop screen and its interactive desktop, with a visible link to the user's GitHub profile.

## Goals

- Quick Read cards navigate to `#index/quick/experience`, `#index/quick/education`, or `#index/quick/work`, with browser history and a clear return to the index.
- The experience page displays three hanging badge cards in a Three.js spring and damping simulation. BioAZ is the only confirmed internship entry; the other two remain clearly marked placeholders.
- The education page presents three research folios: known graduate study information plus placeholders for field research and papers.
- The selected work page presents three existing featured works as an editorial poster wall. It remains a curated case-study route, separate from the four-leaf theme taxonomy.
- Use responsive HTML details and keyboard controls alongside the 3D interaction. Respect reduced-motion preferences.
- Use `/images/steve-jobs-macintosh.png` as the single source for both laptop views. Show `github.com/wongolivia336-a11y` on the wallpaper and as a clickable desktop link.
- Prepare a prompt pack for transparent PNG assets. Keep generated assets optional so the interface remains complete with CSS and existing project covers.

## Approaches considered

1. **One generic card grid for all three pages.** Fast, but it erases the tactile badge, research-document, and exhibition-wall differences the user selected.
2. **A shared editorial system with distinct interactions — selected.** Keep consistent navigation, typography, numbering, and return controls; use a spring-simulated badge display, layered folios, and three project posters for the page-specific experience.
3. **Separate full-screen 3D scenes for all pages.** Adds weight and competes with the main Four Hearts wheel and Room. Use Three.js only for the requested physical badge page.

## Page structure

- The index retains its hero, four-leaf wheel, and section order. Quick Read cards navigate rather than expand in place.
- Experience: three 3D badge cards; selecting one updates a readable information panel. Only BioAZ details are real; two cards are placeholders.
- Education: three paper folios for graduate research, field research, and papers/thesis. Unknown descriptions remain placeholders.
- Selected work: the repository's three already-featured entries are shown as image-led case posters; each opens the existing project detail flow.
- Each subpage has a back control and continues to support the existing language switch.
- The 3D laptop idle screen and desktop wallpaper use the same photo crop and GitHub URL treatment. The desktop URL is an actual external link.

## Constraints and non-goals

- Preserve the four-leaf colors, selection, hover/drag motion, and dissolve transition. Scroll rotation stays confined to the resting wheel interaction and does not block page scrolling.
- Keep earlier local button, Room, loading-page, and geometry changes intact.
- Do not invent internship names, research titles, paper findings, or project facts.
- Do not publish, push, or generate final artwork in this pass. Generated PNGs will be added after the user provides them.

## Implementation sequence

1. Extend hash routing and Quick Read page navigation; keep the index scroll position when entering and leaving a subpage.
2. Build the Three.js badge simulation and the education folio and featured-work poster pages.
3. Replace the laptop image source in both renders and add the GitHub URL treatment.
4. Write the transparent-PNG prompt pack with filenames, dimensions, and style constraints.
5. Type-check and confirm the local Vite preview still serves the updated modules.
