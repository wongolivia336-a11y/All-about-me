# Leaf World Portal Interaction

**Date:** 2026-11-12
**Status:** Approved by Olivia's direct implementation instruction in the active redesign thread.

## Intent

Make the four-leaf wheel the clear entry point. Selecting a leaf should feel like entering a distinct world, with that world's project cards appearing after the transition rather than beside the wheel on the home view.

## Approaches

1. Keep the current split view and add a bloom over the project preview. This preserves the existing first-level content density, but leaves the wheel and work competing for attention.
2. Use the 5175 prototype's home-to-world structure — selected leaf rotates into place, a portal blooms from that leaf, and the focused world reveals its project cards. **Chosen:** it matches Olivia's requested hierarchy and reuses the current wheel and project data.
3. Animate the complete transition inside WebGL. It offers more physical control, but adds rendering and accessibility complexity without improving the DOM-based world content.

## Design

- Keep the existing 3D green leaf surface and four-theme rotation.
- Remove the project-cover preview from the home-side panel; use a quiet theme introduction there. Keep the existing themed project cards in the full-screen secondary world.
- On click, let the selected leaf finish rotating before changing the route. Use the settled leaf's viewport bounds as the transition origin.
- Reveal the world with a roughly 1.46 second circular membrane and soft theme-color bloom. Close it back to the same leaf over roughly 1.12 seconds. Keep keyboard focus, route state, touch input, and project links working.
- Use the existing DOM/CSS transitions and reduced-motion behavior; do not add a dependency or change the 3D Room.

## Scope

This change updates the Archive's entry and world transition only. It leaves the 3D Room, project detail content, and existing visual assets in place.
