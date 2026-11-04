# Four Hearts — Executive Audit

日期：2026-11-04

范围：`study/` 本地工作树、线上 Index 的只读浏览器走查、用户提供的 `FourHearts_MonoColor_Art_Direction.zip`。

## 结论

Four Hearts 已有清晰的作者身份：四叶草主题导航、作品画布与可探索的 3D Room 形成了同一套个人叙事。当前改造保留这套结构，修正作品封面与项目的错误关联，并修复从 Selected Works 打开详情后内容落在视口之外的问题。

**Confirmed — 线上基线：**从 Selected Works 点击 BioAZ 后，URL 变成项目路由，但嵌套滚动容器仍停留在旧位置；项目详情整体跑到可视区上方，焦点落回 body，标题未跟随项目变化。

**Confirmed — 本地修复：**详情滚到阅读起点并接收焦点；返回恢复原滚动与卡片焦点；URL、标题、详情一致；Back / Forward 与刷新均可恢复项目路由。

素材包中的插画适合作为项目封面和详情页的概念艺术，不能当作实际界面截图、研究结果或项目交付。七个项目已各自配对横幅与详情插画，并在详情中明确标记概念图。四叶草品牌标记素材没有覆盖功能性 Heartwheel。

## 已完成

- 更正七个作品的视觉关联：BioAZ、Knock Knock、侨批、meow gallery、Film shelf、镜子的两面、Healther。
- 修正 Project Detail 图片高度比例，避免 1600×1000 图片被显示成 474×1000。
- 修复项目打开、标题同步、详情焦点、返回滚动/焦点恢复和浏览器历史。
- 修复 Heartwheel 的 pointer-cancel 路径：取消手势回到原旋转，不提交新主题。
- 移除首页重复的专业方向短语；移动端缩短首屏占用。
- 新增真实 Edge/CDP 回归脚本与截图、报告。

## 验证摘要

- `npm run lint`：通过。
- `npm run test:heartwheel`：通过。
- `npm run test:room-reveal`：通过。
- `npm run build`：通过；RoomScene 仍有 1,384 KB minified chunk 的 Vite 警告，见 [REMAINING-ISSUES.md](REMAINING-ISSUES.md)。
- Edge/CDP：18 项 Index/作品路径检查、20 项 Room 路径检查通过；390×844 无水平溢出。
- 图片资源：14 个引用均以 `image/png`、HTTP 200 加载。

## 尚需作者材料

项目详情现在只呈现现有标题、摘要、年份、状态和真实链接。当前资料没有充分说明作者承担的具体工作、设计决策、过程证据或可核验结果，因此没有补写这些内容。Room 内的书单和海报等内容仍含源码中的占位说明，详见 [REMAINING-ISSUES.md](REMAINING-ISSUES.md)。

## 证据

- [Before 首页截图（1440×900）](before-index-1440x900.png)
- [After 首页截图（1440×900）](evidence/after-final/index-overview-1440x900.png)
- [Selected Works 打开详情](evidence/after-final/project-detail-from-selected-works-1440x900.png)
- [直达项目 URL 刷新](evidence/after-final/direct-project-route-1440x900.png)
- [Room（1280×800，日间状态）](evidence/after-final/room-overview-1280x800.png)
- [Mobile（390×844）](evidence/after-final/index-mobile-390x844.png)
- [Index / project 浏览器报告](evidence/after-final/navigation-report.json)
- [Room 浏览器报告](evidence/after-final/room-navigation-report.json)

诊断分类与证据边界见 [CODE-AUDIT.md](CODE-AUDIT.md) 和 [REMAINING-ISSUES.md](REMAINING-ISSUES.md)。
