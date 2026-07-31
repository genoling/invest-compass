/** 风险偏好 */
export type RiskTolerance = "conservative" | "moderate" | "aggressive";

/** 投资目标状态 */
export type GoalStatus = "active" | "completed" | "paused";

/** 投资周期 */
export type InvestmentPeriod = "short" | "medium" | "long";

/** 资产类别 */
export type GoalAssetClass = "stocks" | "cryptocurrency" | "bonds" | "cash" | "forex";

/** 投资目标 */
export interface InvestmentGoal {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  initialAmount: number;
  currentAmount: number;
  riskTolerance: RiskTolerance;
  period: InvestmentPeriod;
  startDate: string;
  endDate: string;
  targetAllocations: Record<string, number>;
  currentAllocations: Record<string, number>;
  rebalanceThreshold: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

/** 持仓资产 */
export interface Holding {
  id: string;
  goalId: string;
  assetClass: GoalAssetClass;
  assetSymbol: string;
  assetName: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currentValue: number;
  weight: number;
  pnl: number;
  pnlPercent: number;
  createdAt: string;
  updatedAt: string;
}

/** 目标执行进度 */
export interface GoalProgress {
  id: string;
  goalId: string;
  totalCurrentValue: number;
  progressPercentage: number;
  totalPnl: number;
  totalPnlPercent: number;
  allocationDrifts: Record<string, number>;
  rebalanceActions: RebalanceAction[];
  lastUpdated: string;
}

/** 再平衡操作建议 */
export interface RebalanceAction {
  assetClass: GoalAssetClass;
  symbol: string;
  assetName: string;
  action: "buy" | "sell";
  currentWeight: number;
  targetWeight: number;
  amount: number;
  quantity: number;
  reason: string;
}

/** 投资周期选项 */
export const periodOptions: { value: InvestmentPeriod; label: string; desc: string }[] = [
  { value: "short", label: "短期", desc: "1年以内" },
  { value: "medium", label: "中期", desc: "1-3年" },
  { value: "long", label: "长期", desc: "3年以上" },
];

/** 风险偏好选项 */
export const riskOptions: { value: RiskTolerance; label: string; desc: string }[] = [
  { value: "conservative", label: "保守型", desc: "以保值为主，追求稳定收益" },
  { value: "moderate", label: "稳健型", desc: "平衡风险与收益" },
  { value: "aggressive", label: "激进型", desc: "追求高收益，承受较高风险" },
];

/** 默认资产配置比例（按风险偏好） */
export const defaultAllocations: Record<RiskTolerance, Record<string, number>> = {
  conservative: { stocks: 30, bonds: 50, cryptocurrency: 5, cash: 15 },
  moderate: { stocks: 55, bonds: 20, cryptocurrency: 10, cash: 15 },
  aggressive: { stocks: 70, cryptocurrency: 20, bonds: 5, cash: 5 },
};
