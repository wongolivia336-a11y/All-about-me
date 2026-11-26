# Index Interaction Preservation Matrix

| Feature | Owning code | Refactor treatment | Verification |
|---|---|---|---|
| Four-leaf worlds and their motion | `LeafWorld.tsx`, `Heartwheel.tsx` | Keep in the Hero as the second lead; do not alter geometry or state | Source untouched; runtime interaction check pending |
| PaperCorner and Room transition | `PaperCorner.tsx`, `App.tsx`, `PageTurn.css` | Keep independent and unchanged | Source untouched; Room reveal check passes; runtime navigation pending |
| Internship badges | `QuickReadPage.tsx`, `ExperienceBadgeScene.tsx` | Keep in the existing Experience page, linked from About | Source untouched; runtime route check pending |
| Education folder | `QuickReadPage.tsx`, `QuickReadPage.css` | Keep in the existing Education page, linked from About | Source untouched; runtime route check pending |
| Selected Work posters | `QuickReadPage.tsx` | Keep in the existing Quick Read Selected Work page, linked from About | Source untouched; runtime route check pending |
| Three featured project cards | `Archive.tsx` | Keep original project data/assets and origin-based detail transition | Data and component retained; runtime hover/open/close pending |
| Remaining nine projects | `library.ts`, `ProjectIndexItem` | Move behind the complete archive disclosure; do not remove entries or links | Source confirms 12 ordered entries; keyboard/runtime disclosure and detail return pending |
| Journal paper/index/reader | `journal/JournalSection.tsx`, `JournalReader.tsx`, `App.tsx` | Place after About; retain component, hash routes, paper motion and return state | Source untouched; runtime route/reader check pending |
| English/Chinese switch | `i18n.tsx`, `LanguageSwitch.tsx` | Keep navigation and new copy bilingual | New disclosure and About labels have both locales; runtime check pending |
| Keyboard, focus, Escape and reduced motion | `Archive.tsx`, `App.tsx`, component CSS | Keep current route/state behavior and scoped motion rules | Disclosure focus behavior retained in source; full runtime check pending |

