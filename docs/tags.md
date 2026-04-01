---
layout: doc
title: 🏷️ 标签
---

# 🏷️ 标签

<script setup>
import { data as posts } from './posts/posts.data.js'
import { computed, ref } from 'vue'

const allTags = computed(() => {
  const map = {}
  posts.forEach(p => {
    (p.tags || []).forEach(t => {
      map[t] = (map[t] || 0) + 1
    })
  })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
})

const selected = ref(null)
const filteredPosts = computed(() => {
  if (!selected.value) return []
  return posts.filter(p => (p.tags || []).includes(selected.value))
})
</script>

<div class="tags-cloud">
  <button
    v-for="[tag, count] in allTags"
    :key="tag"
    class="tag-btn"
    :class="{ active: selected === tag }"
    @click="selected = selected === tag ? null : tag"
  >
    {{ tag }} <span class="count">{{ count }}</span>
  </button>
</div>

<div v-if="filteredPosts.length" class="filtered-posts">
  <h3>「{{ selected }}」相关文章</h3>
  <ul>
    <li v-for="post in filteredPosts" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span class="date">{{ post.date.text }}</span>
    </li>
  </ul>
</div>

<style scoped>
.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin: 1.5rem 0;
}
.tag-btn {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}
.tag-btn:hover, .tag-btn.active {
  border-color: rgba(0, 245, 160, 0.4);
  color: #00f5a0;
  background: rgba(0, 245, 160, 0.05);
}
.count {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-left: 0.3rem;
}
.filtered-posts {
  margin-top: 1.5rem;
}
.filtered-posts ul {
  list-style: none;
  padding: 0;
}
.filtered-posts li {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--vp-c-divider);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
</style>
