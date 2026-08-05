#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""飞书 Token 管理（应用级 app_access_token）

使用 App ID + App Secret 获取 tenant_access_token / app_access_token，
无需用户 OAuth 授权，token 每 2 小时自动刷新并缓存。

缓存文件: <本脚本同目录>/feishu_token_cache.json
"""
import os, json, time, requests

# ============ 应用凭证（从 .env.local 或环境变量读取，不硬编码） ============
def _load_env_file():
    """从项目根目录 .env.local 读取配置（不覆盖已存在的环境变量）"""
    env = {}
    # 查找项目根目录（.codebuddy/skills/.../scripts → 向上 4 级）
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", ".."))
    env_path = os.path.join(root, ".env.local")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                key = key.strip()
                val = val.strip().strip('"').strip("'")
                if key and val and key not in os.environ:
                    env[key] = val
    return env

_env = _load_env_file()

def _get_secret(key):
    """优先取环境变量，其次取 .env.local"""
    return os.environ.get(key) or _env.get(key) or ""

# 飞书应用凭证（需在 .env.local 配置 FEISHU_APP_ID / FEISHU_APP_SECRET）
APP_ID = _get_secret("FEISHU_APP_ID")
APP_SECRET = _get_secret("FEISHU_APP_SECRET")

CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "feishu_token_cache.json")

def _load_cache():
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

def _save_cache(data):
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
    except Exception:
        pass

def get_app_access_token():
    """获取 app_access_token（应用级，可调用文档/多维表格 API）"""
    if not APP_ID or not APP_SECRET:
        raise RuntimeError(
            "未配置飞书密钥！请在项目根目录 .env.local 添加：\n"
            "  FEISHU_APP_ID=<你的App ID>\n"
            "  FEISHU_APP_SECRET=<你的App Secret>"
        )
    cache = _load_cache()
    tok = cache.get("app_access_token")
    exp = cache.get("app_access_token_expire", 0)
    if tok and time.time() < exp - 120:  # 提前 2 分钟过期
        return tok

    url = "https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal"
    body = {"app_id": APP_ID, "app_secret": APP_SECRET}
    s = requests.Session()
    s.trust_env = False
    r = s.post(url, json=body, timeout=30)
    d = r.json()
    if d.get("code") == 0:
        tok = d["app_access_token"]
        _save_cache({"app_access_token": tok, "app_access_token_expire": time.time() + d.get("expire", 7200)})
        return tok
    raise RuntimeError(f"获取 app_access_token 失败: {d.get('msg')}")

def get_valid_token():
    """兼容旧接口：返回可用于请求的 Bearer token"""
    return get_app_access_token()

def auth_user(code):
    """（可选）用 OAuth code 换取 user_access_token，返回 token 字符串"""
    url = "https://open.feishu.cn/open-apis/authen/v1/oidc/access_token"
    body = {"grant_type": "authorization_code", "code": code}
    s = requests.Session()
    s.trust_env = False
    r = s.post(url, json=body, timeout=30)
    d = r.json()
    if d.get("code") == 0:
        tok = d["data"]["access_token"]
        _save_cache({"user_access_token": tok, "user_access_token_expire": time.time() + d["data"].get("expires_in", 7200)})
        return tok
    raise RuntimeError(f"OAuth 授权失败: {d.get('msg')}")

def get_user_access_token():
    cache = _load_cache()
    return cache.get("user_access_token")


if __name__ == "__main__":
    import sys
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8") if False else sys.stdout
    print("测试获取 app_access_token...")
    try:
        tok = get_app_access_token()
        print(f"✅ 获取成功 (前 20 字符): {tok[:20]}...")
    except Exception as e:
        print(f"❌ 失败: {e}")
