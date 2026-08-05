#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""统计文档块数量 + 测试删除子块 API"""
import sys, os, io, requests, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

tok = ft._load_cache().get("user_access_token")
BASE = "https://open.feishu.cn/open-apis"
H = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=utf-8"}
s = requests.Session(); s.trust_env = False

doc = sys.argv[1] if len(sys.argv) > 1 else "BrBvdoTDKo9p5CxPgR4cbVM7nKf"

# 读取子块
r = s.get(f"{BASE}/docx/v1/documents/{doc}/blocks/{doc}/children?page_size=500", headers=H, timeout=30)
d = r.json()
items = d.get("data", {}).get("items", [])
print(f"文档 {doc} 当前有 {len(items)} 个子块")
has_more = d.get("data", {}).get("has_more")
print(f"has_more={has_more}")

# 测试删除 API - 方法1
print("\n测试删除（start_index/end_index）...")
try:
    body = {"start_index": 0, "end_index": 0}
    r2 = s.delete(f"{BASE}/docx/v1/documents/{doc}/blocks/{doc}/children",
                  headers=H, data=json.dumps(body).encode("utf-8"), timeout=30)
    print(f"HTTP {r2.status_code}, body: {r2.text[:200]}")
except Exception as e:
    print(f"异常: {e}")
