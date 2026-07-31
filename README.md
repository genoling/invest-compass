<div align="center">

# 🧭 智投罗盘 | InvestCompass

**AI 辅助的个人投资决策与资产管理平台**

<br />

</div>

## 项目简介

智投罗盘是一套聚焦个人投资理念落地、覆盖 **行情获取 — 目标执行 — 决策辅助 — 知识支撑** 完整闭环的轻量级投资决策与资产管理 MVP。

核心目标是将用户的投资理念（资产配置、趋势选股、定投策略等）转化为产品可执行的逻辑，提供从目标设定到操作建议的全流程支持。

## 技术栈

| 类别 | 技术 |
|------|------|
| **前端框架** | React 18 + TypeScript + Vite |
| **路由** | React Router DOM 7.x |
| **样式** | Tailwind CSS 3.x + tailwindcss-animate |
| **组件化** | shadcn/ui (Radix UI 原语) |
| **图表** | Recharts 2.x（饼图/折线图/组合图）|
| **表单** | React Hook Form 7.x + Zod 3.x |
| **后端** | Firebase（Firestore / Cloud Functions / Hosting）|
| **AI** | Firebase AI Logic (Gemini Pro) — 待接入 |
| **图标** | Lucide React |

## 功能模块

| 页面 | 路由 | 功能 |
|------|------|------|
| **资产大盘** | `/dashboard` | 总资产、盈亏、目标完成度、再平衡预警、快捷入口 |
| **实时资讯** | `/news` | 行情跑马灯（3s自动刷新）、分类/关键词筛选、无限滚动、K线图 |
| **投资目标** | `/goals` | 目标创建（表单+Zod校验）、持仓管理、进度追踪、再平衡建议、操作历史 |
| **AI 决策** | `/ai-advisor` | 四维度分析（情绪/技术面/基本面/风险）、操作建议、参数控制 |
| **知识学习** | `/learn` | 6大分类、难度筛选、搜索、进度统计、全文阅读 |

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选，Mock 数据无需也可运行）
cp .env.local.example .env.local
# 编辑 .env.local 填入你的 Firebase / Finnhub / Alpha Vantage 密钥

# 3. 启动开发服务器
npm run dev

# 4. 浏览器打开
open http://localhost:3000
```

## 项目结构

```
invest-compass/
├── public/                  # 静态资源（favicon.svg）
├── src/
│   ├── app/                 # 路由页面（5个模块）
│   ├── components/          # 业务组件（17个）
│   │   ├── layout/          # Header, Sidebar, Footer, MobileNav
│   │   ├── dashboard/       # StatCard, AssetAllocationChart
│   │   ├── news/            # MarketTicker, NewsCard, NewsList, NewsFilterBar, NewsDetail, KLineChart
│   │   └── goals/           # GoalCard, GoalDetail, GoalForm, HoldingTable, RebalanceCard
│   ├── lib/
│   │   ├── types/           # TypeScript 类型定义（4个模块）
│   │   ├── mock/            # Mock 数据（4个模块，零API依赖）
│   │   ├── firebase/        # Firestore 延迟初始化
│   │   └── utils.ts         # cn() 工具函数
│   ├── App.tsx              # 路由定义 + Code Splitting
│   ├── main.tsx             # 入口
│   └── index.css            # Tailwind + CSS 变量（深蓝金融主题）
├── dist/                    # 构建产出（按需加载）
├── .firebaserc              # Firebase 项目配置
├── firebase.json            # Firebase Hosting + Rewrites
├── firestore.rules          # 数据库安全规则
└── firestore.indexes.json   # 索引配置
```

## 构建与部署

```bash
# 生产构建
npm run build

# TypeScript 类型检查
npx tsc --noEmit

# 部署到 Firebase
npx firebase deploy

# 访问地址
# https://invest-compass-dev.web.app
```

## Mock 数据说明

所有业务模块均内置完整 Mock 数据，无需 Firebase 或金融 API 密钥即可运行：

| 模块 | 数据量 | 模拟效果 |
|------|--------|----------|
| 行情报价 | 8 个品种 | 每 3 秒随机波动 |
| 资讯 | 6 条 | 宏观/行业/公司/市场分类 |
| 投资目标 | 2 个 | 含配置比例/进度/再平衡建议 |
| 持仓 | 7 条 | 含盈亏计算 |
| AI 分析 | 2 条 | 四维度 + 操作建议 |
| 知识 | 6 篇 | 6 大分类覆盖 |
| 学习进度 | 3 条 | 已完成/学习中状态 |

## 设计原则

- **MVP 优先**：只保留验证投资理念可行的核心功能，非必需功能延后
- **组件驱动**：通用组件与业务组件分离，结构清晰
- **按需加载**：React.lazy() 路由懒加载，首屏仅加载共享框架
- **响应式**：桌面（Sidebar）→ 平板 → 移动（底部导航）全适配
- **类型安全**：全 TypeScript，数据层有完整类型定义

## 后续规划

- [ ] 接入真实 Firebase Firestore / Cloud Functions
- [ ] 接入 Finnhub + Alpha Vantage 金融数据 API
- [ ] 接入 Gemini Pro (Firebase AI Logic) 真实 AI 分析
- [ ] 支付模块 (Stripe) 集成
- [ ] GitHub CI/CD + 飞书文档同步

## 免责声明

本系统仅供学习参考，所有分析结果不构成投资建议。投资有风险，决策需谨慎。
