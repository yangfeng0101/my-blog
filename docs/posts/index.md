---
layout: doc
title: 📝 文章列表
---

# 📝 所有文章

<script setup>
import { data as posts } from './posts.data.js'
import ArticleCard from '../.vitepress/theme/ArticleCard.vue'
</script>

<div class="posts-grid">
  <ArticleCard
    v-for="post in posts"
    :key="post.url"
    :title="post.title"
    :date="post.date"
    :summary="post.summary"
    :tags="post.tags"
    :link="post.url"
  />
</div>

<style scoped>
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.2rem;
  margin-top: 1.5rem;
}
</style>
