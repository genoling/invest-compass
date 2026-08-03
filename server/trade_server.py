#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智投罗盘 - 同花顺模拟盘交易桥接服务

⚠️ 安全警告：
- 本服务默认使用【同花顺模拟盘】，绝不触及真实资金
- 实盘交易需用户明确授权后修改配置才能开启
- 所有交易操作记录到日志，可审计

启动: python server/trade_server.py
端口: 8766
"""
import os, sys, io, json, time, logging
from flask import Flask, jsonify, request

# 禁用代理
os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ============ 安全常量 ============

# ⚠️ 硬编码为模拟盘模式，防止误操作实盘
# 改为 "real" 需要用户主动修改此值并重启服务
TRADE_MODE = "simulation"  # "simulation" | "real"

# 模拟盘初始资金
SIM_INITIAL_CAPITAL = 100000

# 模拟持仓（内存存储，重启丢失）
_sim_account = {"cash": SIM_INITIAL_CAPITAL, "frozen": 0.0}
_sim_positions = {}  # {code: {name, quantity, avg_cost, available_qty}}
_sim_orders = []     # [{id, code, side, price, qty, status, time}]
_sim_trades = []     # [{id, code, side, price, qty, amount, time}]

_order_seq = 0

def _next_id():
    global _order_seq
    _order_seq += 1
    return f"ORD-{int(time.time())}-{_order_seq:04d}"


# ============ API 路由 ============

@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "mode": TRADE_MODE,
        "service": "trade-server",
        "warning": "模拟盘模式，所有交易均为虚拟" if TRADE_MODE == "simulation" else "⚠️ 实盘模式"
    })

@app.route("/api/account")
def account():
    """获取账户信息"""
    if TRADE_MODE == "simulation":
        positions = [
            {
                "code": code,
                "name": p["name"],
                "quantity": p["quantity"],
                "available_qty": p["available_qty"],
                "avg_cost": p["avg_cost"],
            }
            for code, p in _sim_positions.items()
        ]
        return jsonify({
            "code": 0,
            "data": {
                "cash": _sim_account["cash"],
                "frozen": _sim_account["frozen"],
                "positions": positions,
                "mode": "simulation",
            }
        })
    return jsonify({"code": -1, "msg": "实盘模式未实现"}), 501

@app.route("/api/positions")
def positions():
    """获取持仓列表"""
    if TRADE_MODE == "simulation":
        result = []
        for code, p in _sim_positions.items():
            result.append({
                "code": code,
                "name": p["name"],
                "quantity": p["quantity"],
                "available_qty": p["available_qty"],
                "avg_cost": p["avg_cost"],
            })
        return jsonify({"code": 0, "data": result})
    return jsonify({"code": -1, "msg": "实盘模式未实现"}), 501

@app.route("/api/trade/buy", methods=["POST"])
def buy():
    """买入（模拟盘）"""
    if TRADE_MODE != "simulation":
        return jsonify({"code": -1, "msg": "实盘模式未授权，拒绝操作"}), 403

    body = request.get_json() or {}
    code = body.get("code", "").strip()
    name = body.get("name", f"股票{code}")
    price = float(body.get("price", 0) or 0)
    quantity = int(body.get("quantity", 0) or 0)

    # 校验
    if not code or quantity <= 0 or quantity % 100 != 0:
        return jsonify({"code": -1, "msg": "参数错误：数量必须为 100 股的整数倍"}), 400

    exec_price = price if price > 0 else 10.0  # 市价单用默认价
    amount = exec_price * quantity
    commission = max(amount * 0.00025, 5.0)  # 佣金

    total_cost = amount + commission
    if total_cost > _sim_account["cash"]:
        return jsonify({"code": -1, "msg": f"资金不足：需要 ¥{total_cost:.2f}，可用 ¥{_sim_account['cash']:.2f}"}), 400

    # 执行买入
    _sim_account["cash"] -= total_cost

    if code in _sim_positions:
        p = _sim_positions[code]
        total_qty = p["quantity"] + quantity
        p["avg_cost"] = (p["avg_cost"] * p["quantity"] + amount) / total_qty
        p["quantity"] = total_qty
        # T+1：当日买入不可卖
    else:
        _sim_positions[code] = {
            "name": name,
            "quantity": quantity,
            "avg_cost": exec_price,
            "available_qty": 0,  # T+1
        }

    order_id = _next_id()
    trade_id = _next_id()
    now = time.strftime("%Y-%m-%d %H:%M:%S")

    _sim_orders.append({
        "id": order_id, "code": code, "side": "buy", "price": exec_price,
        "quantity": quantity, "status": "filled", "time": now
    })
    _sim_trades.append({
        "id": trade_id, "code": code, "side": "buy", "price": exec_price,
        "quantity": quantity, "amount": amount, "time": now
    })

    logger.info(f"[模拟盘] 买入 {name}({code}) {quantity}股 @ ¥{exec_price:.2f} 成交金额 ¥{amount:.2f} 佣金 ¥{commission:.2f}")

    return jsonify({
        "code": 0,
        "data": {
            "order_id": order_id,
            "trade_id": trade_id,
            "status": "filled",
            "cash_remaining": _sim_account["cash"],
        }
    })

@app.route("/api/trade/sell", methods=["POST"])
def sell():
    """卖出（模拟盘）"""
    if TRADE_MODE != "simulation":
        return jsonify({"code": -1, "msg": "实盘模式未授权，拒绝操作"}), 403

    body = request.get_json() or {}
    code = body.get("code", "").strip()
    price = float(body.get("price", 0) or 0)
    quantity = int(body.get("quantity", 0) or 0)

    if not code or quantity <= 0 or quantity % 100 != 0:
        return jsonify({"code": -1, "msg": "参数错误"}), 400

    pos = _sim_positions.get(code)
    if not pos:
        return jsonify({"code": -1, "msg": f"未持有 {code}"}), 400
    if pos["available_qty"] < quantity:
        return jsonify({"code": -1, "msg": f"可卖数量不足：需要 {quantity} 股，可用 {pos['available_qty']} 股（T+1 限制）"}), 400

    exec_price = price if price > 0 else 10.0
    amount = exec_price * quantity
    commission = max(amount * 0.00025, 5.0)
    stamp_tax = amount * 0.001  # 印花税

    net_cash = amount - commission - stamp_tax
    _sim_account["cash"] += net_cash

    pos["quantity"] -= quantity
    pos["available_qty"] -= quantity
    if pos["quantity"] <= 0:
        del _sim_positions[code]

    order_id = _next_id()
    trade_id = _next_id()
    now = time.strftime("%Y-%m-%d %H:%M:%S")

    _sim_orders.append({
        "id": order_id, "code": code, "side": "sell", "price": exec_price,
        "quantity": quantity, "status": "filled", "time": now
    })
    _sim_trades.append({
        "id": trade_id, "code": code, "side": "sell", "price": exec_price,
        "quantity": quantity, "amount": amount, "time": now
    })

    logger.info(f"[模拟盘] 卖出 {code} {quantity}股 @ ¥{exec_price:.2f} 净收入 ¥{net_cash:.2f}")

    return jsonify({
        "code": 0,
        "data": {
            "order_id": order_id,
            "trade_id": trade_id,
            "status": "filled",
            "cash_remaining": _sim_account["cash"],
        }
    })

@app.route("/api/trade/orders")
def orders():
    """最近订单列表"""
    return jsonify({"code": 0, "data": _sim_orders[-50:]})

@app.route("/api/trade/trades")
def trades():
    """最近成交列表"""
    return jsonify({"code": 0, "data": _sim_trades[-50:]})

@app.route("/api/trade/mode")
def mode():
    """查询当前交易模式"""
    return jsonify({
        "mode": TRADE_MODE,
        "warning": "⚠️ 模拟盘模式" if TRADE_MODE == "simulation" else "⚠️ 实盘模式 - 真金白银"
    })


if __name__ == "__main__":
    print(">> 智投罗盘 - 模拟盘交易服务启动中...")
    print(f"   模式: {TRADE_MODE}")
    print("   端口: 8766")
    print("   所有交易均为模拟盘，不涉及真实资金")
    app.run(host="0.0.0.0", port=8766, debug=False)
