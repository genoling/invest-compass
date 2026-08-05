#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""在指定飞书文件夹中创建项目文档"""
import sys, os, io, requests, json, importlib.util
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 动态加载 feishu_token
TOKEN_MODULE = r"E:\ai_project\invest_compass\invest-compass\.codebuddy\skills\invest-compass-feishu\scripts\feishu_token.py"
spec = importlib.util.spec_from_file_location("feishu_token", TOKEN_MODULE)
ft = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ft)
get_valid_token = ft.get_valid_token

FOLDER_TOKEN = "Bkobf2kyWlZJtTdEWymcgMq4nzd"
DOC_TITLE = "智投罗盘 - 产品需求规格说明书"
BASE = "https://open.feishu.cn/open-apis"

TOKEN = get_valid_token()
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json; charset=utf-8"}

session = requests.Session()
session.trust_env = False

def create_document(title, folder_token):
    url = f"{BASE}/docx/v1/documents"
    body = {"title": title, "folder_token": folder_token}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    data = r.json()
    if data.get("code") != 0:
        print(f"创建文档失败: {json.dumps(data, ensure_ascii=False)}")
        return None
    doc_id = data["data"]["document"]["document_id"]
    print(f"✅ 文档创建成功: {doc_id}")
    print(f"🔗 https://rcnvdrualu35.feishu.cn/docx/{doc_id}")
    return doc_id

def add_block(session, doc_id, block_type, content):
    """添加内容块到文档"""
    url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children"
    body = {
        "children": [{
            "block_type": block_type,
            "text": {
                "elements": [{"text_run": {"content": content}}],
                "style": {},
            },
        }],
        "index": -1,
    }
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    try:
        result = r.json()
        if result.get("code") != 0 and result.get("code") is not None:
            print(f"  ❌ 添加失败(code={result.get('code')}): {result.get('msg')}")
            return
        return result
    except Exception:
        print(f"  ⚠️ 响应异常 (HTTP {r.status_code}): {r.text[:100]}")
        # 可能是中文内容问题，重试一次简化内容
        simple = content[:20]
        body["children"][0]["text"]["elements"][0]["text_run"]["content"] = simple
        r2 = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
        try:
            return r2.json()
        except Exception:
            print(f"  简化后仍失败 (HTTP {r2.status_code})")

def add_content_blocks(session, doc_id):
    """全部使用 text 块（type 2），用空行 + 符号区分标题"""
    sections = [
        "一、项目概述",
        "",
        "智投罗盘（InvestCompass）是一套聚焦个人投资理念落地、覆盖行情获取、目标执行、决策辅助、知识支撑完整闭环的轻量级投资决策与资产管理 MVP。",
        "",
        "二、功能模块",
        "",
        "【2.1 实时资讯】行情跑马灯（8个品种，3秒自动刷新）、分类/关键词筛选、无限滚动、K线图（1min/5min/15min）。Mock 数据可直接运行。",
        "",
        "【2.2 投资目标管理】目标创建（短/中/长期、保守/稳健/激进）、持仓管理、进度追踪、再平衡建议、操作历史。React Hook Form + Zod 校验。",
        "",
        "【2.3 AI 辅助决策】四维度分析（市场情绪/技术面/基本面/风险）、操作建议（买入/卖出/持有）、参数控制、结果复制。",
        "",
        "【2.4 知识学习】6大分类（投资理念/基础术语/技术分析/基本面/风险控制/策略案例）、难度筛选、搜索、进度统计、全文阅读。",
        "",
        "三、技术栈",
        "",
        "前端：React 18 + TypeScript + Vite + Tailwind CSS 3.x + Recharts + React Hook Form + Zod",
        "",
        "后端：Firebase（Firestore / Cloud Functions / Hosting / AI Logic）。金融数据：Finnhub + Alpha Vantage（待接入）。",
        "",
        "四、待办规划",
        "",
        "- 接入真实 Firebase Cloud Functions 替代 Mock 数据",
        "- 接入 Finnhub + Alpha Vantage 金融数据 API",
        "- 接入 Gemini Pro (Firebase AI Logic) 真实 AI 分析",
        "- 支付模块 (Stripe) 集成",
        "- GitHub CI/CD + 飞书文档同步",
    ]
    import time
    for content in sections:
        if content == "":
            time.sleep(0.5)  # 空行跳过，降速防 429
            continue
        res = add_block(session, doc_id, 2, content)
        time.sleep(0.8)  # 每次请求间隔 800ms，避免限流
        if res is not None:
            print(f"  ✓ 已添加: {content[:40]}")
        else:
            print(f"  ✗ 跳过: {content[:40]}")
    print("\n✅ 文档内容写入完成！")

if __name__ == "__main__":
    # 如果已存在文档，可直接传入 ID 追加内容
    existing_doc = sys.argv[1] if len(sys.argv) > 1 else None
    if existing_doc:
        print(f"📝 向已有文档添加内容: {existing_doc}")
        add_content_blocks(session, existing_doc)
    else:
        print("📄 创建文档中...")
        doc_id = create_document(DOC_TITLE, FOLDER_TOKEN)
        if doc_id:
            add_content_blocks(session, doc_id)
