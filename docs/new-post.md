---
layout: doc
title: ✏️ 写博客
---

# ✏️ 写博客

<script setup>
import { ref, computed, onMounted } from 'vue'

const title = ref('')
const tagsInput = ref('')
const summary = ref('')
const content = ref('')
const token = ref('')
const showToken = ref(false)
const publishing = ref(false)
const result = ref(null) // { success, message, url }

onMounted(() => {
  token.value = localStorage.getItem('blog_gh_token') || ''
})

const slug = computed(() => {
  return title.value.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
})

const tags = computed(() => tagsInput.value.split(/[,，、\s]+/).filter(t => t.trim()))

const fullContent = computed(() => {
  const lines = ['---']
  lines.push(`title: ${title.value}`)
  lines.push(`date: ${today.value}`)
  if (summary.value) lines.push(`summary: ${summary.value}`)
  if (tags.value.length) lines.push(`tags: [${tags.value.join(', ')}]`)
  lines.push('---')
  lines.push('')
  lines.push(content.value || '在这里开始写作...')
  return lines.join('\n')
})

function saveToken() {
  localStorage.setItem('blog_gh_token', token.value)
  showToken.value = false
}

async function publish() {
  if (!token.value) { showToken.value = true; return }
  if (!title.value) return

  publishing.value = true
  result.value = null

  try {
    const content = btoa(unescape(encodeURIComponent(fullContent.value)))
    const res = await fetch(`https://api.github.com/repos/yangfeng0101/my-blog/contents/docs/posts/${slug.value}.md`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `post: ${title.value}`,
        content: content,
      })
    })

    const data = await res.json()

    if (res.ok) {
      result.value = {
        success: true,
        message: '发布成功！约 1 分钟后上线',
        url: `https://yangfeng0101.github.io/my-blog/posts/${slug.value}.html`,
      }
      // 清空表单
      title.value = ''
      tagsInput.value = ''
      summary.value = ''
      content.value = ''
    } else {
      result.value = {
        success: false,
        message: data.message || '发布失败，请检查 Token 权限',
      }
    }
  } catch (e) {
    result.value = { success: false, message: `网络错误: ${e.message}` }
  }

  publishing.value = false
}
</script>

<div class="new-post-page">

<!-- Token 设置 -->
<div v-if="showToken" class="token-modal">
  <div class="token-card">
    <h3>🔑 设置 GitHub Token</h3>
    <p class="token-hint">需要一个有 <code>repo</code> 权限的 Personal Access Token</p>
    <a href="https://github.com/settings/tokens/new?scopes=repo&description=blog-deploy" target="_blank" class="token-link">👉 去生成 Token</a>
    <input v-model="token" type="password" placeholder="ghp_xxxxxxxxxxxx" class="form-input" />
    <div class="form-actions">
      <button @click="saveToken" class="btn btn-primary" :disabled="!token">💾 保存</button>
      <button @click="showToken = false" class="btn btn-secondary">取消</button>
    </div>
  </div>
</div>

<!-- 结果提示 -->
<div v-if="result" :class="['result-banner', result.success ? 'success' : 'error']">
  <span v-if="result.success">✅ {{ result.message }}</span>
  <span v-else>❌ {{ result.message }}</span>
  <a v-if="result.success && result.url" :href="result.url" target="_blank" class="result-link">查看文章 →</a>
  <button @click="result = null" class="result-close">✕</button>
</div>

<!-- 写文章表单 -->
<div class="form-group">
  <label>标题</label>
  <input v-model="title" placeholder="例：Rust 入门指南" class="form-input" @keydown.ctrl.enter="publish" />
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
  <textarea v-model="content" placeholder="Markdown 内容..." class="form-input form-content" rows="12"></textarea>
</div>

<div class="form-actions">
  <button @click="publish" class="btn btn-primary btn-publish" :disabled="!title || publishing">
    <span v-if="publishing" class="spinner"></span>
    {{ publishing ? '发布中...' : '🚀 一键发布' }}
  </button>
  <button v-if="!token" @click="showToken = true" class="btn btn-secondary btn-sm">🔑 设置 Token</button>
</div>

<p class="publish-tip">💡 Ctrl+Enter 快捷发布 | Token 保存在本地浏览器，安全不泄露</p>

</div>

<style scoped>
.new-post-page { max-width: 800px; position: relative; }
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
.form-actions { display: flex; gap: 0.6rem; margin: 1rem 0; flex-wrap: wrap; align-items: center; }
.btn {
  padding: 0.5rem 1.2rem; border-radius: 10px; font-size: 0.9rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.3s; font-family: inherit;
}
.btn-primary { background: linear-gradient(135deg, #00f5a0, #00d9f5); color: #0a0a0a; box-shadow: 0 4px 15px rgba(0, 245, 160, 0.3); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0, 245, 160, 0.4); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.btn-secondary:hover { border-color: rgba(0, 245, 160, 0.4); color: #00f5a0; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
.btn-publish { padding: 0.7rem 2rem; font-size: 1rem; }
.publish-tip { font-size: 0.8rem; color: var(--blog-text-3); margin-top: 0.5rem; }

/* 结果提示 */
.result-banner {
  padding: 0.8rem 1.2rem; border-radius: 10px; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap;
}
.result-banner.success { background: rgba(0, 245, 160, 0.08); border: 1px solid rgba(0, 245, 160, 0.2); color: #00f5a0; }
.result-banner.error { background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); color: #f43f5e; }
.result-link { color: inherit; text-decoration: underline; font-size: 0.9rem; }
.result-close { background: none; border: none; color: inherit; cursor: pointer; margin-left: auto; font-size: 1rem; }

/* Token 弹窗 */
.token-modal {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.token-card {
  background: var(--blog-card-bg); border: 1px solid var(--blog-card-border);
  border-radius: 16px; padding: 2rem; max-width: 480px; width: 90%;
}
.token-card h3 { margin: 0 0 0.5rem; color: var(--blog-text-1); }
.token-hint { font-size: 0.85rem; color: var(--blog-text-2); margin: 0 0 0.8rem; }
.token-link { display: inline-block; margin-bottom: 1rem; font-size: 0.85rem; color: var(--blog-brand-cyan); }

/* Spinner */
.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid transparent; border-top: 2px solid #0a0a0a;
  border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 0.3rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
