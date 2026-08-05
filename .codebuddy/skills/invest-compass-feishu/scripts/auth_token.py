#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 OAuth code 换取 user_access_token，并缓存到 feishu_token_cache.json

用法: python auth_token.py <code>
"""
import sys, os, io, json, time, requests
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 动态加载 feishu_token
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import feishu_token as ft

def main():
    if len(sys.argv) < 2:
        print("用法: python auth_token.py <code>")
        sys.exit(1)
    code = sys.argv[1].strip()

    # 1. 获取 app_access_token 作为 app token
    try:
        app_token = ft.get_app_access_token()
        print(f"✅ app_access_token 获取成功")
    except Exception as e:
        print(f"❌ 获取 app_access_token 失败: {e}")
        sys.exit(1)

    # 2. 用 code 换取 user_access_token
    # 飞书需要先用 app_access_token 换取 app_ticket，再用 app_ticket 换 user token
    # 简化：直接使用 app_access_token 作为 app token 调用
    url = "https://open.feishu.cn/open-apis/authen/v1/oidc/access_token"
    body = {
        "grant_type": "authorization_code",
        "code": code,
    }
    h = {
        "Authorization": f"Bearer {app_token}",
        "Content-Type": "application/json; charset=utf-8",
    }
    s = requests.Session()
    s.trust_env = False
    r = s.post(url, headers=h, json=body, timeout=30)
    d = r.json()
    print(f"响应: code={d.get('code')} msg={d.get('msg')}")
    if d.get("code") != 0:
        print(f"❌ 换取 user token 失败: {json.dumps(d, ensure_ascii=False)}")
        # 尝试另一个接口：直接换 token（新版）
        print("尝试备用接口 ...")
        url2 = "https://open.feishu.cn/open-apis/authen/v1/access_token"
        r2 = s.post(url2, headers=h, json=body, timeout=30)
        d2 = r2.json()
        print(f"备用响应: code={d2.get('code')} msg={d2.get('msg')}")
        if d2.get("code") == 0:
            tok = d2["data"]["access_token"]
            ft._save_cache({"user_access_token": tok, "user_access_token_expire": time.time() + d2["data"].get("expires_in", 7200)})
            print(f"✅ 备用接口成功! user token 前20字符: {tok[:20]}...")
            return
        sys.exit(1)

    tok = d["data"]["access_token"]
    ft._save_cache({"user_access_token": tok, "user_access_token_expire": time.time() + d["data"].get("expires_in", 7200)})
    print(f"✅ user_access_token 换取成功! 前20字符: {tok[:20]}...")
    print("已缓存到 feishu_token_cache.json")

if __name__ == "__main__":
    main()
