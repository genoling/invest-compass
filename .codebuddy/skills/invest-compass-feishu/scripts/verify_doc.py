#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检查新文档 XmWTd1ANXooyd4xz4xtcXOM9nCc 的内容"""
import sys, os, io, requests, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

tok = ft._load_cache().get("user_access_token")
h = {"Authorization": f"Bearer {tok}"}
s = requests.Session(); s.trust_env = False

DOC = "XmWTd1ANXooyd4xz4xtcXOM9nCc"
r = s.get(f"https://open.feishu.cn/open-apis/docx/v1/documents/{DOC}/blocks/{DOC}/children?page_size=500",
          headers=h, timeout=30)
items = r.json().get("data", {}).get("items", [])
print(f"新文档共 {len(items)} 个块：")
for it in items:
    for key in ("text", "todo"):
        block = it.get(key) or {}
        content = "".join(e.get("text_run", {}).get("content", "") for e in block.get("elements", []))
        if content:
            print(content[:100])
            break

# 检查重复
contents = []
for it in items:
    for key in ("text", "todo"):
        block = it.get(key) or {}
        c = "".join(e.get("text_run", {}).get("content", "") for e in block.get("elements", []))
        if c: contents.append(c)
# 简单查重
from collections import Counter
dupes = [c for c, n in Counter(contents).items() if n > 1]
print(f"\n重复块: {len(dupes)} 个" if dupes else "\n✅ 无重复内容")
for d in dupes[:5]:
    print(f"  重复: {d[:50]}")
