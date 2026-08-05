#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量创建飞书项目文档。
用法: python batch_create_docs.py <文件夹Token> <模块前缀>
例:   python batch_create_docs.py xxx 01_需求管理
"""
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

# 各模块的文档清单
DOCS = {
    "01_需求管理": [
        ("产品需求规格说明书", "本文件为智投罗盘（InvestCompass）的完整产品需求基线文档。包含项目定位、功能需求、业务逻辑、验收标准等内容。"),
        ("需求矩阵表", "功能 — 模块 — 优先级对应关系表。记录每个功能点的所属模块、优先级等级、依赖关系、开发状态。"),
        ("核心业务流程图", "用户从登录到完成投资决策的完整业务流程可视化图。包括行情浏览→目标创建→持仓录入→进度追踪→AI分析→操作执行的核心路径。"),
        ("需求变更记录表", "记录所有需求变更的申请时间、变更内容、影响范围、审批结果、实施状态。"),
    ],
    "02_项目管理": [
        ("项目总体开发计划", "3 个月分阶段开发执行计划。阶段一：基础框架搭建。阶段二：核心业务功能迭代。阶段三：全流程联调与AI优化。阶段四：测试、安全加固与上线。"),
        ("迭代任务清单", "按周更新的开发任务清单。记录每个迭代周期的任务项、负责人、预估工时、实际工时、完成状态、阻塞项。"),
        ("风险评估与应对方案", "识别项目开发过程中的潜在风险，包括技术风险（API限流/免费额度超限）、管理风险（产能不足/需求膨胀）、集成风险，并给出应对预案。"),
        ("项目里程碑与验收标准", "项目关键里程碑节点定义及对应的验收标准。包括框架搭建完成、模块开发完成、联调通过、安全测试通过、上线部署完成等节点。"),
    ],
    "03_设计文档": [
        ("产品概要设计说明书", "系统整体架构设计。包括前端SPA架构、Firebase后端服务架构、第三方API集成架构、数据流设计、模块间交互关系。"),
        ("数据库设计说明书", "Firebase Firestore 数据结构设计。包括用户数据、行情数据、资讯数据、投资目标、持仓、AI分析、学习进度等集合的结构定义与索引配置。"),
        ("接口设计说明书", "第三方API接口规范（Finnhub/Alpha Vantage）与内部数据结构定义。包括行情数据格式化、AI分析请求/响应格式、前端-后端数据交互规范。"),
        ("UI交互设计规范", "页面布局规范、响应式断点定义、金融配色方案、图表组件使用规范、交互反馈标准。"),
        ("核心业务逻辑设计", "投资理念编码引擎设计、资产配置计算逻辑、再平衡判断规则、AI分析Prompt模板、目标匹配算法。"),
    ],
    "04_开发管理": [
        ("开发环境搭建指南", "本地开发环境配置步骤。包括Node.js安装、npm配置、Firebase CLI、VSCode插件推荐、环境变量配置说明。"),
        ("第三方服务集成手册", "Firebase、Finnhub、Alpha Vantage、Stripe、Gemini Pro 的接入配置细节、API密钥获取方式、免费额度说明。"),
        ("模块开发技术设计", "各模块的组件结构、状态管理、数据流、关键算法实现说明。按模块拆分，每个模块一个独立章节。"),
        ("代码规范与提交约定", "TypeScript/React代码风格规范、命名约定、Git提交信息格式、分支管理策略、PR审核标准。"),
        ("常见问题排查手册", "开发过程中遇到的常见问题及解决方案。如ESM/CJS混用、Tailwind配置异常、Firebase权限错误、构建失败等。"),
    ],
    "05_测试管理": [
        ("测试用例总表", "全功能测试用例清单。覆盖所有页面路由、用户交互、数据展示、错误处理场景。"),
        ("Bug跟踪记录表", "已发现的Bug清单。记录Bug编号、发现时间、模块、严重等级、复现步骤、修复状态。"),
        ("功能测试报告", "各模块功能测试的结果记录。包括测试环境、测试范围、测试结果、通过率、遗留问题。"),
        ("安全测试报告", "安全测试结果记录。包括Firebase安全规则验证、XSS/CSRF扫描结果、接口越权测试、敏感数据保护检查。"),
        ("性能测试报告", "性能测试结果记录。包括页面加载时间、API响应时间、并发场景下的资源占用率、优化建议。"),
    ],
    "06_上线部署": [
        ("生产环境部署方案", "生产环境部署步骤。包括Firebase Hosting配置、域名绑定、SSL证书、CI/CD流水线配置、环境变量管理。"),
        ("域名与SSL配置指南", "自定义域名配置步骤、SSL证书申请与续期、DNS解析设置、CDN加速配置。"),
        ("上线验证检查清单", "上线前需要验证的所有检查项。包括功能验证、性能验证、安全验证、兼容性验证、备份验证。"),
        ("生产环境运维手册", "日常运维指南。包括监控告警、日志查看、数据备份、故障恢复、版本回滚流程。"),
    ],
    "07_项目资产": [
        ("项目Logo与视觉素材", "项目Logo源文件、图标素材、配色方案、字体文件等视觉资源清单。"),
        ("环境变量配置清单", "所有环境变量的脱敏配置清单。包括Firebase、Finnhub、Alpha Vantage、Stripe的配置项说明。"),
        ("账号与密钥管理表", "第三方服务账号及API密钥的脱敏管理表。记录服务名称、账号、权限范围、有效期、备注。"),
    ],
}


def create_doc(title, content, folder_token):
    url = f"{BASE}/docx/v1/documents"
    body = {"title": title, "folder_token": folder_token}
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    data = r.json()
    if data.get("code") != 0:
        print(f"  ❌ 创建失败: {title} - {data.get('msg')}")
        return None
    doc_id = data["data"]["document"]["document_id"]
    print(f"  ✅ {title} → {doc_id}")
    
    # 写入一句话简介
    if content:
        time.sleep(0.5)
        add_block(session, doc_id, content)
    return doc_id


def add_block(session, doc_id, content):
    url = f"{BASE}/docx/v1/documents/{doc_id}/blocks/{doc_id}/children"
    body = {
        "children": [{
            "block_type": 2,
            "text": {
                "elements": [{"text_run": {"content": content}}],
                "style": {},
            },
        }],
        "index": -1,
    }
    r = session.post(url, headers=H, data=json.dumps(body, ensure_ascii=False).encode("utf-8"), timeout=30)
    return r


if __name__ == "__main__":
    folder_token = sys.argv[1] if len(sys.argv) > 1 else ""
    module_key = sys.argv[2] if len(sys.argv) > 2 else ""
    
    if not folder_token:
        print("用法: python batch_create_docs.py <文件夹Token> [模块名]")
        print("模块名可选：01_需求管理 / 02_项目管理 / ... / 07_项目资产")
        print("不指定模块则创建全部")
        sys.exit(1)
    
    if module_key and module_key in DOCS:
        docs = {module_key: DOCS[module_key]}
    else:
        docs = DOCS
    
    total = 0
    for module, entries in docs.items():
        print(f"\n📁 {module}")
        for title, desc in entries:
            doc_id = create_doc(title, desc, folder_token)
            if doc_id:
                total += 1
            time.sleep(1.2)  # 防限流
    
    print(f"\n✅ 完成！共创建 {total} 个文档")
