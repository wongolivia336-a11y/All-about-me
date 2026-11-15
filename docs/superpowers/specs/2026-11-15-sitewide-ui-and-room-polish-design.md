# Sitewide UI and Room polish

**Status:** Approved by user on 2026-11-15  
**Baseline:** `main` at `0c5867d` (`codex/latest-preview-disk` local worktree)  
**Implementation target:** local branch only; no push or deployment

## Intent

Make controls feel like one designed system across the Index, archive, project pages, Room HUD and panels, portfolio reader, and the interactive laptop. Correct the visible Four Hearts and Room issues while preserving the current four-leaf rotation, page turns, and spatial navigation.

From the surrounding request about inconsistent buttons, I am treating “全局的 8 层” as the global button/control system. The repository does not define an eight-layer design system; if “8层” names a specific set of screens, the scope can be relabeled without changing the proposed control rules.

## Goals

- Establish shared control sizing, typography, radius, spacing, focus, hover, and pressed-state tokens.
- Give primary, secondary, quiet/text, and icon controls a consistent hierarchy without forcing every control into one silhouette.
- Make all four leaves in the brand mark read as equal shapes, with consistent spacing and material treatment in both SVG and 3D.
- Use the actual portfolio cover (`study/public/portfolio/page-01.webp`) as the common laptop wallpaper source so the idle screen and interactive desktop share the same identity.
- Replace the laptop window’s text-glyph controls with centered vector icons for minimize, maximize/restore, and close while retaining their current actions.
- Correct the reversed pencil point on the sketchbook and review other visible room props for comparable orientation errors.

## Non-goals

- Do not replace the four-leaf interaction, theme selection, or page transition model.
- Do not redesign the Room layout or replace its procedural models wholesale.
- Do not remove the retro computer skins; their visual character remains distinct inside the simulated desktop.
- Do not change the live Vercel deployment or write to GitHub.

## Approaches considered

1. **One identical button appearance everywhere.** This is easy to recognize as consistent, but it erases the intended desktop-system language and makes compact controls awkward.
2. **Shared design tokens plus semantic variants — recommended.** The site uses one sizing, typography, radius, and state system. The simulated desktop maps to the same scale and alignment rules while keeping its OS-specific borders and surfaces. This provides coherence without flattening context.
3. **Patch only the most visible buttons.** This is faster, but it leaves competing rules and future drift in place.

## Proposed design

### Control system

- Define compact, standard, and touch control sizes; use a 44px minimum interaction target on touch layouts while keeping visual size appropriate to the control.
- Define compact and standard corner radii. Reserve pill and circular shapes for segmented selectors, chips, and dedicated round icon controls.
- Proposed starting tokens for review: 32px compact visual height, 40px standard visual height, and a 44px minimum hit area; 6px compact and 8px standard radii. Let text length determine button width, with shared horizontal padding and minimum widths by role.
- Use one shared sans face and 13–14px scale for control labels and body UI; reserve monospace for 10–11px metadata and status readouts. Keep the display serif for editorial headings so the site retains its existing voice.
- Define primary, secondary, quiet/text, and icon variants with common border, focus, hover, and pressed behavior.
- Replace repeated hard-coded values in shared site controls with tokens. Keep the laptop OS’s retro border treatment, but align icon centering, typography baseline, and interaction target sizing to the shared scale.
- Set the interstitial/loading page background to white and remove its explanatory eyebrow (“一段转场 / 不是等待室” / “AN INTERLUDE / NOT A WAITING ROOM”). Preserve the main loading title, supporting line, status/progress, and animated Four Hearts artwork.

### Four Hearts mark

- Keep the existing 0/90/180/270-degree rotation and selection behavior.
- Treat the existing symmetric heart path as the canonical leaf shape; normalize scale, central meeting point, texture density, outline, and active/hover treatment between the SVG and 3D render.
- Preserve the four theme colors and labels. Adjust the optical gap at the center only as needed to make the four leaves read as equal.

### Laptop and Room corrections

- Reuse the existing portfolio cover as the laptop’s wallpaper source on both the idle 3D screen and the interactive desktop. Keep project shortcuts and applications available over the wallpaper.
- Draw window-control icons with inline SVG so their geometry does not depend on font glyphs. Keep minimize, maximize/restore, close, taskbar restore, and keyboard behavior intact.
- Reverse the sketchbook pencil-tip cone orientation so the graphite point faces away from the eraser and body.
- Review the existing Room evidence and procedural prop definitions for similar axis/sign errors. Only correct clearly demonstrated defects in this pass; model redesigns need separate visual direction.

## Constraints and calls

- Continue from the newest local `main` worktree at commit `0c5867d`.
- Keep Index and Room navigation, four-leaf motion, responsive layouts, keyboard focus, and reduced-motion behavior intact.
- The wallpaper source is the existing portfolio cover, rather than a newly invented illustration.
- “八层” is treated as the global button/control system based on the request context; revise the wording if it refers to a specific set of screens.

## Review points

- Compare Index, theme/archive, project detail, reader, Room HUD/panel, and laptop desktop control sizes and typography.
- Compare the four-leaf silhouette and center spacing in the SVG and 3D render.
- Confirm the laptop’s idle and focused desktop use the same cover identity.
- Confirm all three window controls remain operable and visually centered.
- Inspect the sketchbook pencil and other obvious directional props in the Room.
- Use local visual/interaction review; do not publish or push.
