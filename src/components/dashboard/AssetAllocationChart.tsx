import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const defaultData = [
  { name: "股票", value: 60, color: "#3b82f6" },
  { name: "加密货币", value: 10, color: "#f59e0b" },
  { name: "债券", value: 25, color: "#10b981" },
  { name: "现金", value: 5, color: "#6b7280" },
];

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#6b7280", "#ef4444"];

interface Props {
  data?: { name: string; value: number }[];
}

export default function AssetAllocationChart({ data }: Props) {
  const chartData =
    data && data.length > 0
      ? data
          .filter((d) => d.value > 0)
          .map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))
      : defaultData;

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 flex flex-col items-center justify-center h-48 text-sm text-muted-foreground">
        暂无资产数据
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <h3 className="font-semibold mb-4">资产配置比例</h3>
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="w-32 h-32 sm:w-40 sm:h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground capitalize">
                {item.name}
              </span>
              <span className="font-medium number-font">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
