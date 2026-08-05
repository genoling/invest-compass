# 量化模型实盘 - 开发 Checklist

> 按顺序执行，每项完成后打勾 ✅

---

## 阶段 1：AKShare 数据接入

- [x] 1.1 安装 AKShare：`pip install akshare flask`（v1.18.81）
- [x] 1.2 搭建 Python Flask 行情微服务（`server/akshare_server.py`）
- [x] 1.3 实现实时行情接口（`GET /api/spot` + `/api/spot/:code`）
- [x] 1.4 实现 K线接口（`GET /api/kline?code=&start=&end=&period=`）
- [x] 1.5 Node.js 端新增 `src/lib/akshare/client.ts` 对接 Flask 服务
- [x] 1.6 行情数据自动切换（AKShare 可用 → 真实A股；不可用 → Mock回退）
- [x] 1.7 页面显示数据源状态（AKShare实时 / Mock模拟）+ 手动刷新按钮

## 阶段 2：自建模拟交易引擎

- [x] 2.1 定义数据模型（`src/lib/types/trading.ts`）
  - 模拟账户：总资产、可用资金、冻结资金、持仓市值、累计盈亏
  - 持仓：股票代码、数量、成本价、现价、可卖数量（T+1）、浮动盈亏
  - 委托：买卖方向、价格、数量、状态（待成交/已成交/已撤销/已拒绝）
  - 成交记录：时间、价格、数量、金额
- [x] 2.2 实现模拟交易引擎（`src/lib/engine/simulator.ts`）
  - 下单：placeOrder() 市价/限价，校验资金和持仓
  - 成交：市价单立即模拟成交，更新账户和持仓
  - 撤单：预留接口
  - A股规则：T+1（当日买入不可卖）、100股起、涨跌停±10%
  - 手续费：佣金 0.025%（最低5元）+ 印花税 0.1%（卖）
- [x] 2.3 实现持仓盈亏计算
  - refreshPositions() 按行情更新市价和浮动盈亏
  - dailySettlement() 每日结算释放 T+1
- [x] 2.4 实现交易记录持久化（Firestore）
  - `src/lib/engine/persistence.ts`：saveSimState / loadSimState / subscribeSimState
  - 页面加载时从 Firestore 恢复，状态变化自动保存
  - `firestore.rules` 添加 `simulation/{doc}` 读写规则
- [x] 2.5 前端交易面板（`AccountPanel.tsx` + `TradePanel.tsx`）
  - 模拟账户总览（总资产/可用/市值/盈亏）
  - 持仓列表（实时刷新盈亏）
  - 下单面板（买/卖切换、股票选择、市价/限价、数量x2快捷按钮）
  - 操作反馈消息（成交/拒绝）

## 阶段 3：策略引擎升级

- [x] 3.1 策略信号生成器（`src/lib/engine/strategy.ts`）
  - 4 种策略算法：均线交叉（金叉/死叉）、动量突破（高低点突破）、均值回归（σ偏离）、网格交易（区间挂单）
  - 输入 K线历史 + 实时行情 → 输出 买入/卖出/持有 + 信号强度 + 触发原因
- [x] 3.2 自动交易 Hook（`src/lib/engine/useAutoTrade.ts`）
  - 30 秒间隔检查行情
  - 只对启用的策略执行
  - 买入/卖出信号 → 自动调用模拟引擎下单
  - 持仓市值按行情实时刷新
- [ ] 3.3 回测引擎升级（用 AKShare 历史数据替代 Mock）
- [x] 3.4 前端 - 自动交易控制 + 信号日志
  - 页面顶部"启动/停止自动交易"按钮（脉冲动画）
  - 信号日志面板（最近 50 条，买入/卖出/持有分类显示）

## 阶段 4：前端可视化升级

- [x] 4.1 `/quant` 页面新增「模拟账户」面板（AccountPanel）
  - 总资产、可用资金、持仓市值、浮动盈亏
  - 持仓列表（实时刷新盈亏）
- [x] 4.2 `/quant` 页面新增「交易信号」日志
  - 最近 20 条信号记录
  - 信号触发时间、策略、操作、价格
- [x] 4.3 权益曲线组件（EquityCurve，Recharts AreaChart）
  - 模拟账户权益走势
  - 初始资金参考线
  - 盈亏颜色自适应
- [x] 4.4 成交记录面板（TradeHistory）
  - 买卖方向颜色标识
  - 股票/价格/数量/金额表格

## 阶段 5：联调与上线

- [x] 5.1 全流程联调：构建通过（2264 modules, 2.92s），0 Lint 错误
- [ ] 5.2 跑 1 周真实行情模拟，验证策略表现
- [ ] 5.3 回测对比（Mock 回测 vs 真实行情回测）
- [x] 5.4 部署配置就绪（firebase.json 在根目录，`npm run build && firebase deploy`）
  - ⚠️ 需本地终端执行：`npx firebase login` → `npx firebase deploy`

## 阶段 6：同花顺模拟盘对接

- [x] 6.1 调研同花顺对接方案
  - 结论：同花顺无官方交易 API，用开源 easytrader 库（剪贴板操作）
- [x] 6.2 搭建交易桥接服务（`server/trade_server.py`，端口 8766）
  - 默认硬编码为模拟盘模式（TRADE_MODE = "simulation"）
  - 实盘需用户明确授权后修改配置
  - 买入/卖出/持仓/账户 4 接口 + 安全警告
- [x] 6.3 Node.js 交易客户端（`src/lib/trade/client.ts`）
  - buy/sell/fetchAccount/fetchPositions/getTradeMode
- [ ] 6.4 调研中信证券 QMT 量化接口
- [ ] 6.5 模拟引擎替换为券商 API（远期）

---

> ⚠️ Checklist 实时更新：每完成一项，在飞书多维表格对应记录中更新状态
