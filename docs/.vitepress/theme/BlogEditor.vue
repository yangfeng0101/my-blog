<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)
const BLOB_API = 'https://jsonblob.com/api/jsonBlob'
const BLOB_KEY = 'blog_blob_id'

onMounted(async () => {
  if (!container.value) return
  var el = container.value
  var blobId = localStorage.getItem(BLOB_KEY) || ''
  var posts = []

  // 初始化
  if (!blobId) {
    try {
      var res = await fetch(BLOB_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ posts: [] })
      })
      blobId = res.headers.get('Location').split('/').pop()
      localStorage.setItem(BLOB_KEY, blobId)
    } catch(e) { el.innerHTML = '<p class="bp-err-msg">初始化失败，请刷新重试</p>'; return }
  }

  // 加载数据
  await loadPosts()
  render()

  async function loadPosts() {
    try {
      var res = await fetch(BLOB_API + '/' + blobId, { headers: { 'Accept': 'application/json' } })
      var data = await res.json()
      posts = (data.posts || []).sort(function(a, b) { return b.createdAt - a.createdAt })
    } catch(e) { posts = [] }
  }

  async function savePosts() {
    await fetch(BLOB_API + '/' + blobId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts: posts })
    })
  }

  function render() {
    el.innerHTML = ''
      + '<div class="bp-wrap">'
      + '<div class="bp-grid">'
      +   '<div class="bp-left">'
      +     '<div class="bp-card">'
      +       '<h2 class="bp-h2">📝 写文章</h2>'
      +       '<div id="bp-result"></div>'
      +       '<label class="bp-label">标题</label>'
      +       '<input id="bp-title" placeholder="文章标题" class="bp-input" />'
      +       '<label class="bp-label">标签 <span class="bp-hint">（逗号分隔）</span></label>'
      +       '<input id="bp-tags" placeholder="前端, 教程" class="bp-input" />'
      +       '<label class="bp-label">摘要</label>'
      +       '<textarea id="bp-summary" placeholder="一句话描述" class="bp-input" rows="2"></textarea>'
      +       '<label class="bp-label">正文 <span class="bp-hint">（支持 Markdown）</span></label>'
      +       '<textarea id="bp-content" placeholder="# 标题\\n\\n正文..." class="bp-input bp-textarea" rows="12"></textarea>'
      +       '<div class="bp-actions">'
      +         '<button id="bp-publish" class="bp-btn bp-btn-primary bp-btn-lg">🚀 发布文章</button>'
      +         '<button id="bp-clear" class="bp-btn bp-btn-secondary">🗑️ 清空</button>'
      +       '</div>'
      +       '<p class="bp-hint">💡 Ctrl+Enter 快捷发布</p>'
      +     '</div>'
      +   '</div>'
      +   '<div class="bp-right">'
      +     '<div class="bp-card">'
      +       '<h2 class="bp-h2">📚 已发布 <span class="bp-count">(' + posts.length + ')</span></h2>'
      +       renderPosts()
      +     '</div>'
      +   '</div>'
      + '</div>'
      + '</div>'

    bindEvents()
  }

  function renderPosts() {
    if (!posts.length) return '<p class="bp-hint">还没有文章，写一篇吧 ✨</p>'
    var html = '<div class="bp-posts-list">'
    posts.forEach(function(p) {
      var tags = (p.tags || []).map(function(t) { return '<span class="bp-tag">' + t + '</span>' }).join('')
      html += '<div class="bp-post" data-id="' + p.id + '">'
        + '<div class="bp-post-info">'
        +   '<div class="bp-post-title">' + esc(p.title) + '</div>'
        +   '<div class="bp-post-meta"><span class="bp-date">📅 ' + p.date + '</span>' + tags + '</div>'
        +   (p.summary ? '<div class="bp-post-summary">' + esc(p.summary) + '</div>' : '')
        + '</div>'
        + '<div class="bp-post-btns">'
        +   '<button class="bp-icon bp-edit-btn" data-id="' + p.id + '" title="编辑">✏️</button>'
        +   '<button class="bp-icon bp-del-btn" data-id="' + p.id + '" title="删除">🗑️</button>'
        + '</div>'
        + '</div>'
    })
    return html + '</div>'
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML }

  function showResult(ok, msg) {
    var r = el.querySelector('#bp-result')
    if (!r) return
    r.innerHTML = '<div class="bp-alert ' + (ok ? 'bp-ok' : 'bp-err') + '">' + (ok ? '✅' : '❌') + ' ' + msg + '</div>'
    setTimeout(function() { if(r) r.innerHTML = '' }, 3000)
  }

  function today() {
    var d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'post'
  }

  function bindEvents() {
    // 发布
    el.querySelector('#bp-publish')?.addEventListener('click', async function() {
      var title = el.querySelector('#bp-title').value.trim()
      if (!title) return showResult(false, '请输入标题')

      var tags = el.querySelector('#bp-tags').value.split(/[,，、\s]+/).filter(function(t) { return t.trim() })
      var post = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: title,
        slug: slugify(title),
        tags: tags,
        summary: el.querySelector('#bp-summary').value.trim(),
        content: el.querySelector('#bp-content').value,
        date: today(),
        createdAt: Date.now(),
      }

      posts.unshift(post)
      await savePosts()
      showResult(true, '「' + title + '」发布成功！')
      el.querySelector('#bp-title').value = ''
      el.querySelector('#bp-tags').value = ''
      el.querySelector('#bp-summary').value = ''
      el.querySelector('#bp-content').value = ''
      render()
    })

    // 清空表单
    el.querySelector('#bp-clear')?.addEventListener('click', function() {
      el.querySelector('#bp-title').value = ''
      el.querySelector('#bp-tags').value = ''
      el.querySelector('#bp-summary').value = ''
      el.querySelector('#bp-content').value = ''
    })

    // Ctrl+Enter
    el.querySelector('#bp-content')?.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'Enter') el.querySelector('#bp-publish')?.click()
    })

    // 编辑
    el.querySelectorAll('.bp-edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var post = posts.find(function(p) { return p.id === btn.dataset.id })
        if (!post) return
        el.querySelector('#bp-title').value = post.title
        el.querySelector('#bp-tags').value = (post.tags || []).join(', ')
        el.querySelector('#bp-summary').value = post.summary || ''
        el.querySelector('#bp-content').value = post.content || ''
        // 删除旧的，保存时重新添加
        posts = posts.filter(function(p) { return p.id !== post.id })
        showResult(true, '编辑中，修改后点发布')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    })

    // 删除
    el.querySelectorAll('.bp-del-btn').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        var post = posts.find(function(p) { return p.id === btn.dataset.id })
        if (!post || !confirm('删除「' + post.title + '」？')) return
        posts = posts.filter(function(p) { return p.id !== post.id })
        await savePosts()
        showResult(true, '已删除')
        render()
      })
    })
  }
})
</script>

