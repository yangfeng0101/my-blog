#!/bin/bash
# 用法: npm run new "文章标题" "标签1,标签2"
# 会自动创建文件、提交、推送，GitHub Actions 自动部署

set -e

TITLE="${1:?用法: npm run new \"文章标题\" \"标签1,标签2\"}"
TAGS="${2:-随笔}"
DATE=$(date +%Y-%m-%d)

# 生成文件名 slug
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-zA-Z0-9\u4e00-\u9fa5]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//')
FILE="docs/posts/${SLUG}.md"

# 格式化 tags 为 YAML 数组
TAGS_YAML=$(echo "$TAGS" | sed 's/，/,/g' | awk -F',' '{
  printf "["
  for(i=1;i<=NF;i++) {
    gsub(/^[ \t]+|[ \t]+$/, "", $i)
    if(i>1) printf ", "
    printf "%s", $i
  }
  printf "]"
}')

# 创建文章
cat > "$FILE" << EOF
---
title: ${TITLE}
date: ${DATE}
summary: 
tags: ${TAGS_YAML}
---

# ${TITLE}

在这里开始写作...
EOF

echo "✅ 已创建: $FILE"

# 用 \$EDITOR 打开编辑（如果设置了的话）
if [ -n "$EDITOR" ]; then
  echo "📝 打开编辑器..."
  "$EDITOR" "$FILE"
elif command -v code &> /dev/null; then
  code "$FILE"
fi

# 询问是否发布
read -p "🚀 现在发布？(Y/n): " CONFIRM
if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo "⏸️  已保存草稿，稍后发布可运行: npm run publish"
  exit 0
fi

# 提交并推送
cd "$(dirname "$0")/.."
git add "$FILE"
git commit -m "post: ${TITLE}"
git push

echo ""
echo "🎉 已发布！约 1 分钟后上线:"
echo "   https://yangfeng0101.github.io/my-blog/posts/${SLUG}.html"
