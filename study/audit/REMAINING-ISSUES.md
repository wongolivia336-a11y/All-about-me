# Remaining Issues and Unverified Areas

## Needs author source material

- Project detail has only current summaries, metadata and genuine links. Add authorship/role, design rationale, process, prototypes and outcomes only after receiving verifiable project material.
- The Room’s reading list and poster/sketchbook explanations still contain source placeholders. The supplied image ZIP does not contain personal archive contents to replace them.

## Needs additional device / assistive-technology checks

- Browser run covered 1440×900, 1280×800 and 390×844. 1024×768, 768×1024 and 375×667 remain untested.
- No Safari or physical-phone session; no NVDA/VoiceOver or screen-reader announcement review.
- Keyboard state and focus targets were checked in Edge, and Escape was sent as a real key event. A full Tab / Shift+Tab / arrow-key session across every Index state remains unverified.
- Room’s 12 non-lamp content surfaces were opened through the shared state store. Physical object hit areas, all camera arrival frames, touchscreen hit areas and the lamp’s physical dial/button were not covered by the new runtime smoke.

## Motion / performance evidence

- One Room reveal mid-transition frame is retained. No video or frame series was captured for theme expansion, project arrival, camera focus or loaders.
- No Lighthouse/Web Vitals, LCP/CLS/INP, long-task, GPU, frame-time or repeated-navigation memory measurements. Do not infer performance from the successful build.
- `npm run build` reports `RoomScene` at 1,384.66 KB minified (444.47 KB gzip), above Vite's chunk advisory threshold. The 14 new PNGs total 5.64 MiB. Consider measured code splitting or lossless alternatives after device/network testing; no lossy conversion was applied to the stippled illustrations.

## Bilingual content boundary

- Authored interface copy, project records, room labels / panels, accessibility labels and generated device-screen text follow EN / 中文. Names, product brands and text returned live by GitHub retain their source language because the source belongs to the external profile / repository.
- Book, poster and sketchbook entries still use author-source placeholders. They were translated for legibility but not replaced with invented personal material.

## Visual disagreements / limitations

- Concept art is semantically relevant but remains illustrative. It does not substitute for real project UI, research charts or process evidence.
- The new detail layout presents existing facts and one visual; richer case-study structure awaits materials rather than empty sections.
- Live-before evidence for the off-screen project route was recorded as DOM metrics, not as a retained live screenshot. The committed before screenshot is the local 1440×900 Index captured before this implementation.

## Current preview access

- The supplied Vercel preview redirected the live-browser session to Vercel SSO on 2026-11-04. Current deployed behavior could not be directly compared in this pass; local Edge/CDP testing covered the checked source. Revisit the preview once its access gate permits the browser session.
