# Question Page Copy and Hierarchy

**Date:** 2026-11-13  
**Status:** Approved by Olivia on 2026-11-13

## Intent

Make the Question page feel more authored by removing explanatory clutter while helping first-time visitors understand and open the research projects quickly.

## Goals

- Keep the existing four-theme navigation and project destinations.
- Give the project covers more room and make each project title easy to scan.
- Keep one concise, specific sentence under each project title.
- Preserve the pure-white ground, existing visual identity, responsive behavior, Chinese/English support, and accessible card interaction.

## Non-goals

- No new page sections, decorative labels, social links, or changes to the 3D Room.
- No replacement of the existing project covers or detail routes.
- No new motion system; retain only the existing restrained interaction feedback.

## Approaches considered

1. **Project title plus one-sentence summary — selected by Olivia.** Keeps enough context for visitors to understand the research while removing repeated page and card annotations.
2. **Large image plus project title only.** Makes the page more image-led, but gives first-time visitors less context about what each project explores.

The selected direction keeps the visual restraint of the image-first option while retaining a short, useful description for each project.

## Proposed design

- Use a single concise page heading, `研究` / `Research`.
- Remove the duplicated eyebrow and the page-level explanatory paragraph. Keep the four-theme navigation, with `追问` / `Question` active.
- Remove the navigation's small numeric prefixes while keeping all four labels and the active state.
- Show the two existing project cards in balanced columns on wide screens and stack them on narrow screens. Preserve each cover, title, and detail link; remove repeated category and year metadata.
- Use one short sentence per project, fitting on one line at desktop widths where space allows:
  - `镜子的两面` — `用文本可视化追踪古典意象如何进入现代经验。`
  - `一封侨批，抵达之后` — `沿着侨批的寄递轨迹，连接海外与潮汕村庄。`
- Keep keyboard focus visible, retain meaningful image descriptions, and allow short summaries to wrap naturally on small screens.

## Constraints and builder calls

- The page currently contains two research projects and uses existing local cover assets and routes; reuse them.
- Keep the current white background and existing leaf-world styling. Avoid adding explanatory microcopy, badges, or extra ornament.
- The exact English summary wording is a builder call, preserving the Chinese meaning and the same concise tone.

## Scope and delivery

The approved implementation updates the Question page's hierarchy and copy, plus the shared theme navigation's numeric prefixes for consistency. Existing project destinations, cover assets, page transition, and other theme-page content remain intact.
