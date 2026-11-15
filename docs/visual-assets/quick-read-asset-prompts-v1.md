# Quick Read 视觉素材提示词 v1

这组素材先统一为「有触感的丝网印刷小物」：借鉴你给的家具插画、彩色旧物和纸张颗粒，但保留现在网站的留白和克制。每张图都是透明底的独立插画，文字、卡片、海报排版由网页负责，这样后续换中英文或改版时不用重生整张图。

## 全组统一要求

把下面这段追加到每条英文提示词末尾：

> Isolated editorial illustration on a truly transparent background (RGBA PNG with alpha, not a checkerboard or white background). Tactile screen-print and cut-paper collage, slightly imperfect ink edges, fine visible paper-fiber grain, restrained 2.5D shapes, warm human scale. Use a coherent limited palette of dusty rose, tomato red, warm orange, butter cream, muted slate blue and sage green, with small areas of charcoal. Keep the main subject centered and fully inside the canvas with generous transparent margin. No readable text, no letters, no logos, no watermark, no border, no card frame, no full-bleed background, no UI screenshot. 1600 × 2000 px, portrait 4:5 composition.

建议输出为 PNG-24 / RGBA。不要让生成器把透明区域画成棋盘格；如果生成器不支持真透明，先选纯色底并告诉我底色，我再按实际素材处理流程接入。

## 01 实习经历：工牌内的小插画

网页里的工牌本体、挂绳、文字和摆动由 Three.js 实时绘制，所以这里只生成卡面上的小型装饰画，不要生成完整工牌。

### BioAZ｜AI 产品与 Agent 工作流

**文件名建议：** `experience/bioaz-workflow.png`

**Prompt**

> A small editorial illustration for an AI product design internship badge: a few translucent laboratory glass forms, tiny data points and a branching workflow made from connected paper-like shapes. The image should suggest careful review and a human hand guiding a system, not futuristic sci-fi. Keep the shapes compact in the middle third so they can sit inside a small vertical badge. Avoid medical organs, DNA helixes, robots and literal interface diagrams.
>
> [追加全组统一要求]

另外两张实习工牌暂时不生成插画，等公司、职位和经历信息确定后再做，避免先把占位内容画成看似真实的公司资产。

## 02 教育经历：三份研究 folio

### 同济大学｜人工智能与数据设计

**文件名建议：** `education/ai-data-design.png`

**Prompt**

> An abstract AI and data design research illustration: three calm clusters of dots, fine lines and translucent geometric paper shapes forming a diagram that feels exploratory and thoughtful. Include one small hand-drawn annotation mark, but absolutely no letters or numbers. It should feel like a study artifact pinned into a graduate research folio, not a corporate technology graphic.
>
> [追加全组统一要求]

### Gamma QGIS｜大学路街道智能体

**文件名建议：** `education/university-road-agents.png`

**Prompt**

> A compact urban field-research illustration about a walkable street and small street agents: a simplified top-down street grid, a single bending route, tiny colored nodes marking moments of activity, and a few cut-paper building and tree silhouettes. Keep it abstract and diagrammatic, with the intimacy of a field notebook. Do not invent readable street names, exact geographic boundaries, or text labels.
>
> [追加全组统一要求]

### 论文与调研｜注释资料页

**文件名建议：** `education/paper-field-notes.png`

**Prompt**

> A small still life of research materials for an academic folio: two overlapping note sheets, one folded corner, a translucent tracing-paper layer, a few pencil underline marks and a tiny abstract chart. Keep all pages blank or marked only with nonverbal strokes; no readable writing. Calm, tactile, personal, collected over time rather than pristine office stationery.
>
> [追加全组统一要求]

## 03 精选作品：三张项目主视觉

### BioAZ Agent Workbench

**文件名建议：** `work/bioaz-agent-workbench.png`

**Prompt**

> A conceptual still life for a human-centered AI agent workbench project: one softly glowing glass vessel, several small paper-like agent nodes connected by thin threads, and one clear path where a person can inspect and redirect the flow. The image should feel careful, legible and warm, with the visual language of a printed design journal. Avoid dashboard panels, charts with labels, code, brain imagery and generic glowing circuits.
>
> [追加全组统一要求]

### KNOCK KNOCK｜Robot with Care

**文件名建议：** `work/knock-knock-care.png`

**Prompt**

> A quiet, playful scene for a companion-robot interaction project: a small rounded handmade robot-like object near a doorway, with a soft lamp glow, one gentle knock motif and generous empty air. Suggest waiting, listening and care without making the robot look like a toy mascot. Use tactile paper-cut silhouettes and a warm pool of light; no faces, no text, no interface elements.
>
> [追加全组统一要求]

### 侨批｜一封侨批，抵达之后

**文件名建议：** `work/qiaopi-letter-routes.png`

**Prompt**

> An archival data-story illustration about an overseas letter arriving home: one aged envelope and a folded letter, crossed by a few delicate route lines with sparse colored data points connecting two distant places. Add subtle postmark-like circles but no real stamps, flags, readable addresses or invented geographic map. Make the correspondence feel intimate and historical while keeping the route visualization clear.
>
> [追加全组统一要求]

## 接入时的目录

生成后可先放到：

```text
study/public/visuals/quick-read/
├─ experience/
│  └─ bioaz-workflow.png
├─ education/
│  ├─ ai-data-design.png
│  ├─ university-road-agents.png
│  └─ paper-field-notes.png
└─ work/
   ├─ bioaz-agent-workbench.png
   ├─ knock-knock-care.png
   └─ qiaopi-letter-routes.png
```

拿到实际生成结果后，我会按透明边缘、裁切安全区、移动端清晰度和现有项目色板逐张检查，再决定哪些进入工牌卡面、研究资料夹和作品海报；当前页面先保留可运行的 CSS / Three.js 占位视觉。
