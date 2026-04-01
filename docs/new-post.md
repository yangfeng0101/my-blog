---
layout: doc
title: ✏️ 写博客
---

# ✏️ 写博客

<script setup>
import { ref, onMounted, computed } from 'vue'
import { initializeApp, getApps } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore'

// === 配置 ===
const CONFIG_KEY = 'blog_firebase_config'
const configForm = ref({ apiKey: '', projectId: '' })
const showConfig = ref(false)
const db = ref(null)
const configured = ref(false)

// === 表单 ===
const title = ref('')
const tagsInput = ref('')
const summary = ref('')
const content = ref('')
const publishing = ref(false)
const result = ref(null)
const posts = ref([])
const loading = ref(false)

const slug = computed(() =>
  title.value.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
)

onMounted(() => {
  const saved = localStorage.getItem(CONFIG_KEY)
  if (saved) {
    try {
      const cfg = JSON.parse(saved)
      configForm.value = cfg
      initFirebase(cfg)
    } catch(e) {}
  }
  if (!localStorage.getItem(CONFIG_KEY)) showConfig.value = true
})

function initFirebase(cfg) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp({
      apiKey: cfg.apiKey,
      projectId: cfg.projectId,
    })
    db.value = getFirestore(app)
    configured.value = true
    loadPosts()
  } catch(e) {
    console.error('Firebase init error:', e)
  }
}

function saveConfig() {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(configForm.value))
  initFirebase(configForm.value)
  showConfig.value = false
}

