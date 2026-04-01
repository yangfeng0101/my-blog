<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  var TOKEN_KEY = 'blog_gh_token'
  var REPO = 'yangfeng0101/my-blog'
  var token = localStorage.getItem(TOKEN_KEY) || ''

  container.value.innerHTML = render()
  bindEvents()

  function render() {
    return '<div class="bp-wrap">'
      + renderConfig()
      + '<div class="bp-grid">'
      +   '<div class="bp-left">' + renderForm() + '</div>'
      +   '<div class="bp-right"><div class="bp-card"><h2 class="bp-h2">📚 已发布</h2><div id="bp-posts-list"><p class="bp-hint">加载中...</p></div></div></div>'
      + '</div></div>'
  }

  function renderConfig() {
    if (token) return ''
    return '<div class="bp-config"><div class="bp-card">'
      + '<h3>🔑 设置 GitHub Token</h3>'
      + '<p class="bp-hint"><a href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=blog-deploy" target="_blank" style="color:#00d9f5">👉 生成 Token（勾选 repo）</a></p>'
      + '<input id="bp-token" type="password" placeholder="ghp_xxxx" class="bp-input" />'
      + '<div style="margin-top:0.8rem"><button id="bp-save-token" class="bp-btn bp-btn-primary">💾 保存</button></div>'
      + '</div></div>'
  }

  function renderForm() {
    return '<div class="bp-card">'
      + '<h2 class="bp-h2">📝 写文章</h2>'
      + '<div id="bp-result"></div>'
      + '<label class="bp-label">标题</label>'
      + '<input id="bp-title" placeholder="文章标题" class="bp-input" />'
      + '<label class="bp-label">标签 <span class="bp-hint">（逗号分隔）</span></label>'
      + '<input id="bp-tags" placeholder="前端, 教程" class="bp-input" />'
      + '<label class="bp-label">摘要</label>'
      + '<textarea id="bp-summary" placeholder="一句话描述" class="bp-input" rows="2"></textarea>'
      + '<label class="bp-label">正文 <span class="bp-hint">（Markdown）</span></label>'
      + '<textarea id="bp-content" placeholder="# 标题\\n\\n正文..." class="bp-input bp-textarea" rows="12"></textarea>'
      + '<div class="bp-actions">'
      +   '<button id="bp-publish" class="bp-btn bp-btn-primary bp-btn-lg">🚀 发布文章</button>'
      +   '<button id="bp-config-btn" class="bp-btn bp-btn-secondary">⚙️ Token</button>'
      + '</div>'
      + '<p class="bp-hint">💡 Ctrl+Enter 快捷发布</p>'
      + '</div>'
  }

  function bindEvents() {
    var el = container.value
    var saveBtn = el.querySelector('#bp-save-token')
    if (saveBtn) saveBtn.onclick = function() {
      var inp = el.querySelector('#bp-token')
      if (inp && inp.value) {
        localStorage.setItem(TOKEN_KEY, inp.value.trim())
        token = inp.value.trim()
        container.value.innerHTML = render()
        bindEvents()
        loadPosts()
      }
    }

    var cfgBtn = el.querySelector('#bp-config-btn')
    if (cfgBtn) cfgBtn.onclick = function() {
      localStorage.removeItem(TOKEN_KEY)
      token = ''
      container.value.innerHTML = render()
      bindEvents()
    }

    var pubBtn = el.querySelector('#bp-publish')
    if (pubBtn) pubBtn.onclick = publish

    var contentEl = el.querySelector('#bp-content')
    if (contentEl) contentEl.onkeydown = function(e) {
      if (e.ctrlKey && e.key === 'Enter') publish()
    }

    if (token) loadPosts()
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || 'untitled'
  }

  function today() {
    var d = new Date()
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0')
  }

  function showResult(ok, msg) {
    var el = container.value.querySelector('#bp-result')
    if (!el) return
    el.innerHTML = '<div class="bp-alert ' + (ok ? 'bp-ok' : 'bp-err') + '">' + (ok ? '✅' : '❌') + ' ' + msg + '</div>'
    setTimeout(function() { if(el) el.innerHTML = '' }, 4000)
  }

  async function publish() {
    if (!token) return showResult(false, '请先设置 Token')
    var el = container.value
    var titleEl = el.querySelector('#bp-title')
    var title = titleEl ? titleEl.value.trim() : ''
    if (!title) return showResult(false, '请输入标题')

    var tags = el.querySelector('#bp-tags')?.value || ''
    var summary = el.querySelector('#bp-summary')?.value || ''
    var content = el.querySelector('#bp-content')?.value || ''

    var tagsArr = tags.split(/[,，、\s]+/).filter(function(t) { return t.trim() })
    var slug = slugify(title)
    var md = '---\ntitle: ' + title + '\ndate: ' + today() + '\n'
    if (summary) md += 'summary: ' + summary + '\n'
    if (tagsArr.length) md += 'tags: [' + tagsArr.join(', ') + ']\n'
    md += '---\n\n' + (content || '在这里开始写作...')

    try {
      var res = await fetch('https://api.github.com/repos/' + REPO + '/contents/docs/posts/' + encodeURIComponent(slug) + '.md', {
        method: 'PUT',
        headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'post: ' + title, content: btoa(unescape(encodeURIComponent(md))) })
      })
      var data = await res.json()
      if (res.ok) {
        showResult(true, '「' + title + '」发布成功！约1分钟上线')
        titleEl.value = ''
        el.querySelector('#bp-tags').value = ''
        el.querySelector('#bp-summary').value = ''
        el.querySelector('#bp-content').value = ''
        loadPosts()
      } else {
        showResult(false, data.message || '发布失败')
      }
    } catch(e) { showResult(false, '网络错误: ' + e.message) }
  }

  async function loadPosts() {
    var el = container.value.querySelector('#bp-posts-list')
    if (!el) return
    try {
      var res = await fetch('https://api.github.com/repos/' + REPO + '/contents/docs/posts', {
        headers: { 'Authorization': 'token ' + token }
      })
      var files = await res.json()
      if (!Array.isArray(files)) { el.innerHTML = '<p class="bp-hint">加载失败</p>'; return }

      var posts = files.filter(function(f) { return f.name.endsWith('.md') && f.name !== 'index.md' })
      if (!posts.length) { el.innerHTML = '<p class="bp-hint">还没有文章 ✨</p>'; return }

      var html = ''
      posts.forEach(function(p) {
        var name = p.name.replace('.md', '')
        html += '<div class="bp-post">'
        + '<div class="bp-post-title">' + decodeURIComponent(name) + '</div>'
        + '<div class="bp-post-actions">'
        + '<button class="bp-icon bp-del" data-name="' + encodeURIComponent(p.name) + '" data-sha="' + p.sha + '" title="删除">🗑️</button>'
        + '</div></div>'
      })
      el.innerHTML = html

      el.querySelectorAll('.bp-del').forEach(function(btn) {
        btn.onclick = async function() {
          var n = btn.dataset.name
          var s = btn.dataset.sha
          if (!confirm('确认删除 ' + decodeURIComponent(n.replace('.md','')) + ' ？')) return
          try {
            var r = await fetch('https://api.github.com/repos/' + REPO + '/contents/docs/posts/' + n, {
              method: 'DELETE',
              headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'delete: ' + decodeURIComponent(n), sha: s })
            })
            if (r.ok) { showResult(true, '已删除'); loadPosts() }
            else { var d = await r.json(); showResult(false, d.message || '删除失败') }
          } catch(e) { showResult(false, '删除失败') }
        }
      })
    } catch(e) { el.innerHTML = '<p class="bp-hint">加载失败</p>' }
  }
})
</script>

