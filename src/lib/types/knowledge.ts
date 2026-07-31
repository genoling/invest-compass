/** 知识内容 */
export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: KnowledgeCategory;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  relatedGoals: string[];
  relatedAssets: string[];
  createdAt: string;
  updatedAt: string;
}

/** 知识分类 */
export type KnowledgeCategory =
  | "investment_philosophy"
  | "basic_terms"
  | "technical_analysis"
  | "fundamental_analysis"
  | "risk_control"
  | "strategy_cases";

/** 学习进度 */
export interface LearningProgress {
  id: string;
  knowledgeId: string;
  progressPercentage: number;
  lastPosition: number;
  status: "reading" | "completed";
  startedAt: string;
  lastAccessedAt: string;
}
