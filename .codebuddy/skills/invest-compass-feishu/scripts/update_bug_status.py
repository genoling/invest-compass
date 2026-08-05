#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""更新 Bug 跟踪表 BUG-007 状态为已完成（用 user_access_token）"""
import sys, os, io, requests, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

cache = ft._load_cache()
tok = cache.get("user_access_token")
if not tok:
    print("❌ 没有 user_access_token，请先授权")
    sys.exit(1)

h = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=utf-8"}
s = requests.Session()
s.trust_env = False

APP = "UA56b3qBgaGpHpsRcQncqLiQnBb"
TBL = "tblacfXMZNwRRhhO"

# 找到 BUG-007
r = s.get(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP}/tables/{TBL}/records",
          headers=h, timeout=30)
items = r.json().get("data", {}).get("items", [])

target = None
for it in items:
    if it["fields"].get("序号") == "BUG-007":
        target = it["record_id"]
        break

if not target:
    print("❌ 未找到 BUG-007")
    sys.exit(1)

body = {
    "fields": {
        "状态": "已完成",
        "处理备注": "已开发量化模型页面（/quant）：策略管理（4种模板+启停）+回测参数配置+回测结果展示（6项指标+权益曲线+交易记录）",
    }
}
r = s.put(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{APP}/tables/{TBL}/records/{target}",
          headers=h, json=body, timeout=30)
d = r.json()
if d.get("code") == 0:
    print("✅ BUG-007 状态已更新为：已完成")
else:
    print(f"❌ 更新失败: code={d.get('code')} msg={d.get('msg')}")
