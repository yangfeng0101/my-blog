#!/bin/bash
# 一键发布所有未提交的草稿
set -e

cd "$(dirname "$0")/.."

# 查找未提交的新文章
NEW_POSTS=$(git status --porcelain docs/posts/ | grep '^??' | awk '{print $2}')

if [ -z "$NEW_POSTS" ]; then
  echo "📭 没有新文章需要发布"
  exit 0
fi

echo "📝 待发布文章:"
echo "$NEW_POSTS" | while read f; do
  TITLE=$(grep '^title:' "$f" | head -1 | sed 's/title: *//')
  echo "  - $TITLE"
done

read -p "🚀 全部发布？(Y/n): " CONFIRM
if [[ "$CONFIRM" =~ ^[Nn] ]]; then
  echo "⏸️  已取消"
  exit 0
fi

git add docs/posts/
COUNT=$(echo "$NEW_POSTS" | wc -l | tr -d ' ')
git commit -m "post: 发布 ${COUNT} 篇新文章"
git push

echo ""
echo "🎉 已发布 ${COUNT} 篇文章！约 1 分钟后上线"
