import { useState } from "react";
import { cn } from "@/lib/utils";
import { MIN_TRADE_UNIT } from "@/lib/types/trading";
import type { OrderSide, OrderType } from "@/lib/types/trading";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface TradePanelProps {
  onPlaceOrder: (params: {
    code: string;
    name: string;
    side: OrderSide;
    price: number;
    quantity: number;
    type: OrderType;
  }) => void;
  disabled?: boolean;
}

const DEFAULT_STOCKS = [
  { code: "000001", name: "平安银行" },
  { code: "600519", name: "贵州茅台" },
  { code: "000858", name: "五粮液" },
  { code: "300750", name: "宁德时代" },
  { code: "601318", name: "中国平安" },
  { code: "600036", name: "招商银行" },
  { code: "002594", name: "比亚迪" },
  { code: "688981", name: "中芯国际" },
  { code: "000002", name: "万科A" },
  { code: "601166", name: "兴业银行" },
  { code: "600030", name: "中信证券" },
  { code: "000725", name: "京东方A" },
  { code: "002415", name: "海康威视" },
  { code: "300059", name: "东方财富" },
  { code: "600276", name: "恒瑞医药" },
];

export default function TradePanel({ onPlaceOrder, disabled }: TradePanelProps) {
  const [side, setSide] = useState<OrderSide>("buy");
  const [code, setCode] = useState("000001");
  const [name, setName] = useState("平安银行");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [customCode, setCustomCode] = useState("");

  const handleStockSelect = (c: string, n: string) => {
    setCode(c);
    setName(n);
    setCustomCode("");
  };

  const handleSubmit = () => {
    const qty = parseInt(quantity) || 0;
    const prc = orderType === "market" ? 0 : parseFloat(price) || 0;
    if (qty <= 0) return;

    const finalCode = customCode || code;
    const finalName = customCode ? `股票${finalCode}` : name;

    onPlaceOrder({ code: finalCode, name: finalName, side, price: prc, quantity: qty, type: orderType });
  };

  const estimatedAmount = orderType === "market" ? "市价成交" : `¥${((parseFloat(price) || 0) * (parseInt(quantity) || 0)).toLocaleString()}`;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 border-b">
        <div className="text-sm font-semibold">下单交易</div>
      </div>

      <div className="p-4 space-y-4">
        {/* 买卖切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setSide("buy")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
              side === "buy"
                ? "bg-gain/10 text-gain border border-gain/30"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}
          >
            <ArrowUpCircle className="h-4 w-4" /> 买入
          </button>
          <button
            onClick={() => setSide("sell")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
              side === "sell"
                ? "bg-loss/10 text-loss border border-loss/30"
                : "bg-secondary text-muted-foreground hover:bg-secondary/70"
            )}
          >
            <ArrowDownCircle className="h-4 w-4" /> 卖出
          </button>
        </div>

        {/* 股票选择 */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">股票代码</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {DEFAULT_STOCKS.map((s) => (
              <button
                key={s.code}
                onClick={() => handleStockSelect(s.code, s.name)}
                className={cn(
                  "text-xs px-2 py-1 rounded border transition-colors",
                  code === s.code && !customCode
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                {s.code}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="或输入其他代码"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm number-font"
          />
        </div>

        {/* 订单类型 */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">订单类型</label>
          <div className="flex gap-2">
            {[
              { v: "market", l: "市价单（立即成交）" },
              { v: "limit", l: "限价单" },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => setOrderType(t.v as OrderType)}
                className={cn(
                  "flex-1 text-xs py-1.5 rounded border transition-colors",
                  orderType === t.v
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground hover:border-primary/50"
                )}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {/* 限价单价格 */}
        {orderType === "limit" && (
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">委托价格</label>
            <input
              type="number"
              step="0.01"
              placeholder="请输入价格"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm number-font"
            />
          </div>
        )}

        {/* 数量 */}
        <div>
          <label className="text-xs text-muted-foreground block mb-1.5">
            数量（股，{MIN_TRADE_UNIT} 股起）
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step={MIN_TRADE_UNIT}
              min={MIN_TRADE_UNIT}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="flex-1 rounded-md border bg-background px-2.5 py-1.5 text-sm number-font"
            />
            <button
              onClick={() => setQuantity(String(parseInt(quantity) * 2 || MIN_TRADE_UNIT))}
              className="text-xs px-2 py-1 rounded border hover:bg-secondary"
            >
              x2
            </button>
          </div>
        </div>

        {/* 预估 */}
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>预估金额</span>
          <span className="number-font">{estimatedAmount}</span>
        </div>

        {/* 下单按钮 */}
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className={cn(
            "w-full rounded-md py-2.5 text-sm font-semibold transition-colors",
            side === "buy"
              ? "bg-gain text-white hover:bg-gain/90"
              : "bg-loss text-white hover:bg-loss/90",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {side === "buy" ? "买入" : "卖出"} {name}
        </button>
      </div>
    </div>
  );
}