<template>
  <div ref="container"></div>
</template>

<style>
.bp-wrap { max-width: 1100px; }
.bp-grid { display: grid; grid-template-columns: 1fr 340px; gap: 1.2rem; align-items: start; }
@media (max-width: 800px) { .bp-grid { grid-template-columns: 1fr; } }
.bp-left, .bp-right { min-width: 0; }
.bp-card { background: var(--blog-card-bg); border: 1px solid var(--blog-card-border); border-radius: 14px; padding: 1.2rem; }
.bp-config { margin-bottom: 1rem; }
.bp-h2 { margin: 0 0 1rem; font-size: 1.05rem; color: var(--blog-text-1); }
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
  padding: 0.45rem 1rem; border-radius: 8px; font-size: 0.85rem;
  font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; font-family: inherit;
}
.bp-btn-primary { background: linear-gradient(135deg,#00f5a0,#00d9f5); color: #0a0a0a; box-shadow: 0 3px 12px rgba(0,245,160,0.25); }
.bp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(0,245,160,0.35); }
.bp-btn-secondary { background: var(--blog-tag-bg); border: 1px solid var(--blog-tag-border); color: var(--blog-text-1); }
.bp-btn-secondary:hover { border-color: rgba(0,245,160,0.4); color: #00f5a0; }
.bp-btn-lg { padding: 0.55rem 1.5rem; font-size: 0.9rem; }
.bp-alert { padding: 0.5rem 0.8rem; border-radius: 8px; margin-bottom: 0.6rem; font-size: 0.85rem; }
.bp-ok { background: rgba(0,245,160,0.08); border: 1px solid rgba(0,245,160,0.2); color: #00f5a0; }
.bp-err { background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.2); color: #f43f5e; }
.bp-post { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--blog-divider); }
.bp-post:last-child { border-bottom: none; }
.bp-post-title { font-size: 0.85rem; color: var(--blog-text-1); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bp-post-actions { display: flex; gap: 0.2rem; flex-shrink: 0; }
.bp-icon { background: none; border: 1px solid transparent; border-radius: 6px; padding: 0.15rem 0.3rem; cursor: pointer; font-size: 0.75rem; transition: all 0.2s; }
.bp-icon:hover { border-color: var(--blog-card-border); }
</style>
