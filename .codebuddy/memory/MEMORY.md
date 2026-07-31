# 项目记忆：智投罗盘 InvestCompass

## 项目概要
智投罗盘（InvestCompass）是一套聚焦个人投资理念落地、覆盖"行情获取 - 目标执行 - 决策辅助 - 知识支撑"完整闭环的轻量级投资决策与资产管理 MVP。

## 技术栈
- **前端**：React 18 + TypeScript + Vite + React Router DOM
- **样式**：Tailwind CSS 3.x（金融稳重型蓝白系）+ Recharts（图表）
- **后端**：Firebase（Firestore 数据库 + Cloud Functions）
- **AI**：Firebase AI Logic（Gemini Pro 模型）
- **金融数据**：Finnhub + Alpha Vantage
- **开发工具**：CodeBuddy + VS Code

## 项目结构
```
invest-compass/
├── src/
│   ├── app/           # 路由页面（dashboard, news, goals, ai-advisor, learn）
│   ├── components/    # 业务组件（layout/, dashboard/）
│   ├── lib/           # 工具封装（firebase/, utils.ts）
│   ├── main.tsx       # 入口
│   └── App.tsx        # 路由定义
├── tailwind.config.ts # 主题配置
├── vite.config.ts     # 构建配置（含 @ 别名）
└── .env.local         # 环境变量（API 密钥）
```

## 已知约定
- 无用户认证（个人使用，不需要登录）
- 支付模块延后（Stripe 非 MVP 核心）
- 用 Firestore 而非 Realtime Database
- 路径别名 `@/` 指向 `src/`
- `npm run build` 验证通过后才能提交
- MVP 原则：先跑通核心流程，不追求功能完备