<template>
  <div ref="container"></div>
</template>

<style>
.bp-wrap { max-width: 1100px; }
.bp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 1.2rem; align-items: start; }
@media (max-width: 800px) { .bp-grid { grid-template-columns: 1fr; } }
.bp-card { background: var(--blog-card-bg); border: 1px solid var(--blog-card-border); border-radius: 14px; padding: 1.2rem; }
.bp-h2 { margin: 0 0 1rem; font-size: 1.05rem; color: var(--blog-text-1); }
.bp-count { font-size: 0.85rem; color: var(--blog-text-3); font-weight: 400; }
.bp-label { display: block; font-weight: 600; margin: 0.7rem 0 0.25rem; color: var(--blog-text-1); font-size: 0.85rem; }
.bp-hint { font-size: 0.8rem; color: var(--blog-text-3); margin: 0.2rem 0; }
.bp-input {
  width: 100%; padding: 0.5rem 0.8rem; border-radius: 8px;
  border: 1px solid var(--blog-card-border); background: var(--blog-bg);
  color: var(--blog-text-1); font-size: 0.85rem; font-family: inherit;
  box-sizing: border-box; transition: border-color 0.2s;
}
.bp-input:focus { outline: none; border-color: rgba(0,245,160,0.5); box-shadow: 0 0 0 2px rgba(0,245,160,0.1); }
textarea.bp-input { resize: vertical; }
.bp-textarea { font-family: 'SF Mono', monospace; font-size: 0.82rem; line-height: 1.5; }
.bp-actions { display: flex; gap: 0.5rem; margin: 0.8rem 0; }
.bp-btn {
  padding: 0.5rem 1.2rem; border-radius: 8px; font-size: 0.85rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit;
}
.bp-btn-primary { background: linear-gradient(135deg,#00f5a0,#00d9f5); color: #0a0a0a; box-shadow: 0 3px 12px rgba(0,245,160,0.25); }
.bp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(0,245,160,0.35); }
.bp-btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.bp-btn-secondary:hover { border-color: rgba(0,245,160,0.4); color: #00f5a0; }
.bp-btn-lg { padding: 0.6rem 1.8rem; font-size: 0.9rem; }
.bp-alert { padding: 0.5rem 0.8rem; border-radius: 8px; margin-bottom: 0.6rem; font-size: 0.85rem; }
.bp-ok { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; }
.bp-err { background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.2); color: #f43f5e; }
.bp-err-msg { color: #f43f5e; text-align: center; padding: 2rem; }
.bp-posts-list { max-height: 70vh; overflow-y: auto; }
.bp-post {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 0.7rem; border-radius: 10px; border: 1px solid var(--blog-card-border);
  background: var(--blog-bg); margin-bottom: 0.5rem; transition: all 0.2s;
}
.bp-post:hover { border-color: rgba(0,245,160,0.2); }
.bp-post-info { flex: 1; min-width: 0; }
.bp-post-title { font-size: 0.9rem; font-weight: 600; color: var(--blog-text-1); margin-bottom: 0.2rem; }
.bp-post-meta { display: flex; gap: 0.3rem; flex-wrap: wrap; align-items: center; }
.bp-date { font-size: 0.7rem; color: var(--blog-text-3); }
.bp-tag { font-size: 0.65rem; padding: 0.1rem 0.35rem; border-radius: 6px; background: rgba(168,85,247,0.1); color: #a855f7; }
.bp-post-summary { font-size: 0.78rem; color: var(--blog-text-2); margin-top: 0.3rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bp-post-btns { display: flex; gap: 0.2rem; flex-shrink: 0; margin-left: 0.5rem; }
.bp-icon { background: none; border: 1px solid transparent; border-radius: 6px; padding: 0.15rem 0.3rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; opacity: 0.4; }
.bp-post:hover .bp-icon { opacity: 1; }
.bp-icon:hover { border-color: var(--blog-card-border); opacity: 1 !important; }
.bp-posts-list::-webkit-scrollbar { width: 4px; }
.bp-posts-list::-webkit-scrollbar-thumb { background: var(--blog-scroll-thumb); border-radius: 2px; }
</style>
