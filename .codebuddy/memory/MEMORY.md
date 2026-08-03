# 项目记忆：智投罗盘 InvestCompass

## 项目概要
智投罗盘（InvestCompass）是一套聚焦个人投资理念落地的量化交易与资产管理 MVP。
6 个功能页面：资产大盘 / 实时资讯 / 投资目标 / 量化模型 / AI 决策 / 知识学习。

## 技术栈
- 前端：React 18 + TypeScript + Vite + Tailwind CSS 3.x + Recharts
- 行情：AKShare（A股，免费开源）+ Python Flask 微服务
- 交易：自建模拟引擎（下单/T+1/涨跌停/手续费）→ 同花顺模拟盘（计划中）
- 数据：Firebase Firestore（模拟交易持久化）
- 部署：GitHub Pages + GitHub Actions 自动构建

## 项目结构
```
invest-compass/
├── src/               # 前端源码（6 页面 + 组件 + 引擎 + AKShare 客户端）
├── server/            # Python 后端（akshare_server.py + 计划中 trade_server.py）
├── config/            # 工具配置（vite/ts/tailwind/firebase/eslint）
├── firebase/          # Firestore 规则 + 索引
├── docs/              # 项目文档
├── .codebuddy/        # Skills + Memory（含飞书 token 脚本）
├── .github/           # GitHub Actions 自动部署 workflow
└── dist/              # 构建产物（不提交）
```

## 安全铁律 ⚠️

### 敏感信息保护
1. **所有 API 密钥/Token/密码 必须存放在 `.env.local`**，该文件在 `.gitignore` 排除，绝不提交到 Git
2. **飞书 token 缓存 `feishu_token_cache.json`** 已加入 `.gitignore`，含 `app_access_token` 和 `user_access_token`
3. **`.env.local.example`** 为脱敏模板，可安全提交
4. 禁止在源码中硬编码任何密钥
5. 禁止将密钥写入飞书文档、README、或任何可能公开的文本

### 交易安全
1. **绝对禁止真实现金交易**（未授权前）
2. 所有调试、测试、开发仅限于**模拟盘**
3. 模拟交易引擎内置：虚拟 10 万资金 + T+1/涨跌停/手续费模拟
4. 实盘交易（同花顺/QMT）**需用户明确授权后才能开发**
5. 模拟盘与实盘的代码必须**逻辑隔离**，通过配置切换

## 已知约定
- 无用户认证（个人使用）
- 路径别名 `@/` → `src/`
- `npm run build` 验证通过后才能提交
- 部署：GitHub Pages（hash 路由 `/#/page`）+ GitHub Actions
- 文档同步：代码变更 → 飞书产品说明 + README.md
