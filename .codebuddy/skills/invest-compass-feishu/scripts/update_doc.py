#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在原飞书文档上覆盖更新内容（清空重写，避免新建重复文档）

用法: python update_doc.py <document_id> <内容文件.md>

先删除文档现有所有子块，再写入新的 Markdown 内容（美观格式）。
"""
import sys, os, io, requests, json, time, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

cache = ft._load_cache()
tok = cache.get("user_access_token") or ft.get_app_access_token()

BASE = "https://open.feishu.cn/open-apis"
H = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=utf-8"}
session = requests.Session()
session.trust_env = False

TEXT = 2
HEADING1 = 3
HEADING2 = 4
HEADING3 = 5
BULLETED_LIST = 12
DIVIDER = 22

def get_all_children_count(doc_id):
    """获取文档所有一级子块数量（可能分页）"""
    count = 0
    page_token = None
    while True:
        url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children"
        params = {"page_size": 500}
        if page_token:
            params["page_token"] = page_token
        r = session.get(url, headers=H, params=params, timeout=30)
        d = r.json()
        if d.get("code") != 0:
            print(f"⚠️ 读取子块失败: {d.get('msg')}")
            break
        items = d.get("data", {}).get("items", [])
        count += len(items)
        page_token = d.get("data", {}).get("page_token")
        has_more = d.get("data", {}).get("has_more", False)
        if not has_more:
            break
    return count

def delete_children(doc_id, parent_block_id):
    """批量删除父块下的所有子块（batch_delete API）"""
    count = get_all_children_count(doc_id)
    if count == 0:
        print("  ℹ️ 文档无旧内容")
        return True
    # batch_delete：end_index 是删除数量的上限（用 5000 保证全删）
    url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{parent_block_id}/children/batch_delete"
    body = {"start_index": 0, "end_index": count}
    r = session.delete(url, headers=H, data=json.dumps(body).encode("utf-8"), timeout=60)
    try:
        d = r.json()
        if d.get("code") != 0:
            print(f"⚠️ 删除子块失败: code={d.get('code')} msg={d.get('msg')}")
            return False
        print(f"  ✅ 已清空 {count} 个旧块")
        return True
    except Exception as e:
        print(f"⚠️ 删除异常: {e}")
        return False

def parse_inline(text):
    elements = []
    parts = re.split(r"(\*\*[^*]+\*\*)", text)
    for part in parts:
        if not part:
            continue
        if part.startswith("**") and part.endswith("**"):
            elements.append({"text_run": {"content": part[2:-2], "text_element_style": {"bold": True}}})
        else:
            elements.append({"text_run": {"content": part}})
    return elements

def make_block(block_type, text, level=0):
    if block_type == DIVIDER:
        return {"block_type": DIVIDER, "divider": {}}
    if block_type == HEADING1:
        return {"block_type": HEADING1, "heading1": {"elements": parse_inline(text), "style": {}}}
    if block_type == HEADING2:
        return {"block_type": HEADING2, "heading2": {"elements": parse_inline(text), "style": {}}}
    if block_type == HEADING3:
        return {"block_type": HEADING3, "heading3": {"elements": parse_inline(text), "style": {}}}
    if block_type == BULLETED_LIST:
        return {"block_type": BULLETED_LIST, "bullet": {"elements": parse_inline(text), "style": {"level": level}}}
    return {"block_type": TEXT, "text": {"elements": parse_inline(text), "style": {}}}

def parse_md(lines):
    blocks = []
    for raw in lines:
        line = raw.rstrip("\n")
        stripped = line.strip()
        if not stripped:
            continue
        if stripped in ("---", "***"):
            blocks.append(make_block(DIVIDER, ""))
            continue
        if stripped.startswith("### "):
            blocks.append(make_block(HEADING3, stripped[4:])); continue
        if stripped.startswith("## "):
            blocks.append(make_block(HEADING2, stripped[3:])); continue
        if stripped.startswith("# "):
            blocks.append(make_block(HEADING1, stripped[2:])); continue
        m = re.match(r"^(\d+)\.\s+(.*)", stripped)
        if m:
            blocks.append(make_block(BULLETED_LIST, f"{m.group(1)}. {m.group(2)}")); continue
        if line.startswith("  ") and (stripped.startswith("- ") or stripped.startswith("* ") or stripped.startswith("+")):
            blocks.append(make_block(BULLETED_LIST, stripped[2:], level=1)); continue
        if stripped.startswith("- ") or stripped.startswith("* "):
            blocks.append(make_block(BULLETED_LIST, stripped[2:], level=0)); continue
        if stripped.startswith("【") and stripped.endswith("】"):
            blocks.append(make_block(TEXT, f"**{stripped}**")); continue
        blocks.append(make_block(TEXT, stripped))
    return blocks

def add_blocks(doc_id, blocks):
    url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children"
    body = {"children": blocks, "index": -1}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=60)
    try:
        d = r.json()
        return d.get("code") == 0
    except Exception:
        return False

def main():
    if len(sys.argv) < 3:
        print("用法: python update_doc.py <document_id> <内容文件.md>")
        sys.exit(1)
    doc_id = sys.argv[1]
    content_file = sys.argv[2]

    with open(content_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    print(f"📝 覆盖更新文档: {doc_id}")

    # 1. 清空现有内容
    print("🗑️  清空旧内容...")
    delete_children(doc_id, doc_id)
    time.sleep(1.0)

    # 2. 写入新内容
    blocks = parse_md(lines)
    print(f"📝 写入 {len(blocks)} 个新块...")
    BATCH_SIZE = 20
    for i in range(0, len(blocks), BATCH_SIZE):
        batch = blocks[i : i + BATCH_SIZE]
        if add_blocks(doc_id, batch):
            print(f"  ✅ 第 {i//BATCH_SIZE+1} 批（{len(batch)} 块）")
        else:
            print(f"  ⚠️ 第 {i//BATCH_SIZE+1} 批失败")
        time.sleep(1.0)

    print(f"✅ 文档已更新: https://rcnvdrualu35.feishu.cn/docx/{doc_id}")

if __name__ == "__main__":
    main()
