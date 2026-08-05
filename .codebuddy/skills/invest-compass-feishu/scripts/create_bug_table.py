#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""创建 Bug 跟踪多维表格 + 更新入口文档字段说明"""
import sys, os, io, requests, json, importlib.util, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

LOG = r"E:\ai_project\invest_compass\invest-compass\bt_output.log"
def log(msg):
    print(msg, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

spec = importlib.util.spec_from_file_location("ft", r"E:\ai_project\invest_compass\invest-compass\.codebuddy\skills\invest-compass-feishu\scripts\feishu_token.py")
ft = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ft)
t = ft.get_valid_token()
h = {"Authorization": f"Bearer {t}", "Content-Type": "application/json; charset=utf-8"}
s = requests.Session()
s.trust_env = False

BASE_APP = "UA56b3qBgaGpHpsRcQncqLiQnBb"
ENTRY_DOC = "ZVhldiq80ofnNCx0nX6cfTWWn8d"

# ========== Step 1: 创建空表 ==========
log("🚧 创建 Bug 跟踪多维表格...")

# 先查已有表格避免重复创建
r = s.get(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{BASE_APP}/tables", headers=h, timeout=30)
existing = r.json().get("data", {}).get("items", [])
for tb in existing:
    log(f"  已有表格: {tb.get('name')} ({tb.get('table_id')})")
    if tb.get("name") == "Bug跟踪":
        log("  Bug跟踪表格已存在，跳过创建")
        table_id = tb["table_id"]
        break
else:
    body = {"table": {"name": "Bug跟踪"}}
    r = s.post(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{BASE_APP}/tables",
               headers=h, json=body, timeout=30)
    d = r.json()
    log(f"  响应: code={d.get('code')} msg={d.get('msg')}")
    if d.get("code") != 0:
        log(f"❌ 创建空表失败: {json.dumps(d, ensure_ascii=False)}")
        sys.exit(1)
    table_id = d["data"]["table_id"]
    log(f"✅ 空表创建成功: {table_id}")

# ========== Step 2: 添加字段 ==========
log("\n📋 添加字段...")

fields_to_add = [
    ("文本", 1, None),
    ("标题", 1, None),
    ("模块", 3, {"options": [{"name": "实时资讯", "color": 0}, {"name": "投资目标", "color": 1}, {"name": "AI决策", "color": 2}, {"name": "知识学习", "color": 3}, {"name": "资产大盘", "color": 4}, {"name": "其他", "color": 5}]}),
    ("严重等级", 3, {"options": [{"name": "P0 致命", "color": 0}, {"name": "P1 严重", "color": 1}, {"name": "P2 中等", "color": 2}, {"name": "P3 轻微", "color": 3}]}),
    ("状态", 3, {"options": [{"name": "待确认", "color": 0}, {"name": "处理中", "color": 1}, {"name": "已修复", "color": 2}, {"name": "已验收", "color": 3}, {"name": "暂缓", "color": 4}]}),
    ("发现时间", 5, None),
    ("复现步骤", 1, None),
    ("提交人", 1, None),
    ("处理备注", 1, None),
]

for field_name, field_type, prop in fields_to_add:
    body = {"field_name": field_name, "type": field_type}
    if prop:
        body["property"] = prop
    r = s.post(f"https://open.feishu.cn/open-apis/bitable/v1/apps/{BASE_APP}/tables/{table_id}/fields",
               headers=h, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    d = r.json()
    if d.get("code") == 0:
        log(f"  ✅ {field_name}")
    else:
        log(f"  ❌ {field_name}: {d.get('msg')}")
    time.sleep(0.5)

log(f"\n🔗 Bug跟踪: https://rcnvdrualu35.feishu.cn/base/{BASE_APP}?table={table_id}")

# ========== Step 3: 更新入口文档 ==========
log("\n📝 更新入口文档 - 写入字段说明...")

field_explanations = [
    "Bug跟踪表格 — 字段说明",
    "",
    "📌 文本（文本·主键）— Bug 自动编号，格式 BUG-001、BUG-002 递增",
    "📌 标题（文本）— Bug 一句话概括，简洁清晰描述问题",
    "📌 模块（单选）— Bug 所属功能模块：实时资讯 / 投资目标 / AI决策 / 知识学习 / 资产大盘 / 其他",
    "📌 严重等级（单选）— P0致命（系统崩溃/数据丢失）→ P1严重（核心功能不可用）→ P2中等（功能异常但可绕行）→ P3轻微（UI/文案/体验问题）",
    "📌 状态（单选）— 待确认（刚提交）→ 处理中（正在修复）→ 已修复（开发完成待验收）→ 已验收（通过）→ 暂缓（延后处理）",
    "📌 发现时间（日期）— Bug 首次发现的时间",
    "📌 复现步骤（文本）— 详细描述 Bug 的重现条件和步骤，方便定位和修复",
    "📌 提交人（文本）— 发现并提交 Bug 的人",
    "📌 处理备注（文本）— 开发人员修复过程中的备注、分析结论、修复方案说明",
    "",
    f"📊 Bug跟踪表格链接：https://rcnvdrualu35.feishu.cn/base/{BASE_APP}?table={table_id}",
]

for line in field_explanations:
    if not line.strip():
        time.sleep(0.3)
        continue
    url = f"https://open.feishu.cn/open-apis/docx/v1/documents/{ENTRY_DOC}/blocks/{ENTRY_DOC}/children"
    body = {"children": [{"block_type": 2, "text": {"elements": [{"text_run": {"content": line}}], "style": {}}}], "index": -1}
    r2 = s.post(url, headers=h, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    if r2.json().get("code") == 0:
        log(f"  ✅ {line[:40]}...")
    else:
        log(f"  ❌ {line[:40]}: {r2.json().get('msg')}")
    time.sleep(0.5)

log(f"\n🎉 全部完成！")
log(f"🔗 入口文档: https://rcnvdrualu35.feishu.cn/docx/{ENTRY_DOC}")
