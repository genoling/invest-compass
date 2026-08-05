#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一键设置：在根目录创建全部文档（带前缀）+ 提取草稿到多维表格"""
import sys, os, io, requests, json, importlib.util, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

TOKEN_MODULE = r"E:\ai_project\invest_compass\invest-compass\.codebuddy\skills\invest-compass-feishu\scripts\feishu_token.py"
spec = importlib.util.spec_from_file_location("feishu_token", TOKEN_MODULE)
ft = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ft)
get_valid_token = ft.get_valid_token

BASE = "https://open.feishu.cn/open-apis"
TOKEN = get_valid_token()
H = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json; charset=utf-8"}
session = requests.Session()
session.trust_env = False

ROOT = "Bkobf2kyWlZJtTdEWymcgMq4nzd"
DRAFT = "Dbhudc7SEoXNsMxFZKociCL5nSd"
BITABLE_APP = "UA56b3qBgaGpHpsRcQncqLiQnBb"
BITABLE_TBL = "tblzrk8Pbsjo8yAd"

def create_doc(title, content, folder_token):
    url = f"{BASE}/docx/v1/documents"
    body = {"title": title, "folder_token": folder_token}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    data = r.json()
    if data.get("code") != 0:
        print(f"  ❌ {title}: {data.get('msg')}")
        return None
    doc_id = data["data"]["document"]["document_id"]
    if content:
        time.sleep(0.8)
        lines = [l.strip() for l in content.split("\n") if l.strip()]
        children = [{"block_type": 2, "text": {"elements": [{"text_run": {"content": l}}], "style": {}}} for l in lines]
        if children:
            session.post(f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children",
                         headers=H, data=json.dumps({"children": children, "index": -1}, ensure_ascii=False).encode("utf-8"), timeout=30)
    return doc_id

# ========== 所有文档定义 ==========
DOCS = [
    ("01_需求管理 - 产品需求规格说明书",
     "智投罗盘（InvestCompass）项目需求基线文档\n\n"
     "项目定位：聚焦个人投资理念落地，覆盖行情获取、目标执行、决策辅助、知识支撑的轻量级投资决策MV\n\n"
     "功能模块：\n- 实时资讯：行情跑马灯、筛选、无限滚动、K线图\n- 投资目标：创建、持仓、进度、再平衡、操作历史\n- AI决策：四维度分析、操作建议、参数控制\n- 知识学习：6大分类、搜索、进度、全文阅读\n\n"
     "技术栈：React 18 + TS + Vite + Firebase"),
    ("01_需求管理 - 需求变更记录表", "记录所有需求变更的时间、内容、影响、审批结果、实施状态。"),
    ("01_需求管理 - 需求与Bug跟踪",
     f"需求和Bug统一跟踪入口\n数据在飞书多维表格中管理：\n多维表格链接：https://rcnvdrualu35.feishu.cn/base/{BITABLE_APP}"),
    ("02_项目管理 - 项目里程碑与验收标准",
     "阶段一（1-2周）：基础框架搭建\n阶段二（3-6周）：四大模块全功能\n阶段三（7-8周）：联调与AI优化\n阶段四（9-12周）：测试、安全加固与上线"),
    ("03_设计文档 - 接口设计说明书",
     "金融数据接口：Finnhub（实时行情）+ Alpha Vantage（基本面）\n"
     "Firebase：Firestore + Cloud Functions + AI Logic\n"
     "当前：Mock数据直接运行；后续：Cloud Functions代理API调用→Firestore实时推送"),
    ("03_设计文档 - 核心业务逻辑设计",
     "目标配置引擎：风险偏好→默认配置比例，偏差超阈值→再平衡触发\n"
     "AI分析流程：用户参数+持仓+行情→Cloud Functions→Gemini Pro→四维度结果\n"
     "数据流：Mock数据→组件直接消费（当前）；API→Firestore→onSnapshot→组件（后续）"),
    ("04_开发管理 - 开发环境搭建指南",
     "1. 安装Node.js 18+\n2. cd invest-compass && npm install\n3. 复制.env.local.example为.env.local\n4. npm run dev → localhost:3000\n5. 无需API密钥即可运行（内置Mock数据）\n\n"
     "命令：npm run dev / npm run build / npx tsc --noEmit"),
    ("04_开发管理 - 第三方服务集成手册",
     "Firebase项目：invest-compass-dev\n服务：Hosting/Firestore/Cloud Functions/AI Logic\n配置：.env.local\n金融API：Finnhub + Alpha Vantage（待接入）\nAI：Gemini Pro（待接入）\n支付：Stripe扩展（后续迭代）"),
    ("05_测试管理 - 测试用例总表", "全功能测试用例清单，覆盖所有页面路由、交互、数据展示、错误处理。"),
    ("05_测试管理 - Bug跟踪记录表", "已发现Bug清单，记录编号、时间、模块、严重等级、复现步骤、修复状态。"),
    ("05_测试管理 - 功能测试报告", "各模块功能测试结果（测试环境/范围/结果/通过率/遗留问题）"),
    ("05_测试管理 - 安全测试报告", "Firebase安全规则验证、XSS/CSRF扫描、敏感数据保护检查结果。"),
    ("05_测试管理 - 性能测试报告", "页面加载时间、首屏体积、代码分片大小、优化建议。"),
    ("06_上线部署 - 生产环境部署方案",
     "npm run build生成dist目录\nnpx firebase deploy部署到Firebase Hosting\n访问https://invest-compass-dev.web.app\nSPA rewrites → index.html，静态资源缓存365天"),
    ("07_项目资产 - 项目Logo与视觉素材", "Logo：罗盘造型SVG（public/favicon.svg）\n配色：深蓝金融主题（CSS变量)\n字体：Inter（UI）/ JetBrains Mono（数字）"),
    ("07_项目资产 - 环境变量配置清单（脱敏版）",
     "VITE_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / STORAGE_BUCKET / MESSAGING_SENDER_ID / APP_ID\n已配置：invest-compass-dev\n待填：Finnhub / Alpha Vantage密钥"),
    ("07_项目资产 - 账号与密钥管理表（脱敏版）",
     "Firebase：invest-compass-dev（已配置）\nFinnhub：待注册\nAlpha Vantage：待注册\nStripe：后续\nGemini Pro：后续"),
]

