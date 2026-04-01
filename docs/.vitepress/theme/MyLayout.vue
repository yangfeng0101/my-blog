<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, ref, onMounted, watch } from 'vue'
import HeroSection from './HeroSection.vue'
import ArticleCard from './ArticleCard.vue'

const { Layout } = DefaultTheme
const { frontmatter, page } = useData()
const route = useRoute()

const isHome = computed(() => frontmatter.value.layout === 'home' || route.path === '/')
</script>

<template>
  <Layout>
    <template #home-hero-before v-if="isHome">
      <HeroSection />
    </template>
    <template #doc-before v-if="!isHome">
      <div class="doc-header-bar">
        <div class="glow-line"></div>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.doc-header-bar {
  position: relative;
  height: 3px;
  margin-bottom: 1.5rem;
}
.glow-line {
  height: 100%;
  background: linear-gradient(90deg, #00f5a0, #00d9f5, #a855f7, #f472b6);
  background-size: 300% 100%;
  animation: shimmer 3s ease infinite;
  border-radius: 2px;
}
@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
</style>
