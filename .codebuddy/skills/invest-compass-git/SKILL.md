---
name: invest-compass-git
description: >
  智投罗盘（InvestCompass）项目专用 Git 提交流程，遵循 Conventional Commits 规范。
  提交前自动执行构建验证（npm run build），确保代码质量。
  当用户提到"提交"、"commit"、"推送"、"push"、"上传到github"、"git提交"、"保存到仓库"、"上线"时触发。
---

# 智投罗盘 — Git 提交与部署

## 概述

提供结构化的 Git 提交流程，遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。
流程：分析变更 → 暂存文件 → 构建验证 → 生成提交信息 → 提交 → 推送到远程。

## 触发条件

当用户表达以下意图时触发本技能：
- 提交代码："提交代码"、"commit"、"git commit"、"保存改动"
- 推送到远程："推送"、"push"、"上传到 GitHub"、"推到远程"
- 组合意图："提交并推送"、"提交代码到 GitHub"

## 项目信息

| 项目 | 值 |
|------|-----|
| 项目名 | invest-compass（智投罗盘） |
| 项目路径 | `e:\ai_project\invest_compass\invest-compass` |
| 远程仓库 | `https://github.com/genoling/invest-compass` |
| 构建命令 | `npm run build` |
| 类型检查 | `npx tsc --noEmit` |
| 技术栈 | React 18 + TypeScript + Vite + Firebase |

## 项目目录规范

提交前须确保文件在正确目录中：

```
invest-compass/
├── src/              # 📁 前端业务源码
├── public/           # 📁 静态资源
├── docs/             # 📁 项目文档
├── firebase/         # 📁 Firebase 配置（firestore.rules, .indexes.json）
├── config/           # 📁 所有工具配置文件
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── firebase.json
│   ├── .firebaserc
│   ├── .eslintrc.cjs
│   └── tsconfig.node.json
├── .codebuddy/       # 📁 CodeBuddy Skills + Memory
├── package.json      # 📄 npm 依赖（必须根目录）
├── index.html        # 📄 入口 HTML（必须根目录）
├── .gitignore        # 📄 Git 忽略规则（必须根目录）
├── .env.local        # 📄 环境变量（**不提交**）
└── README.md         # 📄 项目说明
```

**整理规则：**
- 临时文件（`*.log`、`*.bat`、测试脚本）→ 删除
- 工具配置（eslint/ts/vite/tailwind/firebase）→ `config/`
- 项目文档 → `docs/`
- Firebase 数据配置 → `firebase/`
- 仅 3 个文件必须留在根目录：`package.json`、`index.html`、`.gitignore`

**⚠️ 目录重构后必做检查：**
1. `vite.config.ts` 中 `root: path.resolve(__dirname, "..")` 指向项目根
2. `css.postcss.plugins` 显式传入 `tailwindcss({ config: TAILWIND_CONFIG })`
3. `tailwind.config.ts` 的 `content` 用 `./index.html` 和 `./src/**/*.{ts,tsx}`（相对 cwd）
4. `npm run build` 验证 CSS 大小在 20+ kB（否则 Tailwind 没生效）

---

## 工作流

必须严格按照以下步骤顺序执行，不可省略任何步骤。

---

### 步骤 0：代码整理（可选）

如果用户要求"整理代码"、"先整理再提交"，执行：

#### 0.1 扫描并清理临时文件

**推荐用清理脚本（避免 IDE 命令确认拦截）：**
```bash
cd e:\ai_project\invest_compass\invest-compass
# 预览将清理的文件
python .codebuddy/skills/invest-compass-feishu/scripts/cleanup_tmp.py --dry-run
# 实际清理
python .codebuddy/skills/invest-compass-feishu/scripts/cleanup_tmp.py
```

脚本自动清理：
- 根目录临时输出（`*.log`、`bt_output.txt`、`build_output.txt`、`*.tsbuildinfo`、`error.log`）
- skill 脚本目录的临时测试脚本（`test_*.py`、`debug_*.py`、`check_*.py`、`fix_*.py`、`*.bat`）

**备选（手动）**，仅当脚本不覆盖时才用：
```bash
dir /s *.py *.bat *.log *.txt 2>nul | findstr /v "node_modules" | findstr /v "\.git"
```
- 调试测试脚本（`test_*.py`、`debug_*.py`、`cleanup*.py`、`check_*.py`）
- 临时脚本（`*.bat`、`auth_token.bat`）
- 临时输出（`*_output.log`、`bt_output.txt`、`error.log`）

#### 0.2 检查文件是否在正确目录

对照项目目录规范，将散落的文件移入对应目录：
- `docs/`：开发方案等文档
- `firebase/`：`firestore.rules`、`firestore.indexes.json`
- 移动后更新引用路径（如 `firebase.json` 中的 rules/indexes 路径）

#### 0.3 向用户报告整理结果

列出：删除的文件、移动的文件、更新的引用路径。

---

### 步骤 1：分析当前仓库状态

```bash
cd e:\ai_project\invest_compass\invest-compass
git status
git diff --stat
git diff --cached --stat
```

