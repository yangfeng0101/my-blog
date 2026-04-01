<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let animId = null

onMounted(() => {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  let w, h, particles = []

  function resize() {
    w = c.width = c.parentElement.offsetWidth
    h = c.height = c.parentElement.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  function getComputedAlpha() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--blog-particle-alpha')) || 0.5
  }

  function isDark() {
    return document.documentElement.classList.contains('dark')
  }

  class Particle {
    constructor() { this.reset() }
    reset() {
      this.x = Math.random() * w
      this.y = Math.random() * h
      this.vx = (Math.random() - 0.5) * 0.6
      this.vy = (Math.random() - 0.5) * 0.6
      this.r = Math.random() * 2 + 1
      this.alpha = Math.random() * 0.4 + 0.2
      const colors = ['#00f5a0', '#00d9f5', '#a855f7', '#f472b6', '#facc15']
      this.color = colors[Math.floor(Math.random() * colors.length)]
    }
    update() {
      this.x += this.vx
      this.y += this.vy
      if (this.x < 0 || this.x > w) this.vx *= -1
      if (this.y < 0 || this.y > h) this.vy *= -1
    }
    draw() {
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.globalAlpha = this.alpha * getComputedAlpha()
      ctx.fill()
    }
  }

  const count = Math.min(80, Math.floor(w * h / 12000))
  for (let i = 0; i < count; i++) particles.push(new Particle())

  function draw() {
    ctx.clearRect(0, 0, w, h)
    ctx.globalAlpha = 1

    const dark = isDark()
    const connAlpha = dark ? 0.08 : 0.12
    const connColor = dark ? '#ffffff' : '#333333'

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = connColor
          ctx.globalAlpha = connAlpha * (1 - dist / 150)
          ctx.stroke()
        }
      }
    }

    particles.forEach(p => { p.update(); p.draw() })
    animId = requestAnimationFrame(draw)
  }
  draw()

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
})
</script>

<template>
  <div class="hero-wrapper">
    <canvas ref="canvas" class="particles-canvas"></canvas>
    <div class="hero-content">
      <div class="hero-avatar">
        <div class="avatar-ring"></div>
        <span class="avatar-emoji">🐲</span>
      </div>
      <h1 class="hero-title">
        <span class="gradient-text">浪里小白龙</span>
      </h1>
      <p class="hero-subtitle">探索技术的边界，记录成长的足迹</p>
      <div class="hero-tags">
        <span class="tag">前端</span>
        <span class="tag">后端</span>
        <span class="tag">AI</span>
        <span class="tag">折腾</span>
      </div>
      <div class="hero-cta">
        <a href="/my-blog/posts/" class="cta-btn primary">浏览文章 →</a>
        <a href="https://github.com/yangfeng0101" class="cta-btn secondary" target="_blank">GitHub</a>
      </div>
    </div>
    <div class="scroll-hint"><span>↓</span></div>
  </div>
</template>

<style scoped>
.hero-wrapper {
  position: relative;
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--blog-hero-gradient);
  transition: background 0.3s;
}
.particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;
}
.hero-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
}
.avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #00f5a0, #00d9f5, #a855f7, #f472b6) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: spin 4s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.avatar-emoji {
  font-size: 3rem;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 0.8rem;
  font-family: var(--blog-font);
}
.gradient-text {
  background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 40%, #a855f7 70%, #f472b6 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-shift 4s ease infinite;
}
@keyframes gradient-shift {
  0%, 100% { background-position: 0% center; }
  50% { background-position: 100% center; }
}
.hero-subtitle {
  font-size: 1.25rem;
  color: var(--blog-text-2);
  margin: 0 0 1.5rem;
}
.hero-tags {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}
.tag {
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  background: var(--blog-tag-bg);
  border: 1px solid var(--blog-tag-border);
  color: var(--blog-text-2);
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}
.tag:hover {
  border-color: rgba(0, 245, 160, 0.4);
  color: #00f5a0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 245, 160, 0.15);
}
.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
.cta-btn {
  display: inline-block;
  padding: 0.7rem 1.8rem;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}
.cta-btn.primary {
  background: linear-gradient(135deg, #00f5a0, #00d9f5);
  color: #0a0a0a;
  box-shadow: 0 4px 20px rgba(0, 245, 160, 0.3);
}
.cta-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 245, 160, 0.4);
}
.cta-btn.secondary {
  background: var(--blog-tag-bg);
  border: 1px solid var(--blog-tag-border);
  color: var(--blog-text-1);
}
.cta-btn.secondary:hover {
  border-color: rgba(168, 85, 247, 0.5);
  color: #a855f7;
  transform: translateY(-3px);
}
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s ease infinite;
  color: var(--blog-text-3);
  font-size: 1.5rem;
}
@keyframes bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.5; }
  50% { transform: translateX(-50%) translateY(8px); opacity: 1; }
}
@media (max-width: 640px) {
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 1rem; }
}
</style>
