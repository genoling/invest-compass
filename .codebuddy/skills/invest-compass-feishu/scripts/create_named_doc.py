#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在指定飞书文件夹创建文档并写入内容（支持 Markdown 语法渲染为美观格式）

用法: python create_named_doc.py <folder_token> <title> <内容文件.md>

支持语法（已验证的飞书块结构）：
- # / ## / ### → heading1/2/3（block_type 3/4/5，用 headingN 字段）
- - 列表项 → bulleted_list（block_type 12，用 bullet 字段，style.level 缩进）
- --- → divider（block_type 22）
- **粗体** → 文本加粗
- 【】章节标题 → 加粗文本
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

# 飞书块类型常量
TEXT = 2
HEADING1 = 3
HEADING2 = 4
HEADING3 = 5
BULLETED_LIST = 12
DIVIDER = 22

def create_document(title, folder_token):
    url = f"{BASE}/docx/v1/documents"
    body = {"title": title, "folder_token": folder_token}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    d = r.json()
    if d.get("code") != 0:
        print(f"❌ 创建文档失败: {json.dumps(d, ensure_ascii=False)}")
        return None
    doc_id = d["data"]["document"]["document_id"]
    print(f"✅ 文档创建成功: {doc_id}")
    return doc_id

def parse_inline(text):
    """解析行内格式（**粗体**），返回飞书 elements"""
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
    """构造一个飞书块（使用已验证的正确字段结构）"""
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
    # 普通文本
    return {"block_type": TEXT, "text": {"elements": parse_inline(text), "style": {}}}

def add_blocks(doc_id, blocks):
    url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children"
    body = {"children": blocks, "index": -1}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=60)
    try:
        d = r.json()
        if d.get("code") != 0:
            print(f"  ❌ 批量写入失败 code={d.get('code')} msg={d.get('msg')}")
            return False
        return True
    except Exception as e:
        print(f"  ⚠️ 响应异常: {e}")
        return False

def parse_md(lines):
    """解析 Markdown 行为飞书块列表"""
    blocks = []
    for raw in lines:
        line = raw.rstrip("\n")
        stripped = line.strip()

        if not stripped:
            continue
        # 分割线
        if stripped in ("---", "***"):
            blocks.append(make_block(DIVIDER, ""))
            continue
        # 标题层级
        if stripped.startswith("### "):
            blocks.append(make_block(HEADING3, stripped[4:]))
            continue
        if stripped.startswith("## "):
            blocks.append(make_block(HEADING2, stripped[3:]))
            continue
        if stripped.startswith("# "):
            blocks.append(make_block(HEADING1, stripped[2:]))
            continue
        # 有序列表 → 用 bulleted_list 替代（1. 前缀保留）
        m = re.match(r"^(\d+)\.\s+(.*)", stripped)
        if m:
            blocks.append(make_block(BULLETED_LIST, f"{m.group(1)}. {m.group(2)}"))
            continue
        # 缩进列表项（嵌套）
        if line.startswith("  ") and (stripped.startswith("- ") or stripped.startswith("* ") or stripped.startswith("+")):
            blocks.append(make_block(BULLETED_LIST, stripped[2:], level=1))
            continue
        # 列表项
        if stripped.startswith("- ") or stripped.startswith("* "):
            blocks.append(make_block(BULLETED_LIST, stripped[2:], level=0))
            continue
        # 【】章节标题 → 加粗文本
        if stripped.startswith("【") and stripped.endswith("】"):
            blocks.append(make_block(TEXT, f"**{stripped}**"))
            continue
        # 普通段落
        blocks.append(make_block(TEXT, stripped))

    return blocks

def main():
    if len(sys.argv) < 4:
        print("用法: python create_named_doc.py <folder_token> <title> <内容文件.md>")
        sys.exit(1)
    folder = sys.argv[1]
    title = sys.argv[2]
    content_file = sys.argv[3]

    with open(content_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    print(f"📄 创建文档: {title}")
    doc_id = create_document(title, folder)
    if not doc_id:
        sys.exit(1)

    blocks = parse_md(lines)
    print(f"  解析出 {len(blocks)} 个块")

    # 分批次写入（每批 20 块）
    BATCH_SIZE = 20
    for i in range(0, len(blocks), BATCH_SIZE):
        batch = blocks[i : i + BATCH_SIZE]
        if add_blocks(doc_id, batch):
            print(f"  ✅ 第 {i//BATCH_SIZE+1} 批（{len(batch)} 块）")
        else:
            print(f"  ⚠️ 第 {i//BATCH_SIZE+1} 批写入失败")
        time.sleep(1.0)

    print(f"✅ 文档完成: https://rcnvdrualu35.feishu.cn/docx/{doc_id}")

if __name__ == "__main__":
    main()
