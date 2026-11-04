# Interaction Map

## Index

| State | Entry | URL | Visible surface | Exit / history |
|---|---|---|---|---|
| Overview | Load `#index` | `#index` | Intro、四叶草、四主题图像矩阵 | Select a leaf / tile |
| Focused theme | Select a Heartwheel label or image tile | Usually `#index`; in-memory theme state | One expanded image、主题摘要、Explore / View all | Overview button or second deliberate leaf selection |
| Theme archive | View all | `#index/{theme}` | Theme project list | Back to Living Index |
| Project detail | Open a selected-work card or theme tile | `#index/{theme}/{projectId}` | Back button、真实摘要与链接、概念图标注 | Back button uses browser history when opened in-app; direct route replaces with archive route |

Project detail keeps the archive mounted. On open it records the source card, nested scroll position and card viewport top. Detail receives focus and is scrolled into view. On return, the source route and visual position are restored before focus returns to the source card. `document.title` follows the project and returns to the site title on exit.

## Room

| State | Entry | URL | Visible surface | Exit / history |
|---|---|---|---|---|
| Loading / revealing | Room corner button | `#room` | SpeechCodeLoader and staged Room reveal | Return to Index stays available once Room becomes interactive |
| Overview | Reveal complete | `#room` | 3D scene, HUD, Room exit control | Focus an object or exit |
| Object focus | Scene object / shared focused-object state | `#room` | Camera pose plus object content surface | Escape or panel close |
| Content interaction | Object-specific surface | `#room` | Panel, portfolio viewer, music/film controls, lamp HUD | Surface close, Escape, or Index exit |
| Returning | Return to Index | `#index` | Index reveal; Room input disabled during transition | Completion restores focus to Room entry |

Hotspot camera poses derive from `src/scene/layout.ts` through `src/data/hotspots.ts`. The shared store keeps focused object, lamp power, brightness and ambient day/night state separate. This audit exercised all 12 non-lamp content surfaces through the shared focus state; it did not physically click every 3D hotspot.

## Index ↔ Room

Room entry pushes `#room`; exit pushes the Index route. Browser Back and Forward were exercised in Edge after both transitions. Runtime Room tests confirmed the reveal becomes interactive after the scene is ready, and focus moves to the Room exit control and back to the Room entry control.

## Four Hearts interaction

1. Overview shows four persistent image tiles.
2. Selecting a theme rotates/emphasizes its leaf and expands its existing tile.
3. Focused tile opens its project; other tiles become inert while hidden.
4. Returning from a project restores the source card and scroll context.
5. A real touch-cancel gesture returns the wheel to its starting angle without committing a theme.

Reduced-motion mode disables tile transitions and copy animation; the Heartwheel animation driver sets its target immediately.

## URL and source of truth

Hash routing is authoritative for Index archive/project routes and Room. The currently focused Heartwheel theme remains local UI state while the route is plain `#index`; choosing “View all” writes a theme route. This is a deliberate distinction in current code, not a second project-detail route source. Project identity comes from the slug in the hash and the single `library` data set.

## Language selection

The EN / 中文 toggle is available in both the Index identity bar and Room HUD. `LanguageProvider` owns the current language across route changes and persists it in local storage. It updates document language, visible interface copy, project metadata, theme labels, Room object descriptions and generated laptop / phone / portfolio screen textures. Native names, product brands and text fetched live from third-party APIs remain in their source form.
