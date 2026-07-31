import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type RiskTolerance,
  type InvestmentPeriod,
  periodOptions,
  riskOptions,
} from "@/lib/types/goal";
import { X, Plus } from "lucide-react";

const goalSchema = z.object({
  name: z
    .string()
    .min(2, "目标名称至少2个字")
    .max(30, "目标名称不超过30字"),
  description: z
    .string()
    .min(1, "请描述你的投资理念")
    .max(200, "描述不超过200字"),
  targetAmount: z.coerce
    .number()
    .min(10000, "最低目标金额1万元")
    .max(100000000, "目标金额不超过1亿"),
  initialAmount: z.coerce
    .number()
    .min(0, "初始金额不能为负数")
    .max(100000000),
  riskTolerance: z.enum([
    "conservative",
    "moderate",
    "aggressive",
  ]),
  period: z.enum(["short", "medium", "long"]),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => void;
  onClose: () => void;
}

export default function GoalForm({ onSubmit, onClose }: GoalFormProps) {
  const [riskTolerance, setRiskTolerance] =
    useState<RiskTolerance>("moderate");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: 100000,
      initialAmount: 10000,
      riskTolerance: "moderate",
      period: "long",
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-4"
        >
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            新建投资目标
          </h2>

          {/* 目标名称 */}
          <div>
            <label className="text-sm font-medium">目标名称</label>
            <input
              {...register("name")}
              placeholder="如：长期价值投资"
              className="w-full mt-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* 投资理念描述 */}
          <div>
            <label className="text-sm font-medium">
              投资理念描述
            </label>
            <textarea
              {...register("description")}
              placeholder="描述你的投资理念和策略..."
              rows={3}
              className="w-full mt-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 投资周期 */}
          <div>
            <label className="text-sm font-medium">投资周期</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {periodOptions.map((p) => (
                <label
                  key={p.value}
                  className="flex flex-col items-center gap-1 rounded-lg border p-2 cursor-pointer hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
                >
                  <input
                    type="radio"
                    {...register("period")}
                    value={p.value}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {p.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 风险偏好 */}
          <div>
            <label className="text-sm font-medium">风险偏好</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {riskOptions.map((r) => (
                <label
                  key={r.value}
                  className="flex flex-col items-center gap-1 rounded-lg border p-2 cursor-pointer hover:border-primary/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition-colors"
                  onClick={() => {
                    setRiskTolerance(r.value);
                    setValue("riskTolerance", r.value);
                  }}
                >
                  <input
                    type="radio"
                    {...register("riskTolerance")}
                    value={r.value}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">
                    {r.label}
                  </span>
                  <span className="text-xs text-muted-foreground text-center">
                    {r.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 金额 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">
                目标金额 (元)
              </label>
              <input
                type="number"
                {...register("targetAmount")}
                className="w-full mt-1 rounded-lg border px-3 py-2 text-sm number-font focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.targetAmount && (
                <p className="text-xs text-destructive mt-1">
                  {errors.targetAmount.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">
                初始投入 (元)
              </label>
              <input
                type="number"
                {...register("initialAmount")}
                className="w-full mt-1 rounded-lg border px-3 py-2 text-sm number-font focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {errors.initialAmount && (
                <p className="text-xs text-destructive mt-1">
                  {errors.initialAmount.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            创建投资目标
          </button>
        </form>
      </div>
    </div>
  );
}
