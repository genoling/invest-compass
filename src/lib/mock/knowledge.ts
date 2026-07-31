import type {
  KnowledgeItem,
  LearningProgress,
} from "@/lib/types/knowledge";

export const mockKnowledge: KnowledgeItem[] = [
  {
    id: "k1",
    title: "长期价值投资核心理念",
    content: `价值投资是由本杰明·格雷厄姆创立、沃伦·巴菲特发扬光大的经典投资理念。

核心思想：寻找市场价格低于其内在价值的优质资产，长期持有以待价值回归。

三大原则：
1. 安全边际：买入价格应大幅低于估算的内在价值
2. 能力圈：只投资你真正了解的行业和企业
3. 市场先生：利用市场情绪波动，而非被其左右

实操要点：
- PE（市盈率）低于行业平均水平
- ROE（净资产收益率）连续5年>15%
- 负债率合理，现金流充裕
- 行业龙头地位稳固`,
    summary:
      "价值投资的核心逻辑是寻找被市场低估的优质资产，通过长期持有获取超额回报。",
    category: "investment_philosophy",
    tags: ["价值投资", "长期投资", "基本面"],
    difficulty: "beginner",
    relatedGoals: ["goal-1"],
    relatedAssets: ["AAPL", "MSFT"],
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "k2",
    title: "PE市盈率详解",
    content: `市盈率（Price to Earnings Ratio）是最常用的估值指标之一。

计算公式：PE = 股价 / 每股收益（EPS）

分类：
- 静态市盈率：基于上一年度实际利润
- 滚动市盈率（TTM）：基于最近四个季度利润
- 动态市盈率：基于预测的未来利润

应用场景：
- 横向比较同行业公司的估值水平
- 纵向比较历史PE区间，判断当前估值分位
- 成长型公司PE较高（30-50倍），价值型公司PE较低（10-15倍）

注意事项：
- 不同行业PE不可直接比较
- 亏损公司PE为负无意义
- 需结合增长率和ROE综合判断`,
    summary:
      "市盈率是衡量股票估值水平的核心指标，反映市场愿意为公司每单位利润支付的价格。",
    category: "basic_terms",
    tags: ["市盈率", "PE", "估值", "基础概念"],
    difficulty: "beginner",
    relatedGoals: ["goal-1", "goal-2"],
    relatedAssets: [],
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "k3",
    title: "MACD技术指标实战应用",
    content: `MACD（异同移动平均线）是最常用的趋势跟踪指标。

构成：
- DIF线（快线）：12日EMA - 26日EMA
- DEA线（慢线）：DIF的9日EMA
- 柱状线（MACD柱）：DIF - DEA的2倍

核心信号：
1. 金叉买入：DIF上穿DEA，趋势转多
2. 死叉卖出：DIF下穿DEA，趋势转空
3. 顶背离：股价新高但MACD不创新高，看跌
4. 底背离：股价新低但MACD不创新低，看涨

实战技巧：
- 零轴以上金叉做多信号更强
- 结合成交量确认信号有效性
- 中长周期（周线）MACD信号更可靠`,
    summary:
      "MACD是经典的趋势跟踪技术指标，通过金叉死叉和背离信号辅助判断买卖时机。",
    category: "technical_analysis",
    tags: ["MACD", "技术分析", "趋势", "买卖信号"],
    difficulty: "intermediate",
    relatedGoals: ["goal-1"],
    relatedAssets: [],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "k4",
    title: "行业基本面分析框架",
    content: `行业分析是基本面研究的重要组成部分，帮助识别具有长期成长潜力的投资赛道。

分析维度：

1. 行业生命周期
- 导入期：高增长、高风险、竞争格局未定
- 成长期：快速增长、格局初定、龙头出现
- 成熟期：增速放缓、格局稳定、现金流充裕
- 衰退期：需求萎缩、产能过剩

2. 波特五力模型
- 行业内竞争强度
- 新进入者威胁
- 替代品威胁
- 供应商议价能力
- 买方议价能力

3. 关键驱动因素
- 政策环境
- 技术进步
- 消费趋势
- 宏观经济`,
    summary:
      "通过行业生命周期、竞争格局和关键驱动因素分析，评估赛道的长期投资价值。",
    category: "fundamental_analysis",
    tags: ["基本面", "行业分析", "研究方法"],
    difficulty: "intermediate",
    relatedGoals: ["goal-1"],
    relatedAssets: [],
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "k5",
    title: "风险控制与仓位管理",
    content: `风险控制是投资成功的核心要素，决定了长期复利增长的上限和下限。

核心原则：
1. 严格止损：单笔亏损不超过总资产的2%
2. 分散配置：不同资产类别、行业、市场
3. 仓位管理：根据市场环境动态调整

仓位管理策略：
- 均仓法：每笔投资固定比例
- 凯利公式：根据胜率和赔率计算最优仓位
- 分批建仓：分3-5次逐步买入

止盈止损设置：
- 移动止损：随价格上涨上调止损位
- 时间止损：持仓超过预期时间减仓
- 技术止损：跌破关键支撑位止损

风险管理清单（每次交易前检查）：
- 最大亏损是否在承受范围内？
- 仓位是否过于集中？
- 市场整体风险水平如何？`,
    summary:
      "科学的仓位管理和严格的风险控制，是长期投资中比选股更重要的生存法则。",
    category: "risk_control",
    tags: ["风险管理", "仓位", "止损"],
    difficulty: "intermediate",
    relatedGoals: ["goal-1", "goal-2"],
    relatedAssets: [],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: "2026-05-01T00:00:00Z",
  },
  {
    id: "k6",
    title: "定投策略实战案例",
    content: `定投（定期定额投资）是最适合普通投资者的长期财富积累策略。

策略逻辑：
- 淡化择时：通过定期买入平滑买入成本
- 强制储蓄：养成持续投资习惯
- 摊薄成本：熊市买更多份额，牛市少买

回测数据（沪深300，2015-2025）：
- 一次性投资年化收益：5.8%
- 每月定投年化收益：7.2%
- 定投最大回撤：-22%（vs 一次性-45%）

实操要点：
- 选择宽基指数基金（沪深300、标普500）
- 坚持3年以上周期
- 熊市加仓、牛市减仓（智能定投）
- 止盈不止损`,
    summary:
      "定投通过纪律性买入平滑波动，配合长期持有和复利效应，是适合大众的稳健投资策略。",
    category: "strategy_cases",
    tags: ["定投", "指数投资", "案例"],
    difficulty: "beginner",
    relatedGoals: ["goal-2"],
    relatedAssets: ["SPY"],
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
  },
];

/** Mock 学习进度 */
export const mockProgressList: LearningProgress[] = [
  {
    id: "lp-1",
    knowledgeId: "k1",
    progressPercentage: 100,
    lastPosition: 0,
    status: "completed",
    startedAt: "2026-07-10T10:00:00Z",
    lastAccessedAt: "2026-07-12T15:30:00Z",
  },
  {
    id: "lp-2",
    knowledgeId: "k2",
    progressPercentage: 60,
    lastPosition: 120,
    status: "reading",
    startedAt: "2026-07-15T09:00:00Z",
    lastAccessedAt: "2026-07-20T14:00:00Z",
  },
  {
    id: "lp-3",
    knowledgeId: "k3",
    progressPercentage: 30,
    lastPosition: 80,
    status: "reading",
    startedAt: "2026-07-18T20:00:00Z",
    lastAccessedAt: "2026-07-22T21:00:00Z",
  },
];