async function loadPosts() {
  if (!db.value) return
  loading.value = true
  try {
    const q = query(collection(db.value, 'posts'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { console.error(e) }
  loading.value = false
}

async function publish() {
  if (!db.value || !title.value) return
  publishing.value = true
  result.value = null

  try {
    const tags = tagsInput.value.split(/[,，、\s]+/).filter(t => t.trim())
    await addDoc(collection(db.value, 'posts'), {
      title: title.value,
      slug: slug.value,
      summary: summary.value,
      content: content.value,
      tags,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    })

    result.value = { success: true, message: `「${title.value}」发布成功！` }
    title.value = ''
    tagsInput.value = ''
    summary.value = ''
    content.value = ''
    await loadPosts()
  } catch(e) {
    result.value = { success: false, message: `发布失败: ${e.message}` }
  }
  publishing.value = false
}

async function remove(id, postTitle) {
  if (!confirm(`确认删除「${postTitle}」？`)) return
  try {
    await deleteDoc(doc(db.value, 'posts', id))
    await loadPosts()
  } catch(e) {
    alert('删除失败: ' + e.message)
  }
}

function editPost(post) {
  title.value = post.title
  tagsInput.value = (post.tags || []).join(', ')
  summary.value = post.summary || ''
  content.value = post.content || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<div class="blog-admin">

<!-- 配置弹窗 -->
<div v-if="showConfig" class="modal-overlay">
  <div class="modal-card">
    <h3>🔥 配置 Firebase</h3>
    <p class="modal-hint">1. 打开 <a href="https://console.firebase.google.com/" target="_blank">Firebase 控制台</a> → 创建项目</p>
    <p class="modal-hint">2. 左侧 Firestore → 创建数据库 → 选「测试模式」</p>
    <p class="modal-hint">3. 项目设置 → 常规 → 你的应用（Web）→ 复制 config</p>
    <div class="form-group">
      <label>API Key</label>
      <input v-model="configForm.apiKey" placeholder="AIzaSy..." class="form-input" />
    </div>
    <div class="form-group">
      <label>Project ID</label>
      <input v-model="configForm.projectId" placeholder="my-blog-xxxx" class="form-input" />
    </div>
    <div class="form-actions">
      <button @click="saveConfig" class="btn btn-primary" :disabled="!configForm.apiKey || !configForm.projectId">💾 保存配置</button>
    </div>
  </div>
</div>

<!-- 未配置提示 -->
<div v-if="!configured && !showConfig" class="setup-banner">
  ⚠️ 还没配置 Firebase → <button @click="showConfig = true" class="link-btn">去配置</button>
</div>

<!-- 结果提示 -->
<div v-if="result" :class="['result-banner', result.success ? 'success' : 'error']">
  {{ result.success ? '✅' : '❌' }} {{ result.message }}
  <button @click="result = null" class="result-close">✕</button>
</div>

<!-- 写文章 -->
<div class="form-group">
  <label>标题</label>
  <input v-model="title" placeholder="文章标题" class="form-input" @keydown.ctrl.enter="publish" />
</div>
<div class="form-group">
  <label>标签 <span class="hint">（逗号分隔）</span></label>
  <input v-model="tagsInput" placeholder="前端, 教程" class="form-input" />
</div>
<div class="form-group">
  <label>摘要</label>
  <textarea v-model="summary" placeholder="一句话描述" class="form-input" rows="2"></textarea>
</div>
<div class="form-group">
  <label>正文 <span class="hint">（Markdown）</span></label>
  <textarea v-model="content" placeholder="# 标题&#10;&#10;正文..." class="form-input form-content" rows="10"></textarea>
</div>
<div class="form-actions">
  <button @click="publish" class="btn btn-primary btn-publish" :disabled="!title || publishing || !configured">
    <span v-if="publishing" class="spinner"></span>
    {{ publishing ? '保存中...' : '🚀 发布文章' }}
  </button>
  <button @click="showConfig = true" class="btn btn-secondary btn-sm">⚙️ 配置</button>
</div>
<p class="hint">💡 Ctrl+Enter 快捷发布</p>

<!-- 已发布文章列表 -->
<div class="posts-section" v-if="configured">
  <h2>📚 已发布 <span class="count">({{ posts.length }})</span></h2>

  <div v-if="loading" class="loading">加载中...</div>

  <div v-else-if="posts.length === 0" class="empty">还没有文章，写一篇吧 ✨</div>

  <div v-else class="posts-list">
    <div v-for="post in posts" :key="post.id" class="post-item">
      <div class="post-info">
        <h3 class="post-title">{{ post.title }}</h3>
        <div class="post-meta">
          <span>📅 {{ post.date }}</span>
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
        <p class="post-summary" v-if="post.summary">{{ post.summary }}</p>
      </div>
      <div class="post-actions">
        <button @click="editPost(post)" class="action-btn" title="编辑">✏️</button>
        <button @click="remove(post.id, post.title)" class="action-btn" title="删除">🗑️</button>
      </div>
    </div>
  </div>
</div>

</div>

<style scoped>
.blog-admin { max-width: 800px; }

/* 表单 */
.form-group { margin-bottom: 0.8rem; }
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
.form-content { font-family: 'SF Mono', monospace; font-size: 0.85rem; line-height: 1.5; }
.form-actions { display: flex; gap: 0.6rem; margin: 0.8rem 0; flex-wrap: wrap; align-items: center; }

/* 按钮 */
.btn {
  padding: 0.5rem 1.2rem; border-radius: 10px; font-size: 0.9rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.3s; font-family: inherit;
}
.btn-primary { background: linear-gradient(135deg, #00f5a0, #00d9f5); color: #0a0a0a; box-shadow: 0 4px 15px rgba(0, 245, 160, 0.3); }
.btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.btn-secondary:hover { border-color: rgba(0, 245, 160, 0.4); color: #00f5a0; }
.btn-publish { padding: 0.7rem 2rem; font-size: 1rem; }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
.link-btn { background: none; border: none; color: var(--blog-brand-cyan); cursor: pointer; text-decoration: underline; font-size: inherit; }

/* 结果 */
.result-banner {
  padding: 0.7rem 1rem; border-radius: 10px; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.result-banner.success { background: rgba(0, 245, 160, 0.08); border: 1px solid rgba(0, 245, 160, 0.2); color: #00f5a0; }
.result-banner.error { background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); color: #f43f5e; }
.result-close { background: none; border: none; color: inherit; cursor: pointer; margin-left: auto; }

/* 弹窗 */
.modal-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.modal-card {
  background: var(--blog-card-bg); border: 1px solid var(--blog-card-border);
  border-radius: 16px; padding: 2rem; max-width: 520px; width: 90%;
}
.modal-card h3 { margin: 0 0 0.8rem; color: var(--blog-text-1); }
.modal-hint { font-size: 0.82rem; color: var(--blog-text-2); margin: 0.2rem 0; }
.modal-hint a { color: var(--blog-brand-cyan); }

/* 配置提示 */
.setup-banner { padding: 0.8rem 1rem; border-radius: 10px; background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.2); color: #facc15; margin-bottom: 1rem; }

/* 文章列表 */
.posts-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--blog-divider); }
.posts-section h2 { color: var(--blog-text-1); margin-bottom: 1rem; }
.count { font-size: 0.9rem; color: var(--blog-text-3); font-weight: 400; }
.loading, .empty { padding: 2rem; text-align: center; color: var(--blog-text-3); }
.post-item {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 1rem; border-radius: 12px; border: 1px solid var(--blog-card-border);
  background: var(--blog-card-bg); margin-bottom: 0.6rem; transition: all 0.2s;
}
.post-item:hover { border-color: rgba(0, 245, 160, 0.2); }
.post-info { flex: 1; min-width: 0; }
.post-title { font-size: 1rem; margin: 0 0 0.3rem; color: var(--blog-text-1); }
.post-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; font-size: 0.8rem; color: var(--blog-text-3); }
.post-tag { padding: 0.1rem 0.4rem; border-radius: 6px; background: rgba(168, 85, 247, 0.1); color: #a855f7; font-size: 0.7rem; }
.post-summary { font-size: 0.85rem; color: var(--blog-text-2); margin: 0.4rem 0 0; }
.post-actions { display: flex; gap: 0.3rem; margin-left: 0.8rem; flex-shrink: 0; }
.action-btn { background: none; border: 1px solid var(--blog-card-border); border-radius: 8px; padding: 0.3rem 0.5rem; cursor: pointer; transition: all 0.2s; font-size: 0.85rem; }
.action-btn:hover { border-color: rgba(0, 245, 160, 0.3); }

/* Spinner */
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid transparent; border-top: 2px solid #0a0a0a; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 0.3rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
