---
layout: doc
title: ✏️ 写博客
---

# ✏️ 写博客

<script setup>
import { ref, onMounted, computed } from 'vue'

const CONFIG_KEY = 'blog_firebase_config'
const configForm = ref({ apiKey: '', projectId: '' })
const showConfig = ref(false)
const db = ref(null)
const configured = ref(false)
let fb = null // firebase methods

const title = ref('')
const tagsInput = ref('')
const summary = ref('')
const content = ref('')
const publishing = ref(false)
const result = ref(null)
const posts = ref([])
const loading = ref(false)
const editingId = ref(null)

const slug = computed(() =>
  title.value.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
)

onMounted(async () => {
  const { initializeApp, getApps } = await import('firebase/app')
  const fs = await import('firebase/firestore')
  fb = fs

  const saved = localStorage.getItem(CONFIG_KEY)
  if (saved) {
    try {
      const cfg = JSON.parse(saved)
      configForm.value = cfg
      const app = getApps().length ? getApps()[0] : initializeApp({ apiKey: cfg.apiKey, projectId: cfg.projectId })
      db.value = fs.getFirestore(app)
      configured.value = true
      loadPosts()
    } catch(e) { console.error(e) }
  }
  if (!localStorage.getItem(CONFIG_KEY)) showConfig.value = true
})

function saveConfig() {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(configForm.value))
  location.reload()
}

async function loadPosts() {
  if (!db.value || !fb) return
  loading.value = true
  try {
    const q = fb.query(fb.collection(db.value, 'posts'), fb.orderBy('createdAt', 'desc'))
    const snap = await fb.getDocs(q)
    posts.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) { console.error(e) }
  loading.value = false
}

async function publish() {
  if (!db.value || !title.value || !fb) return
  publishing.value = true
  result.value = null

  try {
    const tags = tagsInput.value.split(/[,，、\s]+/).filter(t => t.trim())

    if (editingId.value) {
      await fb.updateDoc(fb.doc(db.value, 'posts', editingId.value), {
        title: title.value, slug: slug.value, summary: summary.value,
        content: content.value, tags, updatedAt: Date.now(),
      })
      result.value = { success: true, message: `「${title.value}」更新成功！` }
      editingId.value = null
    } else {
      await fb.addDoc(fb.collection(db.value, 'posts'), {
        title: title.value, slug: slug.value, summary: summary.value,
        content: content.value, tags,
        date: new Date().toISOString().split('T')[0], createdAt: Date.now(),
      })
      result.value = { success: true, message: `「${title.value}」发布成功！` }
    }

    title.value = ''; tagsInput.value = ''; summary.value = ''; content.value = ''
    await loadPosts()
  } catch(e) {
    result.value = { success: false, message: `失败: ${e.message}` }
  }
  publishing.value = false
  setTimeout(() => result.value = null, 3000)
}

async function remove(id, postTitle) {
  if (!confirm(`删除「${postTitle}」？`) || !fb) return
  try {
    await fb.deleteDoc(fb.doc(db.value, 'posts', id))
    if (editingId.value === id) cancelEdit()
    await loadPosts()
  } catch(e) { alert('删除失败: ' + e.message) }
}

function editPost(post) {
  editingId.value = post.id
  title.value = post.title
  tagsInput.value = (post.tags || []).join(', ')
  summary.value = post.summary || ''
  content.value = post.content || ''
}

function cancelEdit() {
  editingId.value = null
  title.value = ''; tagsInput.value = ''; summary.value = ''; content.value = ''
}
</script>

<ClientOnly>
<div class="blog-admin">

<!-- 配置弹窗 -->
<div v-if="showConfig" class="modal-overlay">
  <div class="modal-card">
    <h3>🔥 配置 Firebase</h3>
    <p class="modal-hint">1. <a href="https://console.firebase.google.com/" target="_blank">Firebase 控制台</a> → 创建项目</p>
    <p class="modal-hint">2. Firestore → 创建数据库 → 测试模式</p>
    <p class="modal-hint">3. 项目设置 → Web 应用 → 复制 config</p>
    <div class="form-group">
      <label>API Key</label>
      <input v-model="configForm.apiKey" placeholder="AIzaSy..." class="form-input" />
    </div>
    <div class="form-group">
      <label>Project ID</label>
      <input v-model="configForm.projectId" placeholder="my-blog-xxxx" class="form-input" />
    </div>
    <div class="form-actions">
      <button @click="saveConfig" class="btn btn-primary" :disabled="!configForm.apiKey || !configForm.projectId">💾 保存</button>
    </div>
  </div>
