# Prototype Instructions

本项目交付手机、电脑共用内容与流程的H5。用户2026-10-15最新要求福利与我的页面重做视觉，匹配首页的草本音乐活动风格，不再使用此前极简布局；首页继续沿用已确认的“原版一体营销海报＋清雅宽松下方模块”折中方案。采用自然页面滚动，900px以上最大宽1120px并适度分栏；不保留模拟手机外壳、电脑两侧说明或演示控制。规则以Word及设计规范锁定文案为准，活动日期未提供，不编造。所有服务为浏览器本地演示，不连接真实登录、社媒核验、审核、发券或支付；本地演示业务可通过已授权GitHub Pages公开访问。

导航始终为“首页 / 福利 / 我的”；内页使用吸顶文字“返回首页”。首页开箱为主入口，恢复话题复制、金色基础券卡和独立现场照片；返场与搭子仍放入“更多玩法”，不恢复密集四格入口。开箱先指南、基础奖励、表单，再按需展开奖励阶梯与榜单。福利优先积分、签到、任务与兑换；我的优先奖励与参与记录。米白、深绿、浅草本绿、暖金奖励，首页深绿圆角主按钮允许少量青柠强调；题字使用本地霞鹜文楷子集并保留OFL；正文16px/400，辅助14px，主按钮16px/500、卡片小操作14px/500，交互命中区域至少44px；下方模块手机留白24px，360px以下16px；动效160–240ms且遵循减少动态偏好。

福利页面使用草本乐器页头、深绿积分卡和暖金签到卡、带图标的任务卡、带独立商品插画的兑换卡。我的页面使用草本页头、深绿乐迷卡、积分/作品/奖励三项统计、金色奖励卡和图文参与记录；恢复可识别的卡片分组与活动氛围，同时保持常规字重和清楚留白。零待领取须区分从未获奖与已全部领取，全部领取时显示“好礼已收好”并直达领取记录。独立素材在`public/assets/inner/`（券、扇子、礼盒、草本乐器），来源与限制见其README；是奖品示意插画，不保证最终实物包装。新增样式在`src/inner-pages.css`并限定福利/我的作用域，不改首页、业务规则或存储。新证据放`qa/inner/`，`qa/blend/`为首页折中版已有证据。

内页复验使用`node scripts/inner-check.mjs`，通过`QA_BASE`指定待测HTTP来源（默认`http://127.0.0.1:4188/`），复用隔离Chrome调试会话；不要并行执行共享浏览器检查。脚本会写入示例/空状态等测试数据并恢复初始态，只用于隔离测试来源。六类专用检查覆盖明细与焦点、任务入口及筛选、签到/周进度/兑换/统计同步、全空状态、全部领取直达记录、长标题/图片/六宽度截图。结果为`qa/inner/check.json`及两页×六宽度×首屏/下方共24张截图；整体回归仍运行`browser-check.mjs`与`built-check.mjs`，最终目视和本轮发布结果见`design-qa.md`。

首页营销海报`public/assets/campaign-hero.png`从`reference-home.png`原图提取区域(0,0,853,800)，仅包含原品牌logo、醒目主标题、草本乐器、天津舞台与开箱标签，不包含原图按钮；素材SHA256为`ebceb8dbd056cf6ceea6bfa8c3a48221ae4d8ddd922a8c640129d8f9bd10ded2`。用户最新反馈允许海报内原有标题与logo；撤销此前“所有标题必须图外”的约束，不再额外重复一套大标题。该853×800营销海报完整按比例显示，禁止拉伸、再次裁切、渐隐mask、降低opacity、滤镜或混合模式改色。手机海报下放真实可点CTA与话题复制（剪贴板不可用时提供可选中文本）；电脑左侧招募文案和真实按钮、右侧完整营销海报。金券卡插画左边缘允许轻过渡，不作用于营销海报；现场照片使用独立素材，不再裁整页图。原`public/assets/herbal-stage.png`（1271×1238，SHA256 `0c0e44ee4fd872b6ab10cde2506b52173d70b49eb8a13068820f1c70d6087a04`）保留不动。`qa/poster/`和`qa/blend/`为此前版本的历史证据；本轮全站复验在`qa/after/`及浏览器报告，内页专用实证在`qa/inner/`，验收范围见`design-qa.md`。后续改动仍须重新截图与复验。

模型接口保持{ state, message }。三类合法投稿提交一次即通过并发放符合条件的基础奖励，点赞收藏均从0开始，不伪造高阶奖励。沿用jinmen-herbal-holiday-v1存储键，数据version=2；旧待审/拒绝记录一次转为通过，按发奖标记、奖励ID、积分明细ID防重。原360分及示例权益保留。周上限500、每日互动10、发布/点赞/收藏每周次数、兑换100/300/600/800及满减券14天规则不变。800仅抽奖资格。无法保存时必须明确提示。用户已于2026-10-15授权公开仓库`xiaofirst423/jinmen`及GitHub Pages发布，本轮内页焕新继承该更新授权；无需重复确认推送或发布。由`main`分支Actions部署，正式目标为`https://xiaofirst423.github.io/jinmen/`；origin指向该仓库，旧仓库仅保留为legacy远程。本轮精确提交、Actions结果及线上核验记录随交付包提供于`qa/inner/deployment.json`，不在文档中预写未发生的发布成功或run ID。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
