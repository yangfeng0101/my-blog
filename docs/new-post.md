---
layout: doc
title: ✏️ 写博客
---

# ✏️ 写博客

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
  return tagsInput.value.split(/[,，、\s]+/).filter(t => t.trim()).map(t => t.trim())
})

const fullContent = computed(() => {
  const lines = ['---']
  lines.push(`title: ${title.value || '无标题'}`)
  lines.push(`date: ${today.value}`)
  if (summary.value) lines.push(`summary: ${summary.value}`)
  if (tags.value.length) lines.push(`tags: [${tags.value.join(', ')}]`)
  lines.push('---')
  lines.push('')
  lines.push(`# ${title.value || '无标题'}`)
  lines.push('')
  lines.push(content.value || '在这里开始写作...')
  return lines.join('\n')
})

function generate() {
  generated.value = true
}

async function copyContent() {
  await navigator.clipboard.writeText(fullContent.value)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
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

## 🚀 最快方式（一行命令）

在博客项目目录下运行：

```bash
npm run new "文章标题" "标签1,标签2"
```

自动完成：创建文件 → 打开编辑器 → git commit → git push → GitHub Actions 部署

---

## 📝 在线填写

<div class="new-post-form">

<div class="form-group">
  <label>标题</label>
  <input v-model="title" placeholder="例：Rust 入门指南" class="form-input" />
</div>

<div class="form-group">
  <label>标签 <span class="hint">（逗号分隔）</span></label>
  <input v-model="tagsInput" placeholder="例：Rust, 教程" class="form-input" />
</div>

<div class="form-group">
  <label>摘要</label>
  <textarea v-model="summary" placeholder="一句话描述" class="form-input" rows="2"></textarea>
</div>

<div class="form-group">
  <label>正文</label>
  <textarea v-model="content" placeholder="Markdown 内容..." class="form-input form-content" rows="10"></textarea>
</div>

<div class="form-actions">
  <button @click="generate" class="btn btn-primary" :disabled="!title">✨ 生成</button>
</div>

<div v-if="generated" class="preview-section">
  <h2>👀 预览</h2>

  <div class="preview-box">
    <pre>{{ fullContent }}</pre>
  </div>

  <div class="form-actions">
    <button @click="copyContent" class="btn btn-secondary">{{ copied ? '✅ 已复制' : '📋 复制' }}</button>
    <button @click="download" class="btn btn-secondary">⬇️ 下载</button>
  </div>

  <div class="publish-hint">
    <p>💡 复制后在博客目录粘贴到 <code>docs/posts/</code>，然后运行：</p>
    <div class="code-block">
      <code>git add -A && git commit -m "post: 新文章" && git push</code>
    </div>
  </div>
</div>

</div>

<style scoped>
.new-post-form { max-width: 800px; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.3rem; color: var(--blog-text-1); }
.hint { font-weight: 400; font-size: 0.8rem; color: var(--blog-text-3); }
.form-input {
  width: 100%; padding: 0.6rem 0.9rem; border-radius: 10px;
  border: 1px solid var(--blog-card-border); background: var(--blog-card-bg);
  color: var(--blog-text-1); font-size: 0.9rem; font-family: inherit;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: rgba(0, 245, 160, 0.5); box-shadow: 0 0 0 3px rgba(0, 245, 160, 0.1); }
textarea.form-input { resize: vertical; }
.form-content { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.85rem; line-height: 1.5; }
.form-actions { display: flex; gap: 0.6rem; margin: 1.2rem 0; flex-wrap: wrap; }
.btn {
  padding: 0.5rem 1.2rem; border-radius: 10px; font-size: 0.9rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.3s; font-family: inherit;
}
.btn-primary { background: linear-gradient(135deg, #00f5a0, #00d9f5); color: #0a0a0a; box-shadow: 0 4px 15px rgba(0, 245, 160, 0.3); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.btn-secondary:hover { border-color: rgba(0, 245, 160, 0.4); color: #00f5a0; }
.preview-section { margin-top: 1.5rem; padding-top: 1.2rem; border-top: 1px solid var(--blog-divider); }
.preview-box { background: var(--blog-card-bg); border: 1px solid var(--blog-card-border); border-radius: 12px; padding: 1rem; overflow-x: auto; }
.preview-box pre { margin: 0; white-space: pre-wrap; font-size: 0.8rem; color: var(--blog-text-2); line-height: 1.5; }
.publish-hint { margin-top: 1rem; padding: 1rem; border-radius: 10px; background: var(--blog-tag-bg); border: 1px solid var(--blog-card-border); }
.publish-hint p { margin: 0 0 0.5rem; font-size: 0.9rem; color: var(--blog-text-2); }
.code-block { background: var(--blog-card-bg); padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.85rem; }
.code-block code { color: var(--blog-brand-green); }
</style>
