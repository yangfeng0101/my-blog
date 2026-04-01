---
layout: doc
title: ✏️ 写博客
---

# ✏️ 写博客

在下面填写信息，一键生成博客文章。

<script setup>
import { ref, computed } from 'vue'

const title = ref('')
const tagsInput = ref('')
const summary = ref('')
const content = ref('')
const generated = ref(false)
const copied = ref(false)

const slug = computed(() => {
  return title.value
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '') || 'untitled'
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

const tags = computed(() => {
  return tagsInput.value
    .split(/[,，、\s]+/)
    .filter(t => t.trim())
    .map(t => t.trim())
})

const frontmatter = computed(() => {
  const lines = ['---']
  lines.push(`title: ${title.value || '无标题'}`)
  lines.push(`date: ${today.value}`)
  if (summary.value) lines.push(`summary: ${summary.value}`)
  if (tags.value.length) lines.push(`tags: [${tags.value.join(', ')}]`)
  lines.push('---')
  return lines.join('\n')
})

const fullContent = computed(() => {
  return `${frontmatter.value}\n\n${content.value || '在这里写你的文章内容...'}`
})

const filename = computed(() => `docs/posts/${slug.value}.md`)

function generate() {
  generated.value = true
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(fullContent.value)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = fullContent.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
}

function download() {
  const blob = new Blob([fullContent.value], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug.value}.md`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<div class="new-post-form">

## 📝 文章信息

<div class="form-group">
  <label>标题</label>
  <input v-model="title" placeholder="例：如何用 Rust 写一个 HTTP 服务器" class="form-input" />
</div>

<div class="form-group">
  <label>标签 <span class="hint">（逗号分隔）</span></label>
  <input v-model="tagsInput" placeholder="例：Rust, 后端, 教程" class="form-input" />
</div>

<div class="form-group">
  <label>摘要</label>
  <textarea v-model="summary" placeholder="一句话描述文章内容" class="form-input form-textarea" rows="2"></textarea>
</div>

<div class="form-group">
  <label>正文 <span class="hint">（支持 Markdown）</span></label>
  <textarea v-model="content" placeholder="# 标题&#10;&#10;正文内容..." class="form-input form-textarea form-content" rows="12"></textarea>
</div>

<div class="form-actions">
  <button @click="generate" class="btn btn-primary" :disabled="!title">✨ 生成文章</button>
</div>

<div v-if="generated" class="preview-section">

## 👀 预览

<div class="preview-meta">
  <span class="meta-item">📁 <code>{{ filename }}</code></span>
  <span class="meta-item">📅 {{ today }}</span>
  <span v-for="tag in tags" :key="tag" class="meta-tag">{{ tag }}</span>
</div>

<div class="preview-box">
  <pre>{{ fullContent }}</pre>
</div>

<div class="form-actions">
  <button @click="copyContent" class="btn btn-secondary">{{ copied ? '✅ 已复制' : '📋 复制内容' }}</button>
  <button @click="download" class="btn btn-secondary">⬇️ 下载 .md 文件</button>
</div>

## 🚀 发布步骤

1. 将文件保存到 `docs/posts/` 目录
2. 运行 `git add -A && git commit -m "post: {{ title }}" && git push`
3. 等 GitHub Actions 自动部署（约 1 分钟）

</div>
</div>

<style scoped>
.new-post-form {
  max-width: 800px;
}
.form-group {
  margin-bottom: 1.2rem;
}
.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--blog-text-1);
}
.hint {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--blog-text-3);
}
.form-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--blog-card-border);
  background: var(--blog-card-bg);
  color: var(--blog-text-1);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: rgba(0, 245, 160, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 245, 160, 0.1);
}
.form-textarea {
  resize: vertical;
  min-height: 60px;
}
.form-content {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
}
.form-actions {
  display: flex;
  gap: 0.8rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}
.btn {
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  font-family: inherit;
}
.btn-primary {
  background: linear-gradient(135deg, #00f5a0, #00d9f5);
  color: #0a0a0a;
  box-shadow: 0 4px 15px rgba(0, 245, 160, 0.3);
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 245, 160, 0.4);
}
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-secondary {
  background: var(--blog-tag-bg);
  border: 1px solid var(--blog-tag-border);
  color: var(--blog-text-1);
}
.btn-secondary:hover {
  border-color: rgba(0, 245, 160, 0.4);
  color: #00f5a0;
}
.preview-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--blog-divider);
}
.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  margin-bottom: 1rem;
}
.meta-item {
  font-size: 0.85rem;
  color: var(--blog-text-2);
}
.meta-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.6rem;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.1);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.15);
}
.preview-box {
  background: var(--blog-card-bg);
  border: 1px solid var(--blog-card-border);
  border-radius: 12px;
  padding: 1.2rem;
  overflow-x: auto;
}
.preview-box pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.85rem;
  color: var(--blog-text-2);
  line-height: 1.6;
}
</style>
