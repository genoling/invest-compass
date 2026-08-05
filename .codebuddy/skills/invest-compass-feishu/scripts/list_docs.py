#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""列出项目文件夹下所有文档（含子文件夹）"""
import sys, os, io, requests, json, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

tok = ft._load_cache().get("user_access_token")
h = {"Authorization": f"Bearer {tok}"}
s = requests.Session(); s.trust_env = False

ROOT = "Bkobf2kyWlZJtTdEWymcgMq4nzd"

def list_folder(folder_token, indent=""):
    r = s.get(f"https://open.feishu.cn/open-apis/drive/v1/files?folder_token={folder_token}&page_size=50",
              headers=h, timeout=30)
    d = r.json()
    if d.get("code") != 0:
        print(f"{indent}⚠️ 读取失败: {d.get('msg')}")
        return
    for f in d.get("data", {}).get("files", []):
        name = f.get("name")
        ftype = f.get("type")
        token = f.get("token")
        if ftype == "folder":
            print(f"{indent}📁 {name} (token={token})")
            list_folder(token, indent + "  ")
        else:
            print(f"{indent}📄 {name} | token={token}")

print("项目文件夹结构：\n")
list_folder(ROOT)