</div>

<div v-if="!configured && !showConfig" class="setup-banner">
  ⚠️ 还没配置 → <button @click="showConfig = true" class="link-btn">去配置</button>
</div>

<div v-if="result" :class="['result-banner', result.success ? 'success' : 'error']">
  {{ result.success ? '✅' : '❌' }} {{ result.message }}
  <button @click="result = null" class="result-close">✕</button>
</div>

<!-- 两栏布局 -->
<div class="two-columns">

  <!-- 左栏：写文章 -->
  <div class="left-col">
    <div class="col-header">
      <h2>{{ editingId ? '✏️ 编辑文章' : '📝 写文章' }}</h2>
      <button v-if="editingId" @click="cancelEdit" class="btn btn-secondary btn-sm">取消编辑</button>
    </div>

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
      <textarea v-model="content" placeholder="# 标题&#10;&#10;正文..." class="form-input form-content" rows="14"></textarea>
    </div>
    <div class="form-actions">
      <button @click="publish" class="btn btn-primary btn-publish" :disabled="!title || publishing || !configured">
        <span v-if="publishing" class="spinner"></span>
        {{ publishing ? '保存中...' : (editingId ? '💾 更新' : '🚀 发布') }}
      </button>
      <button @click="showConfig = true" class="btn btn-secondary btn-sm">⚙️</button>
    </div>
    <p class="hint">💡 Ctrl+Enter 快捷发布</p>
  </div>

  <!-- 右栏：已发布 -->
  <div class="right-col">
    <div class="col-header">
      <h2>📚 已发布 <span class="count">({{ posts.length }})</span></h2>
      <button @click="loadPosts" class="btn btn-secondary btn-sm" v-if="configured">🔄</button>
    </div>

    <div v-if="!configured" class="empty-hint">请先配置 Firebase</div>
    <div v-else-if="loading" class="empty-hint">加载中...</div>
    <div v-else-if="posts.length === 0" class="empty-hint">还没有文章 ✨</div>

    <div v-else class="posts-list">
      <div v-for="post in posts" :key="post.id" :class="['post-card', { editing: editingId === post.id }]">
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <div class="post-btns">
            <button @click="editPost(post)" class="icon-btn" title="编辑">✏️</button>
            <button @click="remove(post.id, post.title)" class="icon-btn" title="删除">🗑️</button>
          </div>
        </div>
        <div class="post-tags">
          <span class="post-date">📅 {{ post.date }}</span>
          <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
        <p v-if="post.summary" class="post-summary">{{ post.summary }}</p>
      </div>
    </div>
  </div>

</div>
</div>
</ClientOnly>

<style scoped>
.blog-admin { max-width: 1200px; }

/* 两栏布局 */
.two-columns {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}
@media (max-width: 860px) {
  .two-columns { grid-template-columns: 1fr; }
}
.left-col, .right-col {
  background: var(--blog-card-bg);
  border: 1px solid var(--blog-card-border);
  border-radius: 14px;
  padding: 1.2rem;
}
.col-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 1rem;
}
.col-header h2 { margin: 0; font-size: 1.1rem; color: var(--blog-text-1); }
.count { font-size: 0.85rem; color: var(--blog-text-3); font-weight: 400; }

/* 表单 */
.form-group { margin-bottom: 0.7rem; }
.form-group label { display: block; font-weight: 600; margin-bottom: 0.25rem; color: var(--blog-text-1); font-size: 0.85rem; }
.hint { font-weight: 400; font-size: 0.75rem; color: var(--blog-text-3); }
.form-input {
  width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px;
  border: 1px solid var(--blog-card-border); background: var(--blog-bg);
  color: var(--blog-text-1); font-size: 0.85rem; font-family: inherit;
  transition: border-color 0.2s; box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: rgba(0, 245, 160, 0.5); box-shadow: 0 0 0 2px rgba(0, 245, 160, 0.1); }
