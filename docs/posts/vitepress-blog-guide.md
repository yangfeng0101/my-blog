---
title: VitePress 搭建个人博客完全指南
date: 2026-03-28
summary: 从零开始使用 VitePress 搭建一个炫酷的个人技术博客，包括主题定制、自动部署等内容。
tags: [前端, Vue, 教程]
---

# VitePress 搭建个人博客完全指南

## 为什么选 VitePress？

对比了一圈静态博客生成器：

| 工具 | 优点 | 缺点 |
|------|------|------|
| **VitePress** | Vue 生态、极速、Markdown 友好 | 主题定制稍复杂 |
| Hugo | 极快、模板丰富 | Go 模板语法劝退 |
| Hexo | 插件多、社区大 | 性能一般、依赖多 |
| Astro | 灵活、多框架支持 | 学习成本高 |

VitePress 胜在 **快 + Vue + Markdown** 三合一。

## 快速开始

```bash
# 创建项目
npm init -y
npm install -D vitepress vue

# 添加脚本
npx vitepress dev docs    # 开发
npx vitepress build docs  # 构建
```

## 目录结构

```
docs/
├── .vitepress/
│   ├── config.mts         # 站点配置
│   └── theme/
│       ├── index.ts       # 主题入口
│       ├── style.css      # 全局样式
│       └── *.vue          # 自定义组件
├── posts/
│   ├── index.md           # 文章列表
│   ├── posts.data.js      # 数据加载器
│   └── *.md               # 博客文章
└── index.md               # 首页
```

## 主题定制技巧

### 暗色配色方案

```css
:root {
  --vp-c-bg: #0a0a0f;
  --vp-c-text-1: #e8e8e8;
  --vp-c-brand-1: #00f5a0;
}
```

### 自定义 Hero 组件

用 Vue 组件替换 VitePress 默认 Hero，实现粒子动画、渐变文字等效果。

## 部署到 GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: docs/.vitepress/dist
```

## 总结

整个过程不到 1 小时，效果满意。后续计划加入：

- [ ] 评论系统（Giscus）
- [ ] RSS 订阅
- [ ] 文章搜索优化
- [ ] 暗色/亮色切换动画

---

*有问题欢迎交流！*