def extract_and_write_draft():
    """读取草稿→提取想法→写入多维表格"""
    print("\n📖 读取草稿...")
    r = session.get(f"{BASE}/docx/v1/documents/{DRAFT}/blocks/{DRAFT}", headers=H, timeout=30)
    data = r.json()
    if data.get("code") != 0:
        print(f"  读取草稿失败: {data.get('msg')}")
        return
    
    blocks = []
    for it in data.get("data", {}).get("items", []):
        content = "".join(e.get("text_run", {}).get("content", "") for e in it.get("text", {}).get("elements", []))
        bt = it.get("block_type")
        if content.strip() and bt in (1, 2, 3):
            blocks.append({"type": bt, "content": content.strip()})
    
    # 提取想法
    ideas, section = [], ""
    for b in blocks:
        if b["type"] == 3: section = b["content"]
        elif b["content"].startswith(("- ", "• ")):
            text = b["content"].lstrip("- •").strip()
            t = "Bug" if any(k in text for k in ["bug","问题","错误"]) else "需求"
            p = "P2 中"
            if any(k in text for k in ["紧急","立刻","阻塞"]): p = "P0 紧急"
            elif any(k in text for k in ["重要","核心","优先"]): p = "P1 高"
            elif any(k in text for k in ["优化","不急","建议"]): p = "P3 低"
            ideas.append({"title": text, "type": t, "priority": p, "section": section})
    
    if not ideas:
        print("  草稿中没有想法条目（需要以 - 或 • 开头）")
        return
    
    print(f"\n💡 提取到 {len(ideas)} 条想法：")
    for i, idea in enumerate(ideas, 1):
        print(f"  {i}. [{idea['type']}/{idea['priority']}] {idea['title'][:50]}")
    
    # 写入多维表格
    print("\n📊 写入多维表格...")
    r = session.get(f"{BASE}/bitable/v1/apps/{BITABLE_APP}/tables/{BITABLE_TBL}/records", headers=H, timeout=30)
    existing = r.json().get("data", {}).get("items", [])
    nr = max([int(it["fields"].get("文本","").split("-")[1]) for it in existing if it["fields"].get("文本","").startswith("REQ-")] or [0]) + 1
    nb = max([int(it["fields"].get("文本","").split("-")[1]) for it in existing if it["fields"].get("文本","").startswith("BUG-")] or [0]) + 1
    
    for idea in ideas:
        p = "BUG" if idea["type"] == "Bug" else "REQ"
        n = nb if p == "BUG" else nr
        if p == "BUG": nb += 1
        else: nr += 1
        body = json.dumps({"fields": {
            "文本": f"{p}-{n:03d}", "标题": idea["title"], "类型": idea["type"],
            "描述": f"来源：{idea['section'] or '草稿'}", "优先级": idea["priority"],
            "状态": "待确认", "提交人": "草稿提取", "提交日期": "2026-07-26",
        }}, ensure_ascii=False)
        r2 = session.post(f"{BASE}/bitable/v1/apps/{BITABLE_APP}/tables/{BITABLE_TBL}/records",
                          headers=H, data=body.encode("utf-8"), timeout=30)
        d2 = r2.json()
        if d2.get("code") == 0:
            print(f"  ✅ {p}-{n:03d}")
        else:
            print(f"  ❌ {p}-{n:03d}: {d2.get('msg')}")
        time.sleep(0.3)
    
    print(f"\n🔗 https://rcnvdrualu35.feishu.cn/base/{BITABLE_APP}")

if __name__ == "__main__":
    print("📄 创建文档（共 {} 个）...".format(len(DOCS)))
    for title, content in DOCS:
        doc_id = create_doc(title, content, ROOT)
        if doc_id:
            print(f"  ✅ {title}")
        time.sleep(1.2)
    print("\n✅ 所有文档创建完成！请手动拖到对应文件夹。")
    
    extract_and_write_draft()
    print("\n🎉 全部完成！")
