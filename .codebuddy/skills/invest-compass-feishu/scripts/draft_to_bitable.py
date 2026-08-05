#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从飞书文档草稿中提取想法，整理后写入多维表格。
用法: python draft_to_bitable.py <文档ID>

草稿格式：
# 标题
- 想法1
- 想法2
"""
import sys, os, io, requests, json, importlib.util, time, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
LOG = r"E:\ai_project\invest_compass\invest-compass\draft_output.log"
def log(msg):
    print(msg, flush=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

spec = importlib.util.spec_from_file_location("ft", r"E:\ai_project\invest_compass\invest-compass\.codebuddy\skills\invest-compass-feishu\scripts\feishu_token.py")
ft = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ft)
get_valid_token = ft.get_valid_token

BASE = "https://open.feishu.cn/open-apis"
TOKEN = get_valid_token()
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json; charset=utf-8"}
session = requests.Session()
session.trust_env = False

APP = "UA56b3qBgaGpHpsRcQncqLiQnBb"
BUG_TBL = "tblacfXMZNwRRhhO"
REQ_TBL = "tblzrk8Pbsjo8yAd"


def read_draft(doc_id):
    """读取草稿文档所有块，返回 (blocks, todo_blocks_info)"""
    r = session.get(f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children?page_size=50", headers=H, timeout=30)
    try:
        data = r.json()
    except Exception as e:
        log(f"❌ JSON 解析失败: {e}, status={r.status_code}, text={r.text[:200]}")
        return None, None
    if data.get("code") != 0:
        log(f"❌ 读取草稿失败: code={data.get('code')} msg={data.get('msg')}")
        return None, None
    items = data.get("data", {}).get("items", [])
    log(f"  共读取到 {len(items)} 个 block")
    blocks = []
    todo_blocks = []  # (block_id, content) 用于勾选
    for it in items:
        bid = it.get("block_id")
        block_type = it.get("block_type")
        if block_type in (3, 2):
            content = "".join(e.get("text_run",{}).get("content","") for e in it.get("text",{}).get("elements",[]))
            if content.strip():
                blocks.append({"type": block_type, "content": content.strip()})
        elif block_type == 17:
            content = "".join(e.get("text_run",{}).get("content","") for e in it.get("todo",{}).get("elements",[]))
            done = it.get("todo",{}).get("style",{}).get("done", False)
            if content.strip():
                blocks.append({"type": 17, "content": content.strip(), "done": done})
                todo_blocks.append({"block_id": bid, "content": content.strip(), "done": done})
    return blocks, todo_blocks


def extract_ideas(blocks):
    """提取想法条目 — 智能理解模块和优先级"""
    ideas, section = [], ""
    for b in blocks:
        if b["type"] == 3:
            section = b["content"]
        elif b["type"] == 17:
            text = b["content"]
            if not text or text.startswith("✅"):
                continue

            # ===== 模块识别（基于内容理解） =====
            module = "其他"
            # 直接关键词匹配
            kw_map = [
                ("资讯","实时资讯"),("行情","实时资讯"),("K线","实时资讯"),("数据源","实时资讯"),
                ("目标","投资目标"),("持仓","投资目标"),("定投","投资目标"),("资产配置","投资目标"),
                ("AI","AI决策"),("决策","AI决策"),("分析","AI决策"),("建议","AI决策"),("推荐","AI决策"),
                ("学习","知识学习"),("知识","知识学习"),("课程","知识学习"),("教程","知识学习"),
                ("大盘","资产大盘"),("dashboard","资产大盘"),("总览","资产大盘"),
                ("量化","其他"),("模型","其他"),("回测","其他"),("策略","其他"),# 量化属于其他
                ("界面","其他"),("页面","其他"),("UI","其他"),("前端","其他"),
                ("文档","其他"),("skill","其他"),("飞书","其他"),("同步","其他"),
            ]
            for kw, m in kw_map:
                if kw.lower() in text.lower():
                    module = m
                    # 如果匹配到"其他"类型的词，继续尝试找更具体的模块
                    if m != "其他":
                        break

            # ===== 优先级识别（智能理解） =====
            sev = "P2"
            low_text = text.lower()
            # P0: 明确标 P0/p0 或表达紧急、崩溃、阻塞、丢失等
            if re.search(r'\bp0\b', low_text, re.IGNORECASE) or \
               re.search(r'p0', low_text):
                sev = "P0"
            elif any(k in low_text for k in ["崩溃","阻塞","死机","丢失","致命","停服"]):
                sev = "P0"
            # P1: 明确标 P1/p1 或表达严重、核心、重要、不可用等
            elif re.search(r'\bp1\b', low_text, re.IGNORECASE) or \
                 re.search(r'p1', low_text):
                sev = "P1"
            elif any(k in low_text for k in ["严重","核心","不可用","重要","阻塞开发"]):
                sev = "P1"
            # P2: 默认（功能缺陷、改进需求）
            # P3: 优化、UI、体验、建议等
            if any(k in low_text for k in ["优化","建议","轻微","文案","UI","体验改进","小优化"]):
                sev = "P3"
            # 但如果已经识别为 P0/P1 且包含优化词，以高优先级为准
            if sev == "P2" and any(k in low_text for k in ["优化","建议","轻微","文案"]):
                sev = "P3"

            ideas.append({
                "title": text, "module": module, "severity": sev,
                "section": section, "status": "待确认",
            })
    return ideas


def get_next_bug_number():
    """查询 Bug 跟踪表获取下一个编号"""
    r = session.get(f"{BASE}/bitable/v1/apps/{APP}/tables/{BUG_TBL}/records", headers=H, timeout=30)
    items = r.json().get("data", {}).get("items", [])
    nums = [int(it["fields"].get("序号","").split("-")[1]) for it in items if it["fields"].get("序号","").startswith("BUG-")]
    return max(nums) + 1 if nums else 1


def write_to_bug_table(ideas, next_n):
    """写入 Bug 跟踪表"""
    log(f"\n📊 写入 Bug 跟踪表（{len(ideas)} 条）...")
    for idea in ideas:
        fields = {
            "序号": f"BUG-{next_n:03d}",
            "标题": idea["title"],
            "模块": idea["module"],
            "描述": f"来源：{idea['section'] or '草稿'}",
            "优先级": idea["severity"],
            "状态": "待确认",
            "提交人": "草稿提取",
            "发现时间": int(time.time() * 1000),
            "处理备注": "",
        }
        r = session.post(f"{BASE}/bitable/v1/apps/{APP}/tables/{BUG_TBL}/records",
                         headers=H, data=json.dumps({"fields": fields}, ensure_ascii=False).encode("utf-8"), timeout=30)
        d = r.json()
        if d.get("code") == 0:
            log(f"  ✅ BUG-{next_n:03d}: {idea['title'][:40]}")
        else:
            log(f"  ❌ BUG-{next_n:03d}: {d.get('msg')}")
        next_n += 1
        time.sleep(0.3)


def add_completion_markers(todo_blocks, ideas, numbers):
    """在原有 todo 句子尾部追加 ✅ 标记（同一行）"""
    log(f"\n📝 追加完成标记（{len(ideas)} 条）...")
    matched = 0
    for todo in todo_blocks:
        if todo["done"]:
            continue
        for idea, num in zip(ideas, numbers):
            if todo["content"].strip() == idea["title"].strip():
                new_content = f"{todo['content']} ✅ 已整理 → BUG-{num:03d}"
                body = {"update_text_elements": {"elements": [{"text_run": {"content": new_content}}]}}
                url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{todo['block_id']}"
                r = session.patch(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
                if r.json().get("code") == 0:
                    log(f"  ✅ BUG-{num:03d}: 已追加到句尾")
                    matched += 1
                else:
                    log(f"  ❌ BUG-{num:03d}: 追加失败")
                time.sleep(0.5)
                break
    return matched


if __name__ == "__main__":
    doc_id = sys.argv[1] if len(sys.argv) > 1 else "Dbhudc7SEoXNsMxFZKociCL5nSd"

    log("📖 读取草稿...")
    blocks, todo_blocks = read_draft(doc_id)
    if not blocks:
        sys.exit(1)

    ideas = extract_ideas(blocks)
    if not ideas:
        log("⚠️ 草稿中未发现可提取的想法（需要是用任务列表格式写的）")
        sys.exit(0)

    log(f"\n💡 提取到 {len(ideas)} 条想法：")
    for i, idea in enumerate(ideas, 1):
        log(f"  {i}. [{idea['module']}/{idea['severity']}] {idea['title'][:50]}")

    # 写入 Bug 跟踪表
    next_n = get_next_bug_number()
    nums = list(range(next_n, next_n + len(ideas)))
    log(f"\n📊 写入 Bug 跟踪表...")
    write_to_bug_table(ideas, next_n)

    # 在草稿末尾追加已完成标记
    add_completion_markers(todo_blocks, ideas, nums)

    log(f"\n🎉 完成！共整理 {len(ideas)} 条想法")
    log(f"🔗 Bug跟踪表: https://rcnvdrualu35.feishu.cn/base/{APP}?table={BUG_TBL}")
