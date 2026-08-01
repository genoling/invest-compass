#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智投罗盘 - AKShare 行情数据微服务

提供 A股实时行情、历史K线、股票列表等接口。
启动: python server/akshare_server.py
端口: 8765
"""
import os, sys, io, json, time, threading, logging
from functools import lru_cache
from flask import Flask, jsonify, request

# 禁用代理（避免公司/VPN 环境代理阻断）
os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
os.environ["http_proxy"] = ""
os.environ["https_proxy"] = ""
os.environ["NO_PROXY"] = "*"

import akshare as ak

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# ============ 缓存（减少重复请求） ============
_cache = {}
_cache_ttl = {}

def cache_get(key):
    if key in _cache and time.time() < _cache_ttl.get(key, 0):
        return _cache[key]
    return None

def cache_set(key, val, ttl=30):
    _cache[key] = val
    _cache_ttl[key] = time.time() + ttl

# ============ API 路由 ============

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "akshare-server"})

@app.route("/api/spot")
def spot():
    """实时行情：全部 A股实时报价（缓存 10 秒）"""
    cached = cache_get("spot_all")
    if cached:
        return jsonify(cached)

    try:
        df = ak.stock_zh_a_spot_em()
        # 只返回关键字段
        records = []
        for _, row in df.iterrows():
            records.append({
                "code": str(row["代码"]),
                "name": str(row["名称"]),
                "price": float(row["最新价"]) if row["最新价"] else 0,
                "change_pct": float(row["涨跌幅"]) if row["涨跌幅"] else 0,
                "volume": int(row["成交量"]) if row["成交量"] else 0,
                "turnover": float(row["成交额"]) if row["成交额"] else 0,
                "high": float(row["最高"]) if row["最高"] else 0,
                "low": float(row["最低"]) if row["最低"] else 0,
                "open": float(row["今开"]) if row["今开"] else 0,
                "pre_close": float(row["昨收"]) if row["昨收"] else 0,
            })
        result = {"code": 0, "data": records, "total": len(records)}
        cache_set("spot_all", result, ttl=10)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取实时行情失败: {e}")
        return jsonify({"code": -1, "msg": str(e)}), 500

@app.route("/api/spot/<code>")
def spot_single(code):
    """单只股票实时行情（缓存 5 秒）"""
    cached = cache_get(f"spot_{code}")
    if cached:
        return jsonify(cached)

    try:
        df = ak.stock_zh_a_spot_em()
        row = df[df["代码"] == code]
        if row.empty:
            return jsonify({"code": -1, "msg": f"股票 {code} 未找到"}), 404
        r = row.iloc[0]
        result = {
            "code": 0,
            "data": {
                "code": str(r["代码"]),
                "name": str(r["名称"]),
                "price": float(r["最新价"]),
                "change_pct": float(r["涨跌幅"]),
                "volume": int(r["成交量"]),
                "turnover": float(r["成交额"]),
                "high": float(r["最高"]),
                "low": float(r["最低"]),
                "open": float(r["今开"]),
                "pre_close": float(r["昨收"]),
            },
        }
        cache_set(f"spot_{code}", result, ttl=5)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取单股行情失败 {code}: {e}")
        return jsonify({"code": -1, "msg": str(e)}), 500

@app.route("/api/kline")
def kline():
    """历史 K 线数据"""
    code = request.args.get("code", "000001")
    period = request.args.get("period", "daily")  # daily, weekly, monthly
    start = request.args.get("start", "20240101")
    end = request.args.get("end", "20260101")
    adjust = request.args.get("adjust", "qfq")  # 前复权

    cache_key = f"kline_{code}_{period}_{start}_{end}"
    cached = cache_get(cache_key)
    if cached:
        return jsonify(cached)

    try:
        df = ak.stock_zh_a_hist(
            symbol=code,
            period=period,
            start_date=start,
            end_date=end,
            adjust=adjust,
        )
        records = []
        for _, row in df.iterrows():
            records.append({
                "date": str(row["日期"]),
                "open": float(row["开盘"]),
                "close": float(row["收盘"]),
                "high": float(row["最高"]),
                "low": float(row["最低"]),
                "volume": int(row["成交量"]),
                "turnover": float(row["成交额"]) if "成交额" in row else 0,
                "amplitude": float(row["振幅"]) if "振幅" in row else 0,
                "change_pct": float(row["涨跌幅"]) if "涨跌幅" in row else 0,
            })
        result = {"code": 0, "data": records, "total": len(records)}
        cache_set(cache_key, result, ttl=3600)  # 历史数据缓存 1 小时
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取K线失败 {code}: {e}")
        return jsonify({"code": -1, "msg": str(e)}), 500

@app.route("/api/search")
def search():
    """股票搜索（代码或名称模糊匹配）"""
    q = request.args.get("q", "")
    if not q or len(q) < 2:
        return jsonify({"code": -1, "msg": "搜索关键词至少 2 个字符"}), 400

    cached = cache_get("spot_all")
    if not cached:
        try:
            df = ak.stock_zh_a_spot_em()
            records = []
            for _, row in df.iterrows():
                records.append({
                    "code": str(row["代码"]),
                    "name": str(row["名称"]),
                })
            cached = {"code": 0, "data": records}
            cache_set("spot_all_names", cached, ttl=60)
        except Exception as e:
            return jsonify({"code": -1, "msg": str(e)}), 500
    else:
        # 只取代码和名称
        records = [{"code": r["code"], "name": r["name"]} for r in cached.get("data", [])]

    matches = [r for r in records if q.upper() in r["code"].upper() or q in r["name"]]
    return jsonify({"code": 0, "data": matches[:20]})


# ============ 启动 ============
if __name__ == "__main__":
    print("🚀 智投罗盘 - AKShare 行情服务启动中...")
    print("   端口: 8765")
    print("   接口: GET /api/spot       - 全部A股实时行情")
    print("         GET /api/spot/000001 - 单股实时行情")
    print("         GET /api/kline?code=000001&start=20240101 - 历史K线")
    print("         GET /api/search?q=平安 - 股票搜索")
    print("         GET /api/health       - 健康检查")
    app.run(host="0.0.0.0", port=8765, debug=False)
