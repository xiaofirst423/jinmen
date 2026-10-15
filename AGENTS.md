# Prototype Instructions

本项目交付手机、电脑共用内容与流程的H5。用户2026-10-15最新决定采用“原版一体营销海报＋清雅宽松下方模块”的折中方案；首页以其新提供截图（与`reference-home.png`相同）及本文件约束为准，替代前一版外置文楷大标题布局。采用自然页面滚动，900px以上最大宽1120px并适度分栏；不保留模拟手机外壳、电脑两侧说明或演示控制。规则以Word及设计规范锁定文案为准，活动日期未提供，不编造。所有服务为本地演示，不连接真实登录、社媒核验、审核、发券或支付。

导航始终为“首页 / 福利 / 我的”；内页使用吸顶文字“返回首页”。首页开箱为主入口，恢复话题复制、金色基础券卡和独立现场照片；返场与搭子仍放入“更多玩法”，不恢复密集四格入口。开箱先指南、基础奖励、表单，再按需展开奖励阶梯与榜单。福利优先积分、签到、任务与兑换；我的优先奖励与参与记录。米白、深绿、浅草本绿、暖金奖励，首页深绿圆角主按钮允许少量青柠强调；题字使用本地霞鹜文楷子集并保留OFL；正文16px/400，辅助14px，按钮16px/500；下方模块手机留白24px，360px以下16px；动效160–240ms且遵循减少动态偏好。

首页营销海报`public/assets/campaign-hero.png`从`reference-home.png`原图提取区域(0,0,853,800)，仅包含原品牌logo、醒目主标题、草本乐器、天津舞台与开箱标签，不包含原图按钮；素材SHA256为`ebceb8dbd056cf6ceea6bfa8c3a48221ae4d8ddd922a8c640129d8f9bd10ded2`。用户最新反馈允许海报内原有标题与logo；撤销此前“所有标题必须图外”的约束，不再额外重复一套大标题。该853×800营销海报完整按比例显示，禁止拉伸、再次裁切、渐隐mask、降低opacity、滤镜或混合模式改色。手机海报下放真实可点CTA与话题复制（剪贴板不可用时提供可选中文本）；电脑左侧招募文案和真实按钮、右侧完整营销海报。金券卡插画左边缘允许轻过渡，不作用于营销海报；现场照片使用独立素材，不再裁整页图。原`public/assets/herbal-stage.png`（1271×1238，SHA256 `0c0e44ee4fd872b6ab10cde2506b52173d70b49eb8a13068820f1c70d6087a04`）保留不动。`qa/poster/`为前一版历史证据，本轮实证在`qa/blend/`，验收范围见`design-qa.md`；后续改动仍须重新截图与复验。

模型接口保持{ state, message }。三类合法投稿提交一次即通过并发放符合条件的基础奖励，点赞收藏均从0开始，不伪造高阶奖励。沿用jinmen-herbal-holiday-v1存储键，数据version=2；旧待审/拒绝记录一次转为通过，按发奖标记、奖励ID、积分明细ID防重。原360分及示例权益保留。周上限500、每日互动10、发布/点赞/收藏每周次数、兑换100/300/600/800及满减券14天规则不变。800仅抽奖资格。无法保存时必须明确提示。用户已于2026-10-15明确授权创建公开仓库`xiaofirst423/jinmen`并用GitHub Pages部署当前折中版；本轮推送及发布属于已授权范围。正式发布目标为`https://xiaofirst423.github.io/jinmen/`，origin指向新仓库，旧仓库仅保留为legacy远程。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
