# Archive Index Redesign

**Date:** 2026-11-12
**Status:** Approved by Olivia on 2026-11-12

## Intent

Make the Archive Index the portfolio's first, clear point of entry. It should feel authored and tactile on a pure-white ground, help a recruiter understand Olivia's practice and selected work quickly, and preserve the four-leaf rotation as its signature interaction. The folded corner at the upper right opens the existing 3D Room.

## Goals

- Improve the first viewport's hierarchy, spacing, project imagery, and contact visibility using the supplied FOUR HEARTS HTML as a visual reference.
- Replace the thin, flat-looking SVG treatment of the four-leaf wheel with a restrained, shallow 3D leaf surface in the existing React Three Fiber stack. Keep labels, project cards, and semantic controls in the DOM.
- Keep the main clover green and legible against white; use other colors as controlled accents rather than as a beige page treatment.
- Give the Archive-to-Room folded-corner transition a deliberate, continuous reveal of about 2.4 seconds. Keep in-Archive selection transitions shorter, with reduced-motion support.
- Show selected projects and only configured, working contact links on the Index.

## Non-goals

- Do not redesign the 3D Room's models, panels, laptop, phone, or internal project catalog in this pass.
- Do not replace the Archive with the temporary static HTML, migrate frameworks, or add a full-page flipbook dependency.
- Do not invent or expose missing social destinations, project URLs, screenshots, or credentials.
- Do not clean/reset unrelated pending work in the existing feature branch.

## Constraints

- The supplied FOUR HEARTS HTML is a reference; the implementation target is the Archive in `study/` of the `All-about-me` repository.
- The repository already uses React 19, React Three Fiber 9, Three.js, Drei, and React postprocessing. Prefer those existing dependencies; keep the Index's copy and controls accessible without WebGL.
- The worktree is already dirty across multiple files. Preserve and audit those changes before committing or pushing.
- Respect keyboard operation, focus restoration, touch input, and `prefers-reduced-motion`.

## Approaches considered

1. **Layered SVG:** quickest and lightest, but retains the flat vector quality Olivia dislikes.
2. **Shallow R3F leaf mesh — recommended:** build the four leaves as controlled geometry with a slight central ridge, soft edge thickness, and restrained physical shading. Keep DOM labels and controls. Reuse the current rendering stack and avoid a new animation or geometry framework.
3. **Blender-authored GLB:** allows the most art direction, but adds an asset pipeline and more loading/maintenance cost than this Index pass needs.

The recommended approach is #2 because it adds material depth while preserving the existing archive layout, interaction model, and repository stack.

## Interaction and motion

- The folded corner remains the single Index-to-Room entry.
- The reveal begins at the folded corner, carries a subtle paper lift, and opens onto the existing Room without changing its scene or internal routes.
- Aim for roughly 2.4 seconds for the top-level Archive-to-Room transition. Use shorter transitions for selecting a leaf or opening a project so repeated browsing stays responsive.
- When reduced motion is requested, use a brief non-spatial fade and do not run spring or shader motion.
- If WebGL is unavailable, render a static four-leaf fallback and preserve the DOM navigation.

## Visual direction

- White page background, editorial typography, clear first-screen project hierarchy.
- A richer green clover with visible volume, gentle directional light, and a restrained leaf vein; no prominent outline treatment or glossy/glassy effect.
- Project covers should come from real work and share consistent crop and color treatment. External CC0 material resources may inform surface texture, not replace project imagery.
- Keep effects subtle and avoid adding visual noise or decorative UI around the clover.

## Scope and next step

This pass covers the Archive Index and its existing folded-corner entry to Room. Room asset polish and the broader App/Web project link catalog remain a later pass. After approval, refine the Index in the existing feature branch, review its full diff, validate the build and local preview, then push the reviewed changes to GitHub for a preview deployment.
