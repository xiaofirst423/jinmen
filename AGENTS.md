# Prototype Instructions

2026-10-16新增手机要求：福利页完整标题“积分任务与福利”保持一行显示，不能被右侧插画挤出末字。手机标题独占整行，插画放上方小字右侧；通过合理字号和留足标题宽度避免溢出，不改标题文案或截断。

本项目交付手机、电脑共用内容与流程的H5。用户2026-10-15最新提供两张参考图，明确“只是参考页面图片使用逻辑，部分图片可复用”，并要求我的页面多一些图片、福利页面参考其配图方式。当前按“草本图像版”实施，最新反馈优先于前轮深绿积分/乐迷卡约束；借鉴配图角色，不照搬参考图密度、余额、审核状态或全部布局。首页继续沿用已确认的一体营销海报折中方案。采用自然页面滚动，900px以上最大宽1120px并适度分栏；不保留模拟手机外壳、电脑两侧说明或演示控制。规则以Word及设计规范锁定文案为准，活动日期未提供，不编造。所有服务为浏览器本地演示，不连接真实登录、社媒核验、审核、发券或支付；可通过已授权GitHub Pages公开访问。

导航始终为“首页 / 福利 / 我的”；内页使用吸顶文字“返回首页”。首页开箱为主入口，恢复话题复制、金色基础券卡和独立现场照片；返场与搭子仍放入“更多玩法”，不恢复密集四格入口。开箱先指南、基础奖励、表单，再按需展开奖励阶梯与榜单。福利优先积分、签到、任务与兑换；我的优先奖励与参与记录。米白、深绿、浅草本绿、暖金奖励，首页深绿圆角主按钮允许少量青柠强调；题字使用本地霞鹜文楷子集并保留OFL；正文16px/400，辅助14px，主按钮16px/500、卡片小操作14px/500，交互命中区域至少44px；下方模块手机留白24px，360px以下16px；动效160–240ms且遵循减少动态偏好。

福利和我的使用草本音符大页头；积分/身份卡改为浅草本底并配花叶点缀，增加独立签到插画与金币，兑换卡分别使用券、扇子、礼盒、门票四类商品艺术。我的参与记录使用现场、手持音符、搭子比心三类独立缩略图，不重复用同一裁切图充当所有内容。素材在`public/assets/illustrated/`，允许复用已有独立图片，原`inner/`与原始海报素材保留不动；图片为活动示意，不保证最终实物包装。保留当前select筛选、积分/作品/奖励三统计及宽松响应式，新增样式限定内页，不改首页、业务或存储。零待领取仍区分从未获奖与已全部领取，全部领取时“好礼已收好”直达记录。新证据放`qa/illustrated/`；`qa/inner/`为前轮内页焕新版历史证据。

内页复验使用`node scripts/inner-check.mjs`，通过`QA_BASE`指定待测HTTP来源（默认`http://127.0.0.1:4188/`），通过`INNER_QA_DIR`指定输出目录（默认`qa/inner`）；本轮须设置`INNER_QA_DIR=qa/illustrated`，不覆写历史内页证据。复用隔离Chrome调试会话，不并行执行共享浏览器检查。脚本会写入测试数据并恢复初始态，只用于隔离测试来源。六类专用检查覆盖明细与焦点、任务入口及筛选、签到/兑换/统计同步、全空/全领取、长标题/图片/六宽度截图，并断言三条样例记录使用三种独立封面。整体回归仍运行`browser-check.mjs`与`built-check.mjs`；本轮最终证据在`qa/illustrated/`，验收范围见`design-qa.md`。后续修改须重新验证，不能借用旧版本通过结论。

首页营销海报`public/assets/campaign-hero.png`从`reference-home.png`原图提取区域(0,0,853,800)，仅包含原品牌logo、醒目主标题、草本乐器、天津舞台与开箱标签，不包含原图按钮；素材SHA256为`ebceb8dbd056cf6ceea6bfa8c3a48221ae4d8ddd922a8c640129d8f9bd10ded2`。用户允许海报内原有标题与logo，不额外重复一套大标题。该853×800营销海报完整按比例显示，禁止拉伸、再次裁切、渐隐mask、降低opacity、滤镜或混合模式改色。手机海报下放真实可点CTA与话题复制（剪贴板不可用时提供可选中文本）；电脑左侧招募文案和真实按钮、右侧完整营销海报。金券卡插画左边缘允许轻过渡，不作用于营销海报；现场照片使用独立素材，不再裁整页图。原`public/assets/herbal-stage.png`（1271×1238，SHA256 `0c0e44ee4fd872b6ab10cde2506b52173d70b49eb8a13068820f1c70d6087a04`）保留不动。`qa/poster/`、`qa/blend/`和`qa/inner/`为此前版本历史证据；本轮图像版实证在`qa/illustrated/`，全站报告和`qa/after/`的实际版本以`design-qa.md`为准。

模型接口保持{ state, message }。三类合法投稿提交一次即通过并发放符合条件的基础奖励，点赞收藏均从0开始，不伪造高阶奖励。沿用jinmen-herbal-holiday-v1存储键，数据version=2；旧待审/拒绝记录一次转为通过，按发奖标记、奖励ID、积分明细ID防重。原360分及示例权益保留。周上限500、每日互动10、发布/点赞/收藏每周次数、兑换100/300/600/800及满减券14天规则不变。800仅抽奖资格，不因新增门票图片而承诺中奖。无法保存时必须明确提示。用户已于2026-10-15授权公开仓库`xiaofirst423/jinmen`及GitHub Pages发布，本轮草本图像版继承更新授权，无需重复确认。由`main`分支Actions部署，正式目标为`https://xiaofirst423.github.io/jinmen/`；origin指向该仓库，旧仓库仅保留为legacy远程。本轮精确提交、Actions及线上核验记录随交付包提供于`qa/illustrated/deployment.json`，不预写尚未发生的发布成功或run ID。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
