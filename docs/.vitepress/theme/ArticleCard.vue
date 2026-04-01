<script setup>
defineProps({
  title: String,
  date: String,
  summary: String,
  tags: Array,
  link: String,
})
</script>

<template>
  <a :href="link" class="article-card">
    <div class="card-glow"></div>
    <div class="card-body">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-summary">{{ summary }}</p>
      <div class="card-meta">
        <span class="card-date">{{ date }}</span>
        <div class="card-tags">
          <span v-for="tag in tags" :key="tag" class="mini-tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </a>
</template>

<style scoped>
.article-card {
  position: relative;
  display: block;
  padding: 1.5rem;
  border-radius: 14px;
  background: var(--blog-card-bg);
  border: 1px solid var(--blog-card-border);
  text-decoration: none;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.article-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 245, 160, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(0, 245, 160, var(--blog-glow-opacity));
}
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(0, 245, 160, var(--blog-glow-opacity)) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
.article-card:hover .card-glow { opacity: 1; }
.card-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--blog-text-1);
  margin: 0 0 0.5rem;
  transition: color 0.3s;
}
.article-card:hover .card-title { color: #00f5a0; }
.card-summary {
  font-size: 0.9rem;
  color: var(--blog-text-2);
  margin: 0 0 1rem;
  line-height: 1.6;
}
.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.card-date {
  font-size: 0.8rem;
  color: var(--blog-text-3);
}
.card-tags { display: flex; gap: 0.4rem; }
.mini-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.15);
}
</style>
