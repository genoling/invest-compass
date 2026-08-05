#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""删除指定的飞书文档（by file token）

用法: python delete_docs.py <token1> [token2] ...
"""
import sys, os, io, requests, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

tok = ft._load_cache().get("user_access_token")
BASE = "https://open.feishu.cn/open-apis"
H = {"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=utf-8"}
s = requests.Session(); s.trust_env = False

def delete_doc(file_token):
    # 需要 type=docx 参数指定文件类型
    r = s.delete(f"{BASE}/drive/v1/files/{file_token}?type=docx", headers=H, timeout=30)
    try:
        d = r.json()
        if d.get("code") == 0:
            print(f"✅ 已删除: {file_token}")
        else:
            print(f"❌ 删除失败 {file_token}: code={d.get('code')} msg={d.get('msg')}")
    except Exception as e:
        print(f"⚠️ {file_token}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python delete_docs.py <token1> [token2] ...")
        sys.exit(1)
    for token in sys.argv[1:]:
        delete_doc(token.strip())
