// 写博客功能 — 纯浏览器端，无依赖
;(function() {
  function init() {
    var container = document.getElementById('blog-app')
    if (!container) return

    var TOKEN_KEY = 'blog_gh_token'
    var REPO = 'yangfeng0101/my-blog'
    var token = localStorage.getItem(TOKEN_KEY) || ''

    container.innerHTML = render()
    bindEvents()

    function render() {
      return ''
        + '<div class="bp-wrap">'
        +   renderConfig()
        +   '<div class="bp-grid">'
        +     '<div class="bp-left">' + renderForm() + '</div>'
        +     '<div class="bp-right"><div class="bp-card"><h2 class="bp-h2">📚 已发布</h2><div id="bp-posts-list"><p class="bp-hint">加载中...</p></div></div></div>'
        +   '</div>'
        + '</div>'
    }

    function renderConfig() {
      if (token) return ''
      return '<div class="bp-config">'
        + '<div class="bp-card">'
        + '<h3>🔑 设置 GitHub Token</h3>'
        + '<p class="bp-hint"><a href="https://github.com/settings/tokens/new?scopes=repo,workflow&description=blog-deploy" target="_blank" style="color:#00d9f5">👉 生成 Token（勾选 repo）</a></p>'
        + '<input id="bp-token" type="password" placeholder="ghp_xxxx" class="bp-input" />'
        + '<div style="margin-top:0.8rem"><button id="bp-save-token" class="bp-btn bp-btn-primary">💾 保存</button></div>'
        + '</div></div>'
    }

    function renderForm() {
      return ''
        + '<div class="bp-card">'
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
      var saveBtn = document.getElementById('bp-save-token')
      if (saveBtn) saveBtn.onclick = function() {
        var inp = document.getElementById('bp-token')
        if (inp && inp.value) {
          localStorage.setItem(TOKEN_KEY, inp.value.trim())
          token = inp.value.trim()
          container.innerHTML = render()
          bindEvents()
          loadPosts()
        }
      }

      var cfgBtn = document.getElementById('bp-config-btn')
      if (cfgBtn) cfgBtn.onclick = function() {
        localStorage.removeItem(TOKEN_KEY)
        token = ''
        container.innerHTML = render()
        bindEvents()
      }

      var pubBtn = document.getElementById('bp-publish')
      if (pubBtn) pubBtn.onclick = publish

      var contentEl = document.getElementById('bp-content')
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
      var el = document.getElementById('bp-result')
      if (!el) return
      el.innerHTML = '<div class="bp-alert ' + (ok ? 'bp-ok' : 'bp-err') + '">' + (ok ? '✅' : '❌') + ' ' + msg + '</div>'
      setTimeout(function() { if(el) el.innerHTML = '' }, 4000)
    }

    async function publish() {
      if (!token) return showResult(false, '请先设置 Token')
      var titleEl = document.getElementById('bp-title')
      var title = titleEl ? titleEl.value.trim() : ''
      if (!title) return showResult(false, '请输入标题')

      var tagsEl = document.getElementById('bp-tags')
      var summaryEl = document.getElementById('bp-summary')
      var contentEl = document.getElementById('bp-content')
      var tags = tagsEl ? tagsEl.value : ''
      var summary = summaryEl ? summaryEl.value : ''
      var content = contentEl ? contentEl.value : ''

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
          if (titleEl) titleEl.value = ''
          if (tagsEl) tagsEl.value = ''
          if (summaryEl) summaryEl.value = ''
          if (contentEl) contentEl.value = ''
          loadPosts()
        } else {
          showResult(false, data.message || '发布失败')
        }
      } catch(e) { showResult(false, '网络错误: ' + e.message) }
    }

    async function loadPosts() {
      var el = document.getElementById('bp-posts-list')
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
          + '<button class="bp-icon" onclick="window._bpDelete(\'' + encodeURIComponent(p.name) + '\',\'' + p.sha + '\')" title="删除">🗑️</button>'
          + '</div></div>'
        })
        el.innerHTML = html
      } catch(e) { el.innerHTML = '<p class="bp-hint">加载失败: ' + e.message + '</p>' }
    }

    window._bpDelete = async function(name, sha) {
      var decoded = decodeURIComponent(name)
      if (!confirm('确认删除 ' + decoded.replace('.md','') + ' ？')) return
      try {
        var res = await fetch('https://api.github.com/repos/' + REPO + '/contents/docs/posts/' + name, {
          method: 'DELETE',
          headers: { 'Authorization': 'token ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'delete: ' + decoded, sha: sha })
        })
        if (res.ok) {
          showResult(true, '已删除')
          loadPosts()
        } else {
          var d = await res.json()
          showResult(false, d.message || '删除失败')
        }
      } catch(e) { showResult(false, '删除失败: ' + e.message) }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