textarea.form-input { resize: vertical; }
.form-content { font-family: 'SF Mono', monospace; font-size: 0.82rem; line-height: 1.5; }
.form-actions { display: flex; gap: 0.5rem; margin: 0.7rem 0; align-items: center; }

/* 按钮 */
.btn {
  padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.85rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.3s; font-family: inherit;
}
.btn-primary { background: linear-gradient(135deg, #00f5a0, #00d9f5); color: #0a0a0a; box-shadow: 0 3px 12px rgba(0, 245, 160, 0.25); }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(0, 245, 160, 0.35); }
.btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.btn-secondary:hover { border-color: rgba(0, 245, 160, 0.4); color: #00f5a0; }
.btn-publish { padding: 0.55rem 1.5rem; font-size: 0.9rem; }
.btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
.link-btn { background: none; border: none; color: var(--blog-brand-cyan); cursor: pointer; text-decoration: underline; }

/* 结果 */
.result-banner {
  padding: 0.5rem 0.8rem; border-radius: 8px; margin-bottom: 0.8rem;
  display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem;
}
.result-banner.success { background: rgba(0, 245, 160, 0.08); border: 1px solid rgba(0, 245, 160, 0.2); color: #00f5a0; }
.result-banner.error { background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.2); color: #f43f5e; }
.result-close { background: none; border: none; color: inherit; cursor: pointer; margin-left: auto; }

/* 弹窗 */
.modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; }
.modal-card { background: var(--blog-card-bg); border: 1px solid var(--blog-card-border); border-radius: 14px; padding: 1.5rem; max-width: 460px; width: 90%; }
.modal-card h3 { margin: 0 0 0.6rem; color: var(--blog-text-1); }
.modal-hint { font-size: 0.8rem; color: var(--blog-text-2); margin: 0.2rem 0; }
.modal-hint a { color: var(--blog-brand-cyan); }
.setup-banner { padding: 0.6rem 0.8rem; border-radius: 8px; background: rgba(250, 204, 21, 0.08); border: 1px solid rgba(250, 204, 21, 0.2); color: #facc15; margin-bottom: 0.8rem; font-size: 0.85rem; }

/* 文章卡片 */
.posts-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 75vh; overflow-y: auto; }
.empty-hint { text-align: center; padding: 2rem; color: var(--blog-text-3); font-size: 0.85rem; }
.post-card {
  padding: 0.8rem; border-radius: 10px;
  border: 1px solid var(--blog-card-border); background: var(--blog-bg);
  transition: all 0.2s;
}
.post-card:hover { border-color: rgba(0, 245, 160, 0.2); }
.post-card.editing { border-color: rgba(0, 245, 160, 0.5); background: rgba(0, 245, 160, 0.03); }
.post-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.3rem; }
.post-title { font-size: 0.9rem; margin: 0; color: var(--blog-text-1); line-height: 1.3; flex: 1; min-width: 0; word-break: break-all; }
.post-btns { display: flex; gap: 0.2rem; flex-shrink: 0; }
.icon-btn { background: none; border: 1px solid transparent; border-radius: 6px; padding: 0.2rem 0.35rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; opacity: 0.5; }
.post-card:hover .icon-btn { opacity: 1; }
.icon-btn:hover { border-color: var(--blog-card-border); opacity: 1 !important; }
.post-tags { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.3rem; align-items: center; }
.post-date { font-size: 0.7rem; color: var(--blog-text-3); }
.post-tag { font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 6px; background: rgba(168, 85, 247, 0.1); color: #a855f7; }
.post-summary { font-size: 0.78rem; color: var(--blog-text-2); margin: 0.3rem 0 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Spinner */
.spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid transparent; border-top: 2px solid #0a0a0a; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 0.2rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 滚动条 */
.posts-list::-webkit-scrollbar { width: 4px; }
.posts-list::-webkit-scrollbar-thumb { background: var(--blog-scroll-thumb); border-radius: 2px; }
</style>
