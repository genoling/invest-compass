---
name: invest-compass-debug
description: >
  启动智投罗盘（InvestCompass）本地开发服务器以进行调试、预览和问题排查。
  当用户想要"启动项目"、"本地调试"、"dev server"、"debug"、"预览"、"构建验证"、"看下效果"、"跑起来"时触发。
  服务器运行在 http://localhost:3000，所有业务模块均使用 Mock 数据运行，无需 Firebase API 密钥即可完整调试。
---

# 智投罗盘（InvestCompass）— 本地调试指南

## 用途

快速启动 **智投罗盘** Vite 开发服务器，在本地进行全功能调试与预览。
所有业务模块（实时资讯、投资目标、AI 决策、知识学习）均内置 Mock 数据，
**无需 Firebase 凭据、无需金融数据 API 密钥**即可完整运行。

## 触发条件

当用户有以下意图时触发本技能：
- 启动本地开发服务器以预览/调试项目
- 在浏览器中打开查看页面效果
- 进行构建验证或修复构建错误
- 排查 TypeScript 类型错误
- 调试特定业务模块（资讯/目标/AI/学习）

## 使用方式

### 1. 启动开发服务器

```powershell
cd e:\ai_project\invest_compass\invest-compass
npm run dev
```

服务器将在 `http://localhost:3000` 启动，
支持 **热更新（HMR）**，修改代码后页面自动刷新。

### 2. 验证生产构建

```powershell
cd e:\ai_project\invest_compass\invest-compass
npm run build
```

构建成功后，可以用以下命令预览生产版本：

```powershell
npx serve dist -p 3000
```

或直接启动 Vite 预览模式：

```powershell
npx vite preview --port 3000
```

### 3. TypeScript 类型检查

```powershell
cd e:\ai_project\invest_compass\invest-compass
npx tsc --noEmit
```

## 项目模块入口

| 模块 | 路由 | 主要文件 |
|------|------|----------|
| 资产大盘 | `/dashboard` | `src/app/dashboard/page.tsx` |
| 实时资讯 | `/news` | `src/app/news/page.tsx` |
| 投资目标 | `/goals` | `src/app/goals/page.tsx` |
| AI 决策 | `/ai-advisor` | `src/app/ai-advisor/page.tsx` |
| 知识学习 | `/learn` | `src/app/learn/page.tsx` |

## Mock 数据位置

所有业务数据均封装在 `src/lib/mock/` 目录下：

| 模块 | Mock 文件 | 数据内容 |
|------|-----------|----------|
| 行情 | `mock/news.ts` | 8 只股票/加密货币行情，3 秒自动刷新模拟 |
| 资讯 | `mock/news.ts` | 6 条分类资讯（宏观/行业/公司/市场） |
| 目标 | `mock/goal.ts` | 2 个投资目标（含配置比例、进度、再平衡建议） |
| 持仓 | `mock/goal.ts` | 7 条持仓记录（含盈亏计算） |
| AI | `mock/ai.ts` | 2 条分析记录（含四维度分析 + 操作建议） |
| 知识 | `mock/knowledge.ts` | 6 篇知识内容（6 大分类覆盖） |
| 进度 | `mock/knowledge.ts` | 3 条学习进度记录 |

## 常见调试场景

### 场景一：只想调试某个模块

直接在浏览器访问对应的路由即可，无需登录。所有页面通过 React.lazy() 按需加载。

### 场景二：修改 Mock 数据

编辑对应的 `src/lib/mock/*.ts` 文件，保存后页面自动热更新。

**数据格式定义位置：**
- 行情资讯：`src/lib/types/news.ts`
- 投资目标：`src/lib/types/goal.ts`
- AI 分析：`src/lib/types/ai.ts`
- 知识学习：`src/lib/types/knowledge.ts`

### 场景三：构建失败排查

1. 先运行 TypeScript 检查确认无类型错误：
   ```powershell
   npx tsc --noEmit
   ```
2. 查看具体错误信息：
   ```powershell
   npm run build 2>&1
   ```
3. 常见构建错误：
   - **ESM/CJS 混用**：`require()` 在 ESM 项目中会失败，改 `import`
   - **Tailwind 类名拼写**：`@apply` 中的类名必须是 Tailwind 内置或已在配置中定义的
   - **路径别名**：确保 `@/` 在 `vite.config.ts` 和 `tsconfig.json` 的 `paths` 中都有配置

### 场景四：查看页面响应式效果

调整浏览器窗口宽度即可测试：
- **lg（1024px+）**：左侧 Sidebar 导航
- **sm-lg（640-1023px）**：隐藏 Sidebar，底部 MobileNav
- **<640px**：单列布局，底部 MobileNav

### 场景五：数据流追踪

所有模块的数据遵循相同的层级结构：
```
页面 (src/app/*/page.tsx)
  → 组件 (src/components/*/)
    → Mock 数据 (src/lib/mock/*.ts)
      → 类型定义 (src/lib/types/*.ts)
```

后续接入真实 Firebase 时，只需将 Mock 数据替换为 Firestore 查询调用，
组件和页面逻辑无需改动。

## 调试技巧

- **查看实时行情模拟**：在资讯页面，行情跑马灯每 3 秒自动刷新一次价格，点击"刷新行情"按钮可手动强制刷新
- **测试投资目标创建**：在目标页面点击"新建目标"，填写表单后会自动生成带默认配置比例的新目标
- **模拟 AI 分析**：在 AI 决策页面点击"发起分析"，会展示 2 秒的加载动画（模拟分析耗时），然后显示已有分析结果
- **知识学习进度**：部分知识内容标记为"已完成"或"学习中"，进度统计在页面右上角展示
- **Console 日志**：打开浏览器 DevTools（F12）→ Console，可查看 Firebase 初始化状态和组件渲染信息
- **查看构建产物**：`dist/` 目录下的 JS 文件按路由拆分，可在浏览器 Network 面板观察按需加载效果
