---
layout: home
title: 小白龙の博客
titleTemplate: 记录技术、思考与生活

hero:
  name: ""
  text: ""
  tagline: ""

features:
  - title: 🚀 技术探索
    details: 前端、后端、AI、DevOps... 一切有趣的技术都在这里留下足迹。
    icon: ⚡
  - title: 💭 思考沉淀
    details: 把踩过的坑、悟出的道理写下来，方便未来的自己和同行者。
    icon: 🧠
  - title: 🛠️ 造轮子
    details: 不重复造轮子，但要搞清楚轮子是怎么造的。开源项目和工具分享。
    icon: 🔧
---

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()
onMounted(() => {
  // 隐藏 VitePress 默认的 hero，因为我们用自定义的
  const hero = document.querySelector('.VPHero')
  if (hero) hero.style.display = 'none'
})
</script>
