#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""智投罗盘项目临时文件清理脚本

用法: python cleanup_tmp.py [--dry-run]

自动清理：
1. 项目根目录的临时输出（*.log, *.txt 构建输出, error.log 等）
2. 飞书/调试 skill 脚本目录中的临时测试脚本（test_*.py, debug_*.py, check_*.py, cleanup*.py 等）
3. 构建产物临时文件（build_output.txt, *.tsbuildinfo 等）

用 --dry-run 可预览将删除的文件而不实际删除。
"""
import os, sys, io, glob, argparse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# 项目根目录
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "..")
)

# 要扫描的目录
SCAN_DIRS = [
    PROJECT_ROOT,
    os.path.join(PROJECT_ROOT, ".codebuddy", "skills", "invest-compass-feishu", "scripts"),
]

# 根目录临时输出文件名模式
ROOT_TMP_PATTERNS = [
    "*_output.log",
    "*.log",
    "bt_output.txt",
    "draft_output.log",
    "error.log",
    "build_output.txt",
    "*.tsbuildinfo",
]

# skill 脚本目录中要清理的临时测试脚本
SKILL_TMP_PATTERNS = [
    "test_*.py",
    "debug_*.py",
    "check_*.py",
    "check_*.txt",
    "fix_*.py",
    "temp_*.py",
    "tmp_*.py",
    "auth_token.bat",
    "*.bat",
]

# 自身文件名（不能被清理）
SELF_NAME = os.path.basename(os.path.abspath(__file__))

def collect_files():
    """收集所有应清理的临时文件"""
    files = []

    # 1. 根目录临时输出
    for pattern in ROOT_TMP_PATTERNS:
        files.extend(glob.glob(os.path.join(PROJECT_ROOT, pattern)))

    # 2. skill 脚本目录的临时脚本
    for pattern in SKILL_TMP_PATTERNS:
        files.extend(glob.glob(os.path.join(SCAN_DIRS[1], pattern)))

    # 去重 + 排除自身
    seen = set()
    unique = []
    for f in files:
        if os.path.basename(f) == SELF_NAME:
            continue  # 不清理自身
        if f not in seen:
            seen.add(f)
            unique.append(f)
    return unique

def main():
    parser = argparse.ArgumentParser(description="清理项目临时文件")
    parser.add_argument("--dry-run", action="store_true", help="只预览不删除")
    args = parser.parse_args()

    files = collect_files()
    if not files:
        print("✅ 没有需要清理的临时文件")
        return

    print(f"发现 {len(files)} 个临时文件：")
    for f in files:
        rel = os.path.relpath(f, PROJECT_ROOT)
        print(f"  - {rel}")

    if args.dry_run:
        print("\n(dry-run 模式，未实际删除)")
        return

    print("\n清理中...")
    for f in files:
        try:
            os.remove(f)
            print(f"  ✅ 已删除: {os.path.relpath(f, PROJECT_ROOT)}")
        except Exception as e:
            print(f"  ⚠️ 删除失败 {os.path.relpath(f, PROJECT_ROOT)}: {e}")

    print(f"\n🎉 完成！共清理 {len(files)} 个文件")

if __name__ == "__main__":
    main()