将结果以清晰格式呈现给用户：

```
📋 当前分支: main
📝 未暂存修改: X 个文件
📄 未跟踪文件: X 个文件
```

---

### 步骤 2：交互式暂存文件

使用 `ask_followup_question` 工具让用户选择暂存方式：

**选项 A：暂存全部** — `git add -A`
**选项 B：按文件多选** — 列出每个变更文件
**选项 C：按目录暂存** — 用户输入 glob 模式

关键规则：
- 绝不未经用户确认就暂存文件
- 暂存后用 `git diff --cached --stat` 确认待提交内容
- 如需取消暂存，使用 `git restore --staged <file>`

---

### 步骤 3：构建验证（质量门禁）

暂存完成后，**提交前必须执行构建验证**：

```bash
cd e:\ai_project\invest_compass\invest-compass
npm run build
```

- **构建成功** → 继续步骤 4
- **构建失败** → 提示用户修复错误，中止提交流程
- 类型检查：`npx tsc --noEmit`

> 这是本项目特有的质量门禁：`npm run build` 不通过就不允许提交。

---

### 步骤 4：生成提交信息

按 **Conventional Commits** 规范生成。

#### 4.1 格式

```
<type>(<scope>): <简短描述>

<body 正文（可选）>

<footer 脚注（可选）>
```

#### 4.2 Type 类型

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档变更 |
| `style` | 代码风格调整 |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `chore` | 构建/依赖/工具链 |

#### 4.3 Scope 范围（本项目模块）

| Scope | 对应模块 |
|-------|----------|
| `dashboard` | 资产大盘 |
| `news` | 实时资讯 |
| `goals` | 投资目标 |
| `ai-advisor` | AI 决策 |
| `learn` | 知识学习 |
| `ui` | 布局/UI 组件 |
| `firebase` | Firebase 配置 |
| `feishu` | 飞书文档/Skill |
| `skill` | CodeBuddy Skill |
| `config` | 构建/工具配置 |
| `*` | 跨模块 |

#### 4.4 信息生成流程

1. 分析已暂存的 diff，理解变更内容
2. 确定主要 type 和 scope
3. 撰写简洁描述（祈使语气，现在时）
4. 如涉及多个关注点，用 body 逐项说明
5. 呈现给用户审阅

**提交信息示例：**

```
feat(news): 添加 K线图组件

支持 1min/5min/15min 时间维度切换，
包含成交量柱和伪K线实体展示。
```

```
fix(goals): 修复目标详情页持仓数据未更新

持仓列表在切换 tab 后未重新读取最新数据，
导致盈亏计算显示旧值。
```

```
chore(*): 配置 Firebase Hosting 部署

添加 firebase.json 和 .firebaserc，
配置 SPA rewrites 和缓存策略。
```

#### 4.5 用户确认

使用 `ask_followup_question` 让用户选择：
- **接受** → 自动执行 commit + push
- **修改** → 修改 type/scope/description
- **取消** → 中止提交

---

### 步骤 5：执行提交

确认后立即自动执行：

```bash
cd e:\ai_project\invest_compass\invest-compass
git commit -m "<type>(<scope>): <description>"
```

**自动容错：**
- 如因 `Author identity unknown` 失败，自动配置：
  ```
  git config user.name "genoling"
  git config user.email "youareabeautifulstar@gmail.com"
  ```
  然后自动重试 commit。
- 提交后用 `git log -1 --oneline` 确认结果

**提交成功后立即进入步骤 6，不等待用户确认。**

---

### 步骤 6：自动推送

提交成功后直接自动推送：

```bash
git push origin <current-branch>
```

**自动决策：**
- 若无远程仓库 → 自动配置：`git remote add origin https://github.com/genoling/invest-compass`
- 若落后于远程 → `git pull --rebase` 后再 push
- 若产生冲突 → 暂停提示手动解决
- 绝不使用 `--force`

---

### 步骤 7：上线部署（可选）

如果用户有部署意图，推送后可询问是否部署到 Firebase Hosting：

```bash
cd e:\ai_project\invest_compass\invest-compass
npx firebase deploy
```

部署后返回线上地址：`https://invest-compass-dev.web.app`

---

## 质量检查清单

提交前确认：
- [ ] `npm run build` 构建通过（步骤 3 强制执行）
- [ ] 提交信息 header ≤ 72 字符
- [ ] type/scope 合法
- [ ] 描述使用祈使语气（添加/修复/更新）
- [ ] 暂存文件中不含敏感数据（API key、token）
- [ ] `.env.local` 未被意外暂存
- [ ] `node_modules` 未被意外暂存

## 异常处理

| 场景 | 处理方式 |
|------|----------|
| 构建失败 | 提示具体错误，中止提交直到修复 |
| 未暂存文件 | 引导用户先选择文件 |
| push 被拒绝 | `git pull --rebase` 后重试 |
| 无 remote | 询问是否添加 remote URL |
| 存在合并冲突 | 列出冲突文件，引导解决 |
| .env.local 被暂存 | 自动取消暂存并警告 |
