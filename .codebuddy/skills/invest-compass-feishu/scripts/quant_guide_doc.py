#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在飞书产品说明文档中添加「量化模型使用指南」章节（批量写入）"""
import sys, os, io, requests, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

cache = ft._load_cache()
TOKEN = cache.get("user_access_token") or ft.get_app_access_token()

BASE = "https://open.feishu.cn/open-apis"
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json; charset=utf-8"}
session = requests.Session()
session.trust_env = False

DOC_ID = "ASp8dlNAEo9aCFxJT2cciZt4nuc"  # 产品需求规格说明书

def add_blocks_batch(lines):
    """批量写入多个 text 块（一次请求）"""
    url = f"{BASE}/docx/v1/documents/{DOC_ID}/blocks/{DOC_ID}/children"
    children = []
    for line in lines:
        if not line.strip():
            continue
        children.append({
            "block_type": 2,
            "text": {"elements": [{"text_run": {"content": line}}], "style": {}},
        })
    if not children:
        return True
    body = {"children": children, "index": -1}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=60)
    try:
        d = r.json()
        if d.get("code") != 0:
            print(f"  ❌ 批量写入失败 code={d.get('code')} msg={d.get('msg')}")
            return False
        print(f"  ✅ 已写入 {len(children)} 个块")
        return True
    except Exception as e:
        print(f"  ⚠️ 响应异常: {e}")
        return False

print("📝 向产品说明文档批量添加「量化模型使用指南」...")

# 所有内容一次性写入（分批次，每批 20 块避免超限）
content_lines = [
    "【五、量化模型使用指南（2.5 量化模型）】",
    "量化模型页（/quant）用于创建量化交易策略、回测验证并展示策略表现。以下逐一解析各术语含义与用法。",
    "",
    "5.1 核心概念：策略（Strategy）",
    "策略 = 一套可执行的交易规则集合。系统提供 4 种预设模板，本质是「什么条件触发买入、什么条件触发卖出」的数学化描述。用法：点击「新建策略」选择模板 → 配置参数 → 创建后可在列表启停。",
    "",
    "5.2 策略模板详解",
    "",
    "① 均线交叉策略（MA Cross）",
    "- 含义：基于短期均线与长期均线的交叉判断趋势转向。",
    "- 参数：shortPeriod（短期均线周期）、longPeriod（长期均线周期）。",
    "- 用法：短期均线上穿长期均线（金叉）→ 买入；下穿（死叉）→ 卖出。适合趋势行情。",
    "",
    "② 动量突破策略（Momentum）",
    "- 含义：假设价格突破前高后往往延续上涨（动量效应）。",
    "- 参数：lookbackPeriod（回看周期）、breakoutThreshold（突破阈值，如 1.02 表示突破前高 2%）。",
    "- 用法：价格突破 N 日高点 × 阈值 → 买入；跌破 N 日低点 → 卖出。适合单边行情。",
    "",
    "③ 均值回归策略（Mean Reversion）",
    "- 含义：假设价格偏离长期均值后会回归（物极必反）。",
    "- 参数：meanPeriod（均值计算周期）、deviationThreshold（偏离倍数，如 2 表示偏离 2 个标准差）。",
    "- 用法：价格低于均值-2σ（超跌）→ 买入；回归均值 → 卖出。适合震荡行情。",
    "",
    "④ 网格交易策略（Grid Trading）",
    "- 含义：在预设价格区间内分层挂单，每层低买高卖赚取差价。",
    "- 参数：gridLevels（网格层数）、upperPrice（区间上沿）、lowerPrice（区间下沿）。",
    "- 用法：价格在上沿/下沿之间波动时自动高抛低吸。适合震荡市。",
    "",
    "5.3 回测参数术语",
    "- 策略：选择要验证的已创建策略。",
    "- 标的代码：回测的证券代码，如 000001.SZ（平安银行A股）、600519.SH（贵州茅台）。",
    "- 起始/结束日期：回测的历史区间，应尽量覆盖牛熊周期以提高可信度。",
    "- 初始资金：模拟的起始本金，用于计算收益率与仓位。",
    "- 开始回测：执行回测（当前为模拟演示，展示预设结果）。",
    "",
    "5.4 回测指标术语",
    "- 总收益率（Total Return）：期末资产相对期初本金的总涨跌幅。越高越好。",
    "- 年化收益率（Annual Return）：把总收益折算到每年，便于不同周期比较。",
    "- 最大回撤（Max Drawdown）：历史高点回落的最大幅度，衡量风险。越低越好。",
    "- 夏普比率（Sharpe Ratio）：「每承担 1 单位风险获得的超额收益」。>1 为良好，>2 优秀。",
    "- 胜率（Win Rate）：盈利交易次数 / 总交易次数。高胜率不一定高收益（需结合盈亏比）。",
    "- 总交易次数（Total Trades）：回测期间触发信号的总次数。",
    "- 平均持仓天数（Avg Holding Days）：每笔交易平均持有时间，反映策略换手频率。",
    "",
    "5.5 权益曲线与交易记录",
    "- 权益曲线（Equity Curve）：回测期间账户总价值的走势图，直观展示策略的成长与波动。",
    "- 交易记录（Trade Log）：每笔买卖的日期、价格、数量、金额与触发原因，可复盘策略逻辑是否正确执行。",
    "",
    "5.6 使用建议",
    "1. 先用不同周期（短/中/长）做多组回测，观察指标是否稳定。",
    "2. 关注「最大回撤」——即使收益率高，回撤过大也可能导致中途割肉离场。",
    "3. 结合夏普比率与胜率综合判断，避免只看单一指标。",
    "4. 回测只是历史模拟，不保证未来表现，实盘需谨慎。",
    "",
    "【六、后续规划（更新）】",
    "- 接入真实历史行情数据（Finnhub / Alpha Vantage）进行真实回测",
    "- 量化模型实盘交易接口对接",
    "- 策略参数自动寻优（网格搜索/遗传算法）",
    "- 策略组合与风险平价配置",
]

# 分批次写入（每批 20 块）
BATCH_SIZE = 20
success = True
for i in range(0, len(content_lines), BATCH_SIZE):
    batch = content_lines[i : i + BATCH_SIZE]
    if not add_blocks_batch(batch):
        success = False
        break
    time.sleep(1.0)

if success:
    print("\n✅ 产品说明文档已更新（量化模型使用指南已写入）")
else:
    print("\n⚠️ 部分写入失败")
print(f"🔗 https://rcnvdrualu35.feishu.cn/docx/{DOC_ID}")
