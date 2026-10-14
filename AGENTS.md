# Prototype Instructions

本项目按用户要求交付可访问的手机H5网页，电脑端保留手机内容比例与活动背景，不模拟原生手机设备外壳。七页草本音浪视觉稿位于同级output/草本音浪全套视觉。规则以Word及设计规范锁定文案为准。活动日期未提供，不编造。所有服务是演示状态，不连接真实登录、社媒核验、审核、发券或支付。

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
