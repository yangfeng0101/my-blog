import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/my-blog/',
  title: '小白龙の博客',
  description: '记录技术、思考与生活',
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '📝 文章', link: '/posts/' },
      { text: '🏷️ 标签', link: '/tags' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com' },
    ],
    outline: { label: '目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
  },

  // Markdown 配置
  markdown: {
    lineNumbers: true,
  },
})
